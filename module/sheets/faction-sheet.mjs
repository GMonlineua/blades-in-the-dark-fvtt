import { BitdActorSheet } from "./actor-sheet.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdFactionSheet extends BitdActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "faction"],
      width: 550,
      height: 650,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "general",
        },
      ],
    });
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    const actorData = context.data;
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Encrich editor content
    context.enrichedSituation =
      await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.object.system.situation,
        {
          async: true,
          secrets: this.actor.isOwner,
        },
      );

    // Prepare faction data and items.
    this._prepareItems(context);

    return context;
  }

  /**
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareItems(context) {
    const claims = [];

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === "claim") {
        claims.push(i);
      }
    }

    context.claims = claims;
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDropActor(event, data) {
    if (!this.isEditable) return;
    const cls = getDocumentClass("Actor");
    const sourceActor = await cls.fromDropData(data);

    this.actor.addLinkedActor(sourceActor);
  }
}
