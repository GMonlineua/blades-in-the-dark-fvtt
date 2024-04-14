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
    for (let [attrKey, attribute] of Object.entries(systemData.attributes)) {
      attribute.value = 0;

      for (let [actionKey, action] of Object.entries(attribute.actions)) {
        action.max = 4;
        systemData[actionKey] = foundry.utils.deepClone(action);

        if (action.value > 0) {
          attribute.value += 1;
        }
      }
    }
  }
}
