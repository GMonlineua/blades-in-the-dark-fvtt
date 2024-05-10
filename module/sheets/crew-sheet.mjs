import { BitdActorSheet } from "./actor-sheet.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdCrewSheet extends BitdActorSheet
{

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "crew"],
      template: "systems/bitd/templates/actor/crew-sheet.hbs",
      width: 750,
      height: 900,
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
    const actorData = this.actor.toObject(false);

    // Encrich editor content
    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true })

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    this._prepareItems(context);

    return context;
  }

    /**
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareItems(context) {
    let playbook;
    const abilities = [];
    const contact = [];
    const inventory = [];
    const specInventory = [];

    const playbookId = this.actor.system.playbook;

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === 'playbook') {
        if (i._id === playbookId) {
          playbook = i;
        }
      }
      else if (i.type === 'abilityCharacter') {
        abilities.push(i);
      }
      else if (i.type === 'contact') {
        contact.push(i);
      }
      else if (i.type === 'tool') {
        if (i.system.type === 'common') {
          inventory.push(i);
        } else {
          specInventory.push(i);
        }
      }
    }

    context.abilities = abilities;
    context.contact = contact;
    context.inventory = inventory;
    context.playbook = playbook;
    context.specInventory = specInventory;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /* -------------------------------------------- */
}
