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
      width: 750,
      height: 900,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "abilities"
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

    // Prepare crew data and items.
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
    const claims = [];
    const cohorts = [];
    const contacts = [];
    const upgrades = [];

    const playbookId = this.actor.system.playbook;

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === 'crewType') {
        if (i._id === playbookId) {
          playbook = i;
        }
      }
      else if (i.type === 'abilityCrew') {
        abilities.push(i);
      }
      else if (i.type === 'claim') {
        claims.push(i);
      }
      else if (i.type === 'cohort') {
        cohorts.push(i);
      }
      else if (i.type === 'contact') {
        contacts.push(i);
      }
      else if (i.type === 'upgrade') {
        upgrades.push(i);
      }
    }

    context.abilities = abilities;
    context.claims = claims;
    context.cohorts = cohorts;
    context.contacts = contacts;
    context.playbook = playbook;
    context.upgrades = upgrades;
  }
}
