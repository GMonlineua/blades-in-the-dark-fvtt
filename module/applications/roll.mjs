const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A Foundry VTT ApplicationV2 for handling custom dice rolls.
 */
export default class BitdRolls extends HandlebarsApplicationMixin(
  ApplicationV2,
) {
  /**
   * Default ApplicationV2 options.
   * @returns {object} Default options for this application.
   * @see {foundry.applications.api.ApplicationV2.DEFAULT_OPTIONS}
   */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    id: "bitd-rolls",
    classes: ["bitd-rolls"],
    tag: "form",
    position: {
      width: 500,
    },
    form: {
      handler: this.#onSubmit,
      closeOnSubmit: true,
    },
  };

  static PARTS = {
    form: {
      template: "systems/bitd/templates/apps/rollDialog.hbs",
    },
  };

  constructor(options = {}) {
    super(options);
    this.actor =
      options.actor ??
      game.user.character ??
      (canvas.ready ? canvas.tokens.controlled[0]?.actor : null) ??
      null;
    this.rollConfig = { ...CONFIG.BITD.rolls };
  }

  get title() {
    return game.i18n.localize("BITD.Roll.Title");
  }

  /**
   * Data to be passed to the Handlebars template.
   * @param {object} [options] - Options passed to the render call.
   * @returns {Promise<object>} Data for the template.
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.rollConfig = this.rollConfig;
    const defaults = context.rollConfig.defaults;

    const custom = this.options;
    if (custom.type) defaults.type = custom.type;
    if (custom.type == "action" && custom.note) defaults.action = custom.note;
    if (custom.type == "resistance" && custom.note)
      defaults.attribute = custom.note;
    if (!isNaN(custom.note)) defaults.dice = parseInt(custom.note);

    context.actor = this.actor;

    // Add harm to context
    context.harm = {};
    if (this.actor && this.actor.system.harm) {
      const actorHarm = this.actor.system.harm;

      if (actorHarm.lesser[0]) context.harm.lesser1 = actorHarm.lesser[0];
      if (actorHarm.lesser[1]) context.harm.lesser2 = actorHarm.lesser[1];
      if (actorHarm.moderate[0]) context.harm.moderate1 = actorHarm.moderate[0];
      if (actorHarm.moderate[1]) context.harm.moderate2 = actorHarm.moderate[1];
      if (actorHarm.severe) context.harm.severe = actorHarm.severe;
    }

    return context;
  }

  _onRender(context, options) {
    this._handleOptional("initial");
    const optionalDepends = this.element.querySelectorAll(".optional-listen");
    for (const select of optionalDepends) {
      select.addEventListener("change", this._handleOptional.bind(this));
    }

    if (this.actor) {
      this.getDiceNumber("initial");
      const diceDepends = this.element.querySelectorAll(".dice-listen");
      for (const select of diceDepends) {
        select.addEventListener("change", this.getDiceNumber.bind(this));
      }
    }

    this._summary();
    this.element.addEventListener("change", this._summary.bind(this));
  }

  /* -------------------------------------------- */
  /* Event Handlers                              */
  /* -------------------------------------------- */
  _handleOptional(e) {
    const html = this.element;
    const type = html.querySelector("#roll-type").value;
    const rollAs = html.querySelector("#roll-as").value;

    const optionalBlocks = html.querySelectorAll(".optional");
    optionalBlocks.forEach((el) => el.classList.remove("active"));

    for (const block of optionalBlocks) {
      const supportedType = block.dataset.connected.split(",");

      if (supportedType.includes(type)) block.classList.add("active");
      if (type == "information" && supportedType.includes(rollAs))
        block.classList.add("active");
    }
  }

  getDiceNumber(e) {
    const actor = this.actor.system;
    const html = this.element;
    const formData = new FormData(html);
    const data = this.toIntData(Object.fromEntries(formData.entries()));

    let diceNumber;
    const targetType =
      data.rollType == "information" ? data.rollAs : data.rollType;
    switch (targetType) {
      case "action":
        const action = data.action;
        if (actor.actions) diceNumber = actor.actions[action].value;
        break;
      case "resistance":
        const attribute = data.attribute;
        if (actor.attributes) diceNumber = actor.attributes[attribute].value;
        break;
      case "vice":
        if (actor.attributes) {
          diceNumber = actor.attributes.insight.value;
          for (let [attrKey, attribute] of Object.entries(actor.attributes)) {
            if (attribute.value < diceNumber) {
              diceNumber = attribute.value;
            }
          }
        }
        break;
    }

    if (diceNumber || diceNumber == 0) {
      const diceInput = html.querySelector("#dice-number");
      diceInput.value = diceNumber;
      diceInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  _summary(e) {
    const html = this.element;
    const formData = new FormData(html);
    const data = this.toIntData(Object.fromEntries(formData.entries()));
    data.harm = html.querySelector("#harm").value;

    const diceToRoll = this.countDice(data);
    html.querySelector("#summary-dice").textContent = diceToRoll;

    const { localize: effectLocalize } = this.effectCalculation(data);
    html.querySelector("#summary-effect").textContent = effectLocalize;
  }

  /* -------------------------------------------- */
  /* Helpers                              */
  /* -------------------------------------------- */
  countDice(data) {
    let result = (data.diceNumber || 0) + (data.modifier || 0);
    if (data.assistance) result++;
    if (data.pushDice || data.devisBargain) result++;
    if (data.pushDice && data.devisBargain)
      ui.notifications.info(game.i18n.format("BITD.Roll.Bonus.PushAndDevils"));

    if (!data.harm) return result;

    // Count harm
    if (data.harm.includes("moderate1")) result--;
    if (data.harm.includes("moderate2")) result--;

    return Math.max(0, result);
  }

  effectCalculation(data) {
    const effectSequence = this.rollConfig.effectSequence;
    let effectIndex = effectSequence.indexOf(data.effect);
    if (data.pushEffect) effectIndex++;

    // Count harm
    if (data.harm) {
      if (data.harm.includes("lesser1")) effectIndex--;
      if (data.harm.includes("lesser2")) effectIndex--;
    }

    console.log(effectIndex);
    const effect = effectSequence[Math.max(0, effectIndex)];
    console.log(effect);
    const localizeKey = this.getLokalizeKey(effect);
    const localize = game.i18n.localize("BITD.Roll.Effect." + localizeKey);

    return { effect, localizeKey, localize };
  }

  toIntData(data) {
    for (const prop in data) {
      if (data.hasOwnProperty(prop) && !isNaN(data[prop])) {
        data[prop] = parseInt(data[prop]);
      }
    }

    return data;
  }

  getLokalizeKey(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  /* -------------------------------------------- */
  /* Submit Handler                            */
  /* -------------------------------------------- */
  /**
   * Handle form submission (if not using specific action buttons or if a submit button is used without data-action).
   * This is defined in DEFAULT_OPTIONS.form.handler.
   * @param {SubmitEvent} event - The form submission event.
   * @param {HTMLFormElement} form - The form element.
   * @private
   */
  static async #onSubmit(event, form) {
    const formData = new FormData(form);
    const data = this.toIntData(Object.fromEntries(formData.entries()));
    data.harm = form.querySelector("#harm").value;

    const functions = {
      action: this._actionRoll.bind(this),
      resistance: this._resistanceRoll.bind(this),
      fortune: this._fortuneRoll.bind(this),
      information: this._gatherInformation.bind(this),
      engagement: this._engagementRoll.bind(this),
      asset: this._acquireAsset.bind(this),
      vice: this._indulgeVice.bind(this),
    };

    const rollResult = await this.roll(data);
    rollResult.name = game.i18n.localize(this.rollConfig.type[data.rollType]);

    const rollFunction = functions[data.rollType];
    rollFunction(rollResult, data);
    await this.renderRoll(rollResult);
    this._giveExp(rollResult.data);
  }

  /* -------------------------------------------- */
  /* Roll Functions                              */
  /* -------------------------------------------- */
  // Handling dice roll
  async roll(formData) {
    const diceToRoll = this.countDice(formData);
    const formula = diceToRoll ? diceToRoll + "d6kh" : "2d6kl";

    const rollResult = new Roll(formula);
    await rollResult.evaluate();

    rollResult.data = this._getRollData(rollResult, formData, diceToRoll);
    this._sufferStress(rollResult);

    return rollResult;
  }

  // Create data object for future usage
  _getRollData(rollResult, formData, diceToRoll) {
    // Base object
    const data = {
      type: formData.rollType,
      countAs: {
        show: true,
      },
      assistance: formData.assistance,
      push: {
        count: 0,
        effect: formData.pushEffect,
        dice: formData.pushDice,
      },
      resistance: {
        stress: 0,
      },
      stress: 0,
      devisBargain: formData.devisBargain,
      position: {
        key: formData.position,
      },
      effect: {
        key: formData.effect,
      },
      trauma: {
        suffer: false,
      },
    };

    // Counts how many times a character pushed
    if (formData.pushEffect) data.push.count++;
    if (formData.pushDice) data.push.count++;

    // Push stres and description
    data.push.stress = data.push.count * 2;
    data.push.description = game.i18n.format(
      "BITD.Roll.Bonus.Description.Push",
      {
        stress: data.push.stress,
      },
    );

    // Count effect depends on pus hand got localize value
    data.effect = this.effectCalculation(formData);
    console.log(data.effect);

    // Add classes to dices and cout sixes for crit
    let numSixes = 0;
    rollResult.terms.map((t) =>
      t.results.map((r) => {
        if (r.result <= 3) {
          r.classes = ["failure"];
        } else if (r.result <= 5) {
          r.classes = ["partial"];
        } else {
          numSixes += 1;
          r.classes = ["success"];
        }

        if (r.active) {
          r.classes.push("active");
        } else {
          r.classes.push("inactive");
        }

        r.classes = r.classes.join(" ");
      }),
    );

    // Get key of result
    if (numSixes > 1 && diceToRoll > 1) {
      data.countAs.key = "critical";
      const index = effectSequence.indexOf(data.effect.key);
      data.effect.key = effectSequence[index + 1];
    } else {
      switch (rollResult.total) {
        case 6:
          data.countAs.key = "success";
          break;
        case 4:
        case 5:
          data.countAs.key = "mixed";
          break;
        case 1:
        case 2:
        case 3:
          data.countAs.key = "fail";
      }
    }

    // Localize key and localizations
    data.countAs.localizeKey = this.getLokalizeKey(data.countAs.key);
    data.countAs.localize = game.i18n.localize(
      "BITD.Roll.Result." + data.countAs.localizeKey,
    );
    data.position.localizeKey = this.getLokalizeKey(data.position.key);
    data.position.localize = game.i18n.localize(
      "BITD.Roll.Position." + data.position.localizeKey,
    );

    Object.assign(data, rollResult.data);
    return data;
  }

  /* Roll type functions                          */
  /* -------------------------------------------- */
  _actionRoll(rollResult, formData) {
    const rollData = rollResult.data;

    rollData.effect.show = true;
    rollData.position.show = true;
    rollData.action = formData.action;
    const actionKey =
      rollData.action.charAt(0).toUpperCase() + rollData.action.slice(1);
    rollResult.name += ": " + game.i18n.localize("BITD.Actions." + actionKey);

    rollData.description = game.i18n.localize(
      "BITD.Roll.Action." +
        rollData.position.localizeKey +
        "." +
        rollData.countAs.localizeKey,
    );

    if (rollData.countAs.key != "fail") {
      rollData.effect.description = game.i18n.localize(
        "BITD.Roll.Effect.Description." + rollData.effect.localizeKey,
      );
    }

    return rollResult;
  }

  async _resistanceRoll(rollResult, formData) {
    const rollData = rollResult.data;

    rollData.countAs.show = false;
    const attributeKey =
      formData.attribute.charAt(0).toUpperCase() + formData.attribute.slice(1);
    rollResult.name +=
      ": " + game.i18n.localize("BITD.Attributes." + attributeKey);
    rollData.description = game.i18n.localize("BITD.Roll.Resistance.Result");

    let addStress = 6 - rollResult.total;
    if (rollData.countAs.key == "critical") {
      rollData.description += game.i18n.localize(
        "BITD.Roll.Resistance.Critical",
      );
      addStress = -1;
    } else {
      rollData.description += game.i18n.format("BITD.Roll.Resistance.Regular", {
        stress: addStress,
      });
    }

    rollData.resistanceStress = addStress;
    this._sufferStress(rollResult);

    return rollResult;
  }

  _fortuneRoll(rollResult) {
    const rollData = rollResult.data;

    rollData.description = game.i18n.localize(
      "BITD.Roll.Fortune." + rollData.countAs.localizeKey,
    );

    const rollEffect =
      CONFIG.BITD.rolls.fortuneRollResult[rollData.countAs.key];
    rollData.effect.description = game.i18n.localize(
      "BITD.Roll.Effect.Description." + rollEffect,
    );

    return rollResult;
  }

  _gatherInformation(rollResult, formData) {
    const rollData = rollResult.data;

    rollData.rollAs = {
      key: formData.rollAs,
      localizeKey: this.getLokalizeKey(formData.rollAs),
    };
    rollData.rollAs.localize = game.i18n.localize(
      "BITD.Roll.Type." + rollData.rollAs.localizeKey,
    );

    if (rollData.rollAs.key == "action") {
      rollData.effect.show = true;
      rollData.position.show = true;
      rollData.action = formData.action;
      rollData.rollAs.localize = game.i18n.localize("BITD.Roll.Type.Action");

      rollData.description = game.i18n.localize(
        "BITD.Roll.Action." +
          rollData.position.localizeKey +
          "." +
          rollData.countAs.localizeKey,
      );

      switch (rollData.countAs.key) {
        case "critical":
        case "success":
        case "mixed":
          rollData.effect.description = game.i18n.localize(
            "BITD.Roll.GatherInformation." + rollData.effect.localizeKey,
          );
          break;
        case "fail":
          rollData.effect.description = game.i18n.localize(
            "BITD.Roll.GatherInformation.Zero",
          );
      }
    } else if (rollData.rollAs.key == "fortune") {
      const rollEffect =
        CONFIG.BITD.rolls.fortuneRollResult[rollData.countAs.key];
      rollData.effect.description = game.i18n.localize(
        "BITD.Roll.GatherInformation." + rollEffect,
      );
    }

    return rollResult;
  }

  _engagementRoll(rollResult) {
    rollResult.data.description = game.i18n.localize(
      "BITD.Roll.Engagement." + rollResult.data.countAs.localizeKey,
    );

    return rollResult;
  }

  _acquireAsset(rollResult) {
    rollResult.data.countAs.show = false;
    rollResult.data.description = game.i18n.localize(
      "BITD.Roll.AcquireAsset." + rollResult.data.countAs.localizeKey,
    );

    return rollResult;
  }

  async _indulgeVice(rollResult) {
    rollResult.data.countAs.show = false;

    const clearStress = rollResult.total;

    if (this.actor && this.actor.system.stress) {
      const stress = this.actor.system.stress.value - clearStress;

      if (stress < 0) {
        rollResult.data.description = game.i18n.localize(
          "BITD.Roll.IndulgeVice.Overindulgence",
        );
        rollResult.data.description +=
          "<ul>" +
          game.i18n.localize("BITD.Roll.IndulgeVice.Trouble") +
          game.i18n.localize("BITD.Roll.IndulgeVice.Brag") +
          game.i18n.localize("BITD.Roll.IndulgeVice.Lost") +
          game.i18n.localize("BITD.Roll.IndulgeVice.Trapped") +
          "</ul>";
        await this.actor.update({ "system.stress.value": 0 });
      } else {
        rollResult.data.description = game.i18n.format(
          "BITD.Roll.IndulgeVice.Regular",
          { stress: clearStress },
        );
        await this.actor.update({ "system.stress.value": stress });
      }
    } else {
      rollResult.data.description = game.i18n.format(
        "BITD.Roll.IndulgeVice.Regular",
        { stress: clearStress },
      );
    }

    return rollResult;
  }

  /* Helpers for handling rolls                   */
  /* -------------------------------------------- */
  async renderRoll(renderData) {
    renderData.renderDice = renderData.dice[0].results;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollTemplate = await foundry.applications.handlebars.renderTemplate(
      "systems/bitd/templates/apps/rollResult.hbs",
      renderData,
    );
    renderData.toMessage({
      speaker: speaker,
      content: rollTemplate,
    });
  }

  async _sufferStress(rollResult) {
    rollResult.data.stress =
      rollResult.data.push.stress + rollResult.data.resistance.stress;
    if (!this.actor) return;
    if (!this.actor.system.stress) return;
    const stress = this.actor.system.stress.value + rollResult.data.stress;

    if (stress < this.actor.system.stress.max) {
      await this.actor.update({ "system.stress.value": stress });
    } else {
      rollResult.data.trauma.suffer = true;
      rollResult.data.trauma.description = game.i18n.format(
        "BITD.Roll.SufferTrauma.Description",
        { stress: stress },
      );
      await this.actor.update({ "system.stress.value": 0 });
    }
  }

  async _giveExp(rollData) {
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    let supported;
    if (rollData.rollAs) {
      supported =
        rollData.type == "information" || rollData.rollAs.key == "action";
    } else {
      supported = rollData.type == "action";
    }

    if (rollData.position.key != "desperate" || !supported) return;

    let conAttribute = "???";
    for (const [attribute, actions] of Object.entries(
      CONFIG.BITD.attributeLinks,
    )) {
      if (actions.includes(rollData.action)) {
        conAttribute = attribute;
        break;
      }
    }

    const actorName = speaker.actor ? speaker.alias : "???";
    const message = game.i18n.format("BITD.Roll.Result.Exp", {
      actor: actorName,
      attribute: conAttribute,
    });
    const chatData = {
      user: game.user.id,
      speaker: speaker,
      content: message,
    };
    ChatMessage.create(chatData);

    if (this.actor && this.actor.system.attributes) {
      const exp = this.actor.system.attributes[conAttribute].exp;
      if (exp.value < exp.max) {
        exp.value++;
        const path = "system.attributes." + conAttribute + ".exp.value";
        await this.actor.update({ [path]: exp.value });
      }
    }
  }
}
