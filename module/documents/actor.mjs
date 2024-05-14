/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BitdActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override*/
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;

    if (actorData.type == 'scoundrel') this._prepareScoundrelData(actorData, systemData);
    if (actorData.type == 'crew') this._prepareCrewData(systemData);
  }

  _prepareScoundrelData(actorData, systemData) {
    for (const [attrKey, attribute] of Object.entries(systemData.attributes)) {
      attribute.value = 0;

      for (const [actionKey, action] of Object.entries(attribute.actions)) {
        action.max = 4;
        systemData[actionKey] = foundry.utils.deepClone(action);

        if (action.value > 0) {
          attribute.value += 1;
        }
      }
    }

    // Inventory slots
    let load = 0;
    for (let i of actorData.items) {
      if (i.system.loadout && i.system.equipped) {
        load += i.system.loadout;
      }
    }
    systemData.load.value = load;
  }

  _prepareCrewData(systemData) {
    if (systemData.turf < 0) {
      systemData.turf = 0;
    } else if (systemData.turf > 6) {
      systemData.turf = 6;
    }
    systemData.rep.max = 12 - systemData.turf;
  }

  _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
    const target = {
      actor: "scoundrel",
      item: "playbook",
      forLoad: ["abilities", "contacts", "inventory"]
    }

    if (this.type == "crew") {
      target.actor = "crew",
      target.item = "crewType",
      target.forLoad = ["abilities", "contacts", "upgrades"]
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

        this._preCreatePlaybook(dataItem, target.forLoad);
      }
    }
  }

  async _preCreatePlaybook(playbook, forLoad) {
    const oldItems = this.items;
    const newItems = [];

    for (const array of forLoad) {
      const idArr = playbook.system[array];
      for (const itemData of idArr) {
        const item = await fromUuid(itemData.uuid);
        if (!oldItems.find(i => i.name === item.name)) {
          newItems.push(item);
        } else {
          ui.notifications.warn(game.i18n.localize("BITD.ItemExistsName"));
        }
      }
    }

    const cls = getDocumentClass("Item");
    for (const item of newItems) {
      cls.create(item, {parent: this})
    }
  }
}
