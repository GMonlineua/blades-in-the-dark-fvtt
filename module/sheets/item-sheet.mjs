import { claimMap } from "../applications/claims-map.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class BitdItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "item"],
      width: 550,
      height: 550,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "general"
      }]
    });
  }

  /** @override */
  get template() {
    return `systems/bitd/templates/item/${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    this.item.loadLinkedData();
    // Retrieve base data structure.
    const context = await super.getData();

    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true });

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Encrich editor content
    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {async: true})

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.config = CONFIG.BITD;

    return context;
  }

  /* -------------------------------------------- */

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

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Delete linked item
    html.find('.link-delete').click(this._onRemoveLink.bind(this));

    // Resource dots
    html.find(".value-step-block > .value-step").click(this._onDotChange.bind(this));
  }

  _onRemoveLink(event) {
    const button = event.currentTarget;
    const parent = $(button.parentNode);
    const link = parent.find(".content-link");
    const targetId = link[0].dataset.id;

    const block = button.closest(".linked-items");
    const key = block.dataset.array;
    const path = "system." + key;
    const newArray = this.item.system[key].filter(link => link.id !== targetId);

    this.item.update({ [path]: newArray });
  }

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

    await this.item.update({ [key]: value });
  }
}
