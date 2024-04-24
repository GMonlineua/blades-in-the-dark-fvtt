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

    if (actorData.type == 'character') this._prepareCharacterData(systemData);
  }

  _prepareCharacterData(systemData) {
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
  }

  _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

    for (const i of data) {
      if (i.type == "playbook" && this.type == "character") {
        const playbookData = {
          id: i._id,
          name: i.name
        }
        this.update({ "system.playbook": playbookData });
        const forLoad = ["abilities", "contacts", "inventory"]
        this._loadPlaybookDara(forLoad, i);
      }
    }
  }

  async _loadPlaybookDara(forLoad, playbook) {
    for (const i of forLoad) {
      const idArr = playbook.system[i];
      for (const itemData of idArr) {
        const item = await fromUuid(itemData.uuid);
        const cls = getDocumentClass("Item");
        cls.create(item, {parent: this})
      }
    }
  }
}
