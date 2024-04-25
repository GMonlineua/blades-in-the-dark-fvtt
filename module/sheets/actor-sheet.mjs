import { createRollDialog } from "../helpers/roll.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BitdActorSheet extends ActorSheet
{

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor"],
      template: "systems/bitd/templates/actor/character-sheet.hbs",
      width: 750,
      height: 900,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "general"
      }]
    });
  }

  /** @override */
  get template() {
    if ( !game.user.isGM && this.actor.limited ) return `systems/bitd/templates/actor/${this.actor.type}-limited-sheet.hbs`;
    return `systems/bitd/templates/actor/${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    const actorData = this.actor.toObject(false);

    // Encrich editor content
    context.enrichedNotes = await TextEditor.enrichHTML(this.object.system.notes, { async: true })
    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true })

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    this._prepareCharacterData(context);

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
    }

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
  }

    /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    let playbook;
    const abilities = [];
    const contact = [];
    const inventory = [];
    const specInventory = [];

    const playbookId = this.actor.system.playbook;

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === 'playbook') {
        if (i._id === playbookId) {
          playbook = i;
        }
      }
      else if (i.type === 'abilityCharacter') {
        abilities.push(i);
      }
      else if (i.type === 'contact') {
        contact.push(i);
      }
      else if (i.type === 'tool') {
        if (i.system.type === 'common') {
          inventory.push(i);
        } else {
          specInventory.push(i);
        }
      }
    }

    context.abilities = abilities;
    context.contact = contact;
    context.inventory = inventory;
    context.playbook = playbook;
    context.specInventory = specInventory;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

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

    // Resource dots
    html.find(".value-step-block > .value-step").click(this._onDotChange.bind(this));

    // Add Trauma
    html.find('.add-trauma').click(this._onAddTrauma.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const button = ev.currentTarget;
      const li = button.closest(".item");
      const item = this.actor.items.get(li?.dataset.itemId);
      return item.delete();
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Show item summary.
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

    // Drag events for macros.
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
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} the originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = duplicate(header.dataset);
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

  /**
   * Handle adding traumas.
   * @param {Event} the originating click event
   * @private
   */
  async _onAddTrauma(event) {
    const currentTraumas = (this.actor.system.trauma || []).filter(Boolean);
    const defaultTraumas = [
      "BITD.Traumas.Cold",
      "BITD.Traumas.Haunted",
      "BITD.Traumas.Obsessed",
      "BITD.Traumas.Paranoid",
      "BITD.Traumas.Reckless",
      "BITD.Traumas.Soft",
      "BITD.Traumas.Unstable",
      "BITD.Traumas.Vicious",
    ];
    const filteredTraumas = defaultTraumas.filter(trauma => !currentTraumas.includes(trauma));

    const template = await renderTemplate("systems/bitd/templates/apps/trauma.hbs", { currentTraumas, filteredTraumas });

    const dialog = new Dialog({
      title: game.i18n.localize("BITD.ChooseTrauma"),
      content: template,
      buttons: {
        add: {
          label: game.i18n.localize("BITD.AddTrauma"),
          callback: async (html) => {
            const elements = Array.from(html.find(".trauma.active"));
            const newTraumas = elements.map(el => el.dataset.value);

            const customTrauma = html.find("input.custom-trauma")[0].value;
            if (customTrauma) {
              console.log("not empty:", customTrauma)
              newTraumas.push(customTrauma);
            }

            await this.actor.update({ "system.trauma": newTraumas });
          }
        }
      },
      default: "add",
      close: () => {},
      render: (html) => {
        html.find(".trauma").on("click", function() {
          $(this).toggleClass("active");
        });
      }
    },
    {
      width: 220
    });

    dialog.render(true);
  }
}
