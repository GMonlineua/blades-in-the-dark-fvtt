import { BitdActorSheet } from "./actor-sheet.mjs";
import { claimMap } from "../applications/claims-map.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdCrewSheet extends BitdActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "crew"],
      width: 850,
      height: 900,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "claims",
        },
      ],
    });
  }

  /** @override */
  async getData() {
    const context = await super.getData();

    // Prepare crew data and items.
    this._prepareItems(context);
    context.claims = claimMap(this.actor, true);
    if (this.isEditable)
      await this.actor.update({ "system.claims": context.claims });

    return context;
  }

  /**
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareItems(context) {
    let playbook;
    const abilities = [];
    const cohorts = [];
    const upgrades = [];
    const specUpgrades = [];

    const playbookId = this.actor.system.playbook;

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === "crewType") {
        if (i._id === playbookId) {
          playbook = i;
        }
      } else if (i.type === "abilityCrew") {
        abilities.push(i);
      } else if (i.type === "cohort") {
        cohorts.push(i);
      } else if (i.type === "upgrade") {
        if (i.system.type === "common") {
          upgrades.push(i);
        } else {
          specUpgrades.push(i);
        }
      }
    }

    context.abilities = abilities;
    context.cohorts = cohorts;
    context.playbook = playbook;
    context.upgrades = upgrades;
    context.specUpgrades = specUpgrades;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Delete Item
    html.find(".claim-delete").click((ev) => {
      const button = ev.currentTarget;
      const div = button.closest(".item");
      const item = this.actor.items.get(div?.dataset.itemId);
      const claims = this.actor.system.claims;
      const claim = claims.find((claim) => claim.id === item.id);

      if (claim) {
        claim.id = "";
        claim.name = "Turf";
        claim.active = false;
        claim.effect = "";
      }

      this.actor.update({ "system.claims": claims });
      return item.delete();
    });

    // Move claim in map
    html.find("a.claim-move").click(this._onMoveClaim.bind(this));

    // Claim checkbox for turf
    html.on("change", "input.claim-checkbox", this._onActiveTurf.bind(this));
  }

  /* -------------------------------------------- */

  async _onMoveClaim(event) {
    const button = event.currentTarget;
    const direction = button.dataset.direction;
    const parent = $(button.parentNode);
    const index = parseInt(parent[0].dataset.index, 10);
    const claims = this.actor.system.claims;

    if (direction === "left" && index > 0) {
      [claims[index], claims[index - 1]] = [claims[index - 1], claims[index]];
    } else if (direction === "right" && index < claims.length - 1) {
      [claims[index], claims[index + 1]] = [claims[index + 1], claims[index]];
    }

    await this.actor.update({ "system.claims": claims });
  }

  async _onActiveTurf(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const parent = element.closest("div.item");
    const active = element.checked;
    const index = parent.dataset.index;
    const claims = this.actor.system.claims;

    claims[index].active = active;
    await this.actor.update({ "system.claims": claims });
  }

  /** @override */
  async _onDropActor(event, data) {
    if (!this.isEditable) return;
    const cls = getDocumentClass("Actor");
    const sourceActor = await cls.fromDropData(data);

    this.actor.addLinkedActor(sourceActor);
  }
}
