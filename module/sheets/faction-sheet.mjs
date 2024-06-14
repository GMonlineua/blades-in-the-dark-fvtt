import { BitdActorSheet } from "./actor-sheet.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdFactionSheet extends BitdActorSheet
{

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "faction"],
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
  async getData() {
    const context = await super.getData();

    // Encrich editor content
    context.enrichedSituation = await TextEditor.enrichHTML(this.object.system.situation, {
      async: true,
      secrets: this.actor.isOwner
    })

    // Prepare faction data and items.
    this._prepareItems(context);

    return context;
  }

    /**
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareItems(context) {
    const claims = [];
    const contacts = [];

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === 'claim') {
        claims.push(i);
      }
      else if (i.type === 'contact') {
        contacts.push(i);
      }
    }

    context.claims = claims;
    context.contacts = contacts;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Delete linked item
    html.find('.link-delete').click(this._onRemoveLink.bind(this));

    // Create linked items by dropping onto item
    this.form.ondrop = ev => this._onDropItem(ev);
  }

  async _onDropItem(event) {
    const actorData = JSON.parse(event.dataTransfer.getData('text/plain'));

    if (actorData.type === 'Actor') {
      const actor = await fromUuid(actorData.uuid);
      let key = "";

      switch (actor.type) {
        case 'npc':
          key = "npc";
          break;
      }

      let container = [];
      if (this.actor.system[key]) {
        container = this.actor.system[key];
      }

      const link = {
        uuid: actorData.uuid,
        id: actor.id,
        name: actor.name,
        type: actor.type,
        title: game.i18n.localize("TYPES.Actor." + actor.type)
      }

      if (key) {
        const path = "system." + key;
        let linkArr = Array.from(container);

        const itemExists = linkArr.some(existingItem => existingItem.id === link.id);

        if (!itemExists) {
          linkArr.push(link);
          await this.actor.update({ [path]: linkArr });
        } else {
          ui.notifications.warn(game.i18n.localize("BITD.ItemExistsId"));
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
