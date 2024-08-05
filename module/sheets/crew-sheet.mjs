import { BitdActorSheet } from "./actor-sheet.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdCrewSheet extends BitdActorSheet
{

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "crew"],
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
    const upgrades = [];
    const specUpgrades = [];

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
      else if (i.type === 'upgrade') {
        if (i.system.type === 'common') {
          upgrades.push(i);
        } else {
          specUpgrades.push(i);
        }
      }
    }

    console.log(abilities, upgrades);
    context.abilities = abilities;
    context.claims = claims;
    context.cohorts = cohorts;
    context.playbook = playbook;
    context.upgrades = upgrades;
    context.specUpgrades = specUpgrades;
  }

  /** @override */
  async _onDropActor(event, data) {
    if (!this.isEditable) return;
    const cls = getDocumentClass("Actor");
    const sourceActor = await cls.fromDropData(data);

    this.actor.addLinkedActor(sourceActor);
  }
}
