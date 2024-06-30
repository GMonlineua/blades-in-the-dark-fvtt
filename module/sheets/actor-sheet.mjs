import { createRollDialog } from "../applications/roll.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BitdActorSheet extends ActorSheet
{

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor"],
      width: 550,
      height: 650,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "general"
      }]
    });
  }

  /** @override */
  get template() {
    let sheetTemplate = `systems/bitd/templates/actor/${this.actor.type}-sheet.hbs`;
    if ( !game.user.isGM && this.actor.limited && this.actor.type == "faction" ) {
      sheetTemplate = `systems/bitd/templates/actor/faction-limited-sheet.hbs`;
    }

    return sheetTemplate
  }

  /** @override */
  async getData() {
    const context = await super.getData();

    // Encrich editor content
    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {
      async: true,
      secrets: this.actor.isOwner
    })

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = context.actor.system;
    context.flags = context.actor.flags;
    context.config = CONFIG.BITD;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Count dot
    html.find('.value-step-block').each(function () {
      const value = Number(this.dataset.value);
      $(this)
        .find(".value-step")
        .each(function (i) {
          if (i + 1 <= value) {
            $(this).addClass("active");
          }
        });
    });

    // Show item summary
    html.find('.item-name').click(ev => {
      const button = ev.currentTarget;
      const li = button.closest(".item");
      const summary = li.getElementsByClassName("item-summary")[0];
      if (summary) {
        const contentHeight = summary.scrollHeight;
        summary.style.height = summary.classList.contains("active") ? "0" : `${contentHeight}px`;
        summary.classList.toggle("active");
      }
    });

    // Open external link
    html.on('click', 'a.actor-open[data-uuid]', this._onClickLink.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Resource dots
    html.find(".value-step-block > .value-step").click(this._onDotChange.bind(this));

    // Item checkbox in Actor Sheet
    html.find('.item-checkbox').click(this._onItemCheckbox.bind(this));

    // Add Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Show items in chat
    html.find('.item-show').click(ev => {
      const button = ev.currentTarget;
      const itemId = button.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) return item.show();
    });

    // Delete Item
    html.find('.item-delete').click(ev => {
      const button = ev.currentTarget;
      const li = button.closest(".item");
      const item = this.actor.items.get(li?.dataset.itemId);
      return item.delete();
    });

    // Delete external link
    html.on('click', 'a.actor-delete', this._onRemoveLink.bind(this));

    // Roll dice
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle clicking on a content link to preview the content.
   * @param {MouseEvent} event  The triggering event.
   * @protected
   */
  async _onClickLink(event) {
    event.preventDefault();
    const uuid = event.currentTarget.dataset.uuid;
    const content = await fromUuid(uuid);
    content?.sheet.render(true);
  }

  _onRemoveLink(event) {
    const button = event.currentTarget;
    const parent = $(button.parentNode);
    const item = parent.closest("li.item");
    const targetId = item[0].dataset.id;

    const block = button.closest(".items-list");
    const key = block.dataset.array;
    const path = "system." + key;
    const newArray = this.actor.system[key].filter(link => link.id !== targetId);

    this.actor.update({ [path]: newArray });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} the originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = foundry.utils.duplicate(header.dataset);
    const name = game.i18n.localize("BITD.NewItem");
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    const cls = getDocumentClass("Item");
    return cls.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} the originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    createRollDialog(dataset.rollType, this.actor, dataset.rollNote)
  }

  /**
   * Handle dot counter.
   * @param {Event} the originating click event
   * @private
   */
  async _onDotChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const index = Number(dataset.index);
    const parent = $(element.parentNode);
    const steps = parent.find(".value-step");
    const key = parent[0].dataset.key;

    let value = index + 1;

    const nextElement = (index === steps.length - 1) || !steps[index + 1].classList.contains("active");

    if (element.classList.contains("active") && nextElement) {
      steps.removeClass("active");
      steps.each(function (i) {
        if (i < index) {
          $(this).addClass("active");
        }
      });
      value = index;
    } else {
      steps.removeClass("active");
      steps.each(function (i) {
        if (i <= index) {
          $(this).addClass("active");
        }
      });
    }

    await this.actor.update({ [key]: value });
  }

  async _onItemCheckbox(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;
    const key = dataset.key;
    const updateKey = "system." + key;

    const parent = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(parent.data("itemId"));

    const checked = !item.system[key];
    await item.update({ [updateKey]: checked });
  }
}
