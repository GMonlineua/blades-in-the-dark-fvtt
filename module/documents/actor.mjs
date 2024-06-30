/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class BitdActor extends Actor {

  async _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    const defaultItemsID = CONFIG.BITD.defaultItems;
    const defaultItems = [];

    if (this.type == "scoundrel") {
      for (const id of defaultItemsID.scoundrel) {
        const uuid = "Compendium.bitd.items.Item." + id;
        const item = await fromUuid(uuid);
        defaultItems.push(item);
      }
    } else if (this.type == "crew") {
      for (const id of defaultItemsID.crew) {
        const uuid = "Compendium.bitd.upgrades.Item." + id;
        const item = await fromUuid(uuid);
        defaultItems.push(item);
      }
    }

    for (const [ownerId, permissions] of Object.entries(this.ownership)) {
      if (permissions === 3 && game.userId === ownerId) {
        this.createEmbeddedDocuments('Item', defaultItems)
      }
    }
  }

  _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

    if (game.user.id === userId) {
      const target = {
        actor: "scoundrel",
        item: "playbook",
        forLoad: ["abilities", "contacts", "inventory"]
      }

      if (this.type == "crew") {
        target.actor = "crew",
        target.item = "crewType",
        target.forLoad = ["abilities", "claims", "cohorts", "upgrades"]
      }

      for (const dataItem of data) {
        if (dataItem.type == target.item && this.type == target.actor) {
          for (const i of this.items) {
            if (i.type === target.item && i._id != dataItem._id) {
              const item2Delete = this.items.get(i._id);
              item2Delete.delete();
            }
          }
          this.update({ "system.playbook": dataItem._id });

          this._preCreateContainer(dataItem, target.forLoad);
        }
      }
    }
  }

  async _preCreateContainer(container, forLoad) {
    const systemData = this.system;
    const toCreate = [];

    for (const array of forLoad) {
      const idArr = container.system[array];
      for (const itemData of idArr) {
        const item = await fromUuid(itemData.uuid);
        if (!this.items.find(i => i.name === item.name && i.type === item.type)) {
          toCreate.push(item)
        } else {
          ui.notifications.warn(game.i18n.localize("BITD.Errors.Item.ExistsName"));
        }
      }
    }
    this.createEmbeddedDocuments('Item', toCreate)

    const relationship = this.system.relationship;
    await this.update({ "system.relationship": relationship.concat(container.system.relationship) });

    if (container.type == "playbook") {
      for (const [attrKey, targetAttr] of Object.entries(systemData.attributes)) {
        const playbookAttr = container.system.attributes[attrKey];
        for (const [actionKey, targetAct] of Object.entries(targetAttr.actions)) {
          const playbookAct = playbookAttr[actionKey];

          if (playbookAct > targetAct.value) {
            const path = "system.attributes." + attrKey + ".actions." + actionKey + ".value";
            await this.update({ [path]: playbookAct });
          }
        }
      }
    }
  }
}
