//
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class BitdItem extends Item {
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable show description.
   * @param {Event} event   The originating click event
   * @private
   */
  show() {
    const item = this;

    // Initialize chat data.
    const name = item.name;
    const description = item.system.description;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      content: `
      <h4 class="name">${name}</h3>
      <div class="description">${description}</div>
      `
    });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  roll() {
    const item = this;

    // Initialize chat data.
    const name = item.name;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const rollData = this.getRollData();

    if (rollData.item.formula) {
      const roll = new Roll(rollData.item.formula, rollData);
      roll.toMessage({
        speaker: speaker,
        flavor: name,
        rollMode: rollMode,
      });
    } else {
      item.show();
    }
  }
}
