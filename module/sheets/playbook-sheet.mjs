import { BitdItemSheet } from "./item-sheet.mjs";

/**
 * Extend the basic BitdItemSheet
 * @extends {BitdItemSheet}
 */
export class BitdPlaybookSheet extends BitdItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      dragDrop: [
        {dragSelector: ".item", dropSelector: ".playbook"},
        {dragSelector: ".item", dropSelector: ".crewType"}
      ]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    // Delete linked item
    html.find('.link-delete').click(this._onRemoveLink.bind(this));
  }

  /* -------------------------------------------- */
  /*  Drag & Drop                                 */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onDrop(event) {
    super._onDrop(event);
    const data = TextEditor.getDragEventData(event);

    if (data.type === "Item") {
      const item = await fromUuid(data.uuid);
      let key = "";

      switch (item.type) {
        case 'abilityScoundrel':
          if (this.item.type == "playbook") key = "abilities";
          break;
        case 'tool':
          if (this.item.type == "playbook") key = "inventory";
          break;
        case 'abilityCrew':
          if (this.item.type == "crewType") key = "abilities";
          break;
        case 'claim':
          if (this.item.type == "crewType") key = "claims";
          break;
        case 'cohort':
          if (this.item.type == "crewType") key = "cohorts";
          break;
        case 'upgrade':
          if (this.item.type == "crewType") key = "upgrades";
      }

      if (key && this.item.system[key]) {
        const container = this.item.system[key];
        const itemExist = container.some(existingItem => existingItem.id === item.id);

        if (!itemExist) {
          const path = "system." + key;
          const link = {
            id: item.id,
            uuid: item.uuid,
            type: "Item",
            name: item.name,
            title: game.i18n.localize("TYPES.Item." + item.type)
          }
          container.push(link);
          await this.item.update({ [path]: container });
        } else {
          ui.notifications.warn(game.i18n.localize("BITD.Errors.Item.ExistsId"));
        }
      } else {
        ui.notifications.warn(game.i18n.format("BITD.Errors.Item.NotSupported", {item: item.name}));
      }
    } else if (data.type === "Actor") {
      const actor = await fromUuid(data.uuid);
      if (actor.type === "npc") {
        const container = this.item.system.relationship;
        const actorExist = container.some(existingActor => existingActor.id === actor.id);

        if (!actorExist) {
          const link = {
            id: actor.id,
            uuid: actor.uuid,
            type: "Actor",
            name: actor.name,
            title: game.i18n.localize("TYPES.Actor." + actor.type)
          }
          container.push(link);
          await this.item.update({ "system.relationship": container });
        } else {
          ui.notifications.warn(game.i18n.localize("BITD.Errors.Item.ExistsId"));
        }
      } else {
        ui.notifications.warn(game.i18n.format("BITD.Errors.Actor.NotSupported", {actor: actor.name}));
      }
    }
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
}
