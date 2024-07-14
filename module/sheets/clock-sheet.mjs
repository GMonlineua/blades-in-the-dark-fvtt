/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BitdClockSheet extends ActorSheet
{

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "clock"],
      width: 300,
      height: 400
    });
  }

  /** @override */
  get template() {
    return "systems/bitd/templates/actor/clock-sheet.hbs"
  }

  /** @override */
  async getData() {
    const context = await super.getData();

    // Encrich editor content
    context.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, {
      async: true,
      secrets: this.actor.isOwner
    })

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = context.actor.system;
    context.flags = context.actor.flags;
    context.config = CONFIG.BITD;

    this._prepareClock()

    return context;
  }

  async _prepareClock() {
    const progress = this.actor.system.progress;
    if (progress.value > progress.max) {
      this.actor.update({"system.progress.value" : progress.max});
      progress.value = progress.max;
    }

    const imagePath = `systems/bitd/assets/progress-clocks/black/size-${progress.max}/progress-${progress.value}.svg`;
    this.actor.update({"img" : imagePath});
    this.actor.update({"prototypeToken.texture.src" : imagePath});

    // Update tokens
    const data = [];
    const parents = [];
    const toUpdate = {
      "texture.src": imagePath
    };
    const tokens = this.actor.getDependentTokens();
    tokens.forEach( function(token) {
      parents.push(token.parent);
      data.push(
        foundry.utils.mergeObject(
          { _id: token.id },
          toUpdate
        )
      );
    });

    for (let i = 0; i < data.length; i++) {
      await TokenDocument.updateDocuments([data[i]], {parent: parents[i]});
    }
  }
}
