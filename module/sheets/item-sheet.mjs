/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class BitdItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "item"],
      template: "systems/bitd/templates/item-sheet.hbs",
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
    let path = "systems/bitd/templates/item/item-sheet.hbs";

    switch (this.item.type) {
      case 'playbook':
        path = "systems/bitd/templates/item/playbook-sheet.hbs";
        break;
      case 'crewType':
        path = "systems/bitd/templates/item/crew-type-sheet.hbs";
        break;
      case 'contact':
        path = "systems/bitd/templates/item/contact-sheet.hbs";
    }

    return path;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
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

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

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

    // Create linked items by dropping onto item
    this.form.ondrop = ev => this._onDropItem(ev);

    // Delete linked item
    html.find('.link-delete').click(this._onRemoveLink.bind(this));
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

  async _onDropItem(event) {
    const itemData = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (itemData.type === 'Item') {
      const item = await fromUuid(itemData.uuid);
      let key = "";

      if (this.item.type == "playbook") {
        switch (item.type) {
          case 'abilityCharacter':
            key = "abilities";
            break;
          case 'contact':
            key = "contacts";
            break;
          case 'tool':
            key = "inventory";
        }
      }

      let container = [];
      if (this.item.system[key]) {
        container = this.item.system[key];
      }

      const link = {
        uuid: itemData.uuid,
        id: item.id,
        name: item.name,
        type: item.type,
        title: game.i18n.localize("TYPES.Item." + item.type)
      }

      if (key) {
        const path = "system." + key;
        let linkArr = Array.from(container);

        const itemExists = linkArr.some(existingItem => existingItem.id === link.id);

        if (!itemExists) {
          linkArr.push(link);
          await this.item.update({ [path]: linkArr });
        } else {
          ui.notifications.warn("Item with the same id already exists in the container.");
        }
      }
    }
  }

  _onRemoveLink(event) {
    const button = event.currentTarget;
    const parent = $(button.parentNode);
    const link = parent.find(".content-link");
    const itemId = link[0].dataset.id;

    const block = button.closest(".linked-items");
    const key = block.dataset.array;
    const path = "system." + key;
    const array = this.item.system[key].filter(item => item.id !== itemId);

    this.item.update({ [path]: array });
  }
}
