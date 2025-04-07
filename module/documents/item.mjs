import { claimMap } from "../applications/claims-map.mjs";

//
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export default class BitdItem extends Item {
  prepareData() {
    super.prepareData();
  }

  /**
   * Handle clickable show description.
   * @param {Event} event   The originating click event
   * @private
   */
  async show() {
    const item = this;

    const renderData = {
      name: item.name,
      type: game.i18n.localize("TYPES.Item." + item.type),
      description: item.system.description,
    };

    const message = await renderTemplate(
      "systems/bitd/templates/apps/rollItem.hbs",
      renderData,
    );
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: message,
    };
    ChatMessage.create(chatData);
  }

  async addLinkedItem(data) {
    const item = await fromUuid(data.uuid);
    const supported = CONFIG.BITD.supportedLinks[this.type];
    const key = supported[item.type];

    const localizeType = game.i18n.localize("TYPES.Item." + item.type);
    if (!key)
      return ui.notifications.warn(
        game.i18n.format("BITD.Errors.Item.NotSupported", {
          item: item.name,
          type: localizeType,
        }),
      );

    // Handle claims separately due to new structure
    if (key === "claims") {
      const claims = this.system.claims;
      const map = claims.map;

      const idExist = map.some((existingItem) => existingItem.id === item.id);
      const nameExist = map.some(
        (existingItem) => existingItem.name === item.name,
      );

      if (idExist)
        return ui.notifications.error(
          game.i18n.localize("BITD.Errors.Item.ExistsId"),
        );
      if (nameExist)
        ui.notifications.warn(
          game.i18n.localize("BITD.Errors.Item.ExistsName"),
        );

      const path = "system.claims.map";
      const link = {
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        type: item.type,
        active: false,
      };

      map.push(link);
      await this.update({ [path]: map });
      claimMap(this);

      return;
    }

    // Default behavior for all other keys
    const container = this.system[key];
    const idExist = container.some(
      (existingItem) => existingItem.id === item.id,
    );
    const nameExist = container.some(
      (existingItem) => existingItem.name === item.name,
    );

    if (idExist)
      return ui.notifications.error(
        game.i18n.localize("BITD.Errors.Item.ExistsId"),
      );
    if (nameExist)
      ui.notifications.warn(game.i18n.localize("BITD.Errors.Item.ExistsName"));

    const path = "system." + key;
    const link = {
      id: item.id,
      uuid: item.uuid,
      type: item.type,
      name: item.name,
      title: game.i18n.localize("TYPES.Item." + item.type),
      docType: "Item",
    };
    container.push(link);
    await this.update({ [path]: container });

    // Additional check if claim
    if (item.type === "claim") claimMap(this, "claim");
  }

  async addLinkedActor(data) {
    const actor = await fromUuid(data.uuid);
    const localizeType = game.i18n.localize("TYPES.Actor." + actor.type);
    if (actor.type != "npc")
      ui.notifications.error(
        game.i18n.format("BITD.Errors.Actor.NotSupported", {
          type: localizeType,
          actor: actor.name,
        }),
      );

    const container = this.system.contacts;

    const idExist = container.some(
      (existingActor) => existingActor.id === actor.id,
    );
    const nameExist = container.some(
      (existingActor) => existingActor.name === actor.name,
    );

    if (idExist)
      return ui.notifications.error(
        game.i18n.localize("BITD.Errors.Actor.ExistsId"),
      );
    if (nameExist)
      ui.notifications.warn(game.i18n.localize("BITD.Errors.Actor.ExistsName"));

    const link = {
      id: actor.id,
      uuid: actor.uuid,
      type: actor.type,
      name: actor.name,
      title: game.i18n.localize("TYPES.Actor." + actor.type),
      docType: "Actor",
    };
    container.push(link);
    await this.update({ "system.contacts": container });
  }

  async loadLinkedData() {
    if (this.sheet.isEditable) return;
    if (!CONFIG.BITD.linkedForeign[this.type]) return;

    for (const key of CONFIG.BITD.linkedForeign[this.type]) {
      // Handle claims
      if (key === "claims") return;
      const container = this.system[key];
      const path = "system." + key;

      for (const index in container) {
        if (container[index].uuid) {
          const data = await fromUuid(container[index].uuid);
          if (data) {
            container[index].name = data.name;
          } else {
            const localizeType = game.i18n.localize(
              "TYPES.Item." + container[index].type,
            );
            ui.notifications.error(
              game.i18n.format("BITD.Errors.Item.NotExist", {
                type: localizeType,
                item: container[index].name,
              }),
            );
            container.splice(index, 1);
          }
        }

        await this.update({ [path]: container });
      }
    }
  }
}
