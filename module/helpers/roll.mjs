import { getRollData } from "./roll-data.mjs";

export async function createRollDialog (type, sheet, note) {
  if (!sheet) {
    sheet = game.user.character;
  }

  const templateData = getRollData(type, sheet, note);

  const functions = {
    action: actionRoll,
    resistance: resistanceRoll,
    fortune: fortuneRoll,
    information: GatherInformation,
    engagement: EngagementRoll,
    asset: AcquireAsset,
    vice: IndulgeVice
  }

  const html = await renderTemplate("systems/bitd/templates/apps/rollDialog.hbs", templateData);

  const dialog = new Dialog({
    title: game.i18n.localize("BITD.Roll.Title"),
    content: html,
    buttons: {
      roll: {
        label: game.i18n.localize("BITD.Roll.Submit"),
        icon: '<i class="fas fa-dice"></i>',
        callback: async (html) => {
          const formData = new FormData(html[0].querySelector("form"));
          const data = toIntData(Object.fromEntries(formData.entries()));

          const rollFunction = functions[data.rollType];
          const rollData = await roll(data);
          rollData.name = templateData.type[data.rollType];

          rollFunction(rollData, sheet, data);
          renderRoll(rollData, sheet)
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("BITD.Roll.Cancel"),
        callback: () => {},
      },
    },
    default: "roll",
    close: () => {},
  },
  {
    width: 400
  });
  dialog.render(true);
}

function toIntData(data) {
  for (const prop in data) {
    if (data.hasOwnProperty(prop) && !isNaN(data[prop])) {
      data[prop] = parseInt(data[prop], 10);
    }
  }

  return data;
}

async function roll(data) {
  console.log("roll: ", data);
  let number = data.diceNumber + data.modifier;

  if (data.assistance) {
    number += 1;
  }
  if (data.pushDice || data.devisBargain) {
    number += 1;
  }

  const roll = new Roll(number + "d6");
  await roll.evaluate();
  const resultsArr = roll.terms[0].results.map((element) => (element.result));

  const rollResult = {
    dice: resultsArr,
    max: Math.max(...resultsArr),
    assistance: data.assistance,
    pushEffect: data.pushEffect,
    pushDice: data.pushDice,
    devisBargain: data.devisBargain
  }

  if (resultsArr.filter(num => num === 6).length === 2) {
    rollResult.result = "critical";
    rollResult.localizeResult = game.i18n.localize("BITD.Roll.Result.Critical");
  } else {
    switch (rollResult.max) {
      case 6:
        rollResult.result = "success";
        rollResult.localizeResult = game.i18n.localize("BITD.Roll.Result.Success");
        break;
      case 4:
      case 5:
        rollResult.result = "mixed";
        rollResult.localizeResult = game.i18n.localize("BITD.Roll.Result.Mixed");
        break;
      case 1:
      case 2:
      case 3:
        rollResult.result = "fail";
        rollResult.localizeResult = game.i18n.localize("BITD.Roll.Result.Fail");
    }
  }

  rollResult.resultKey = rollResult.result.charAt(0).toUpperCase() + rollResult.result.slice(1);

  return rollResult
}

function actionRoll(rollData, sheet, formData) {
  const positionKey = formData.position.charAt(0).toUpperCase() + formData.position.slice(1);
  rollData.description = game.i18n.localize("BITD.Roll.Action." + positionKey + "." + rollData.resultKey);

  return rollData
}

function resistanceRoll(rollData, sheet, formData) {
  let sufferedStress = 6 - rollData.max;
  rollData.description = game.i18n.localize("BITD.Roll.Resistance.Result");
  if (rollData.result == "critical") {
    rollData.description += game.i18n.localize("BITD.Roll.Resistance.Critical");
    sufferedStress = -1;
  } else {
    rollData.description += game.i18n.format("BITD.Roll.Resistance.Regular", {stress: sufferedStress});
  }

  return rollData
}

function fortuneRoll(rollData) {
  rollData.description = game.i18n.localize("BITD.Roll.Fortune." + rollData.resultKey);

  return rollData
}

function GatherInformation(rollData, sheet, formData) {
  const rollAs = formData.rollAs;
  const positionKey = formData.position.charAt(0).toUpperCase() + formData.position.slice(1);
  const effectKey = formData.effect.charAt(0).toUpperCase() + formData.effect.slice(1);
  rollData.description = game.i18n.localize("BITD.Roll.GatherInformation." + effectKey);

  let addDescription;
  if (rollAs == "action") {
    addDescription = game.i18n.localize("BITD.Roll.Action." + positionKey + "." + rollData.resultKey);
  } else if (rollAs == "fortune") {
    addDescription = game.i18n.localize("BITD.Roll.Fortune." + rollData.resultKey);
  }

  rollData.description += "<p>" + addDescription + "</p>";

  return rollData
}

function EngagementRoll(rollData) {
  rollData.description = game.i18n.localize("BITD.Roll.Engagement." + rollData.resultKey);

  return rollData
}

function AcquireAsset(rollData) {
  rollData.description = game.i18n.localize("BITD.Roll.AcquireAsset." + rollData.resultKey);

  return rollData
}

function IndulgeVice(rollData) {
  let clearStress = rollData.max;
  rollData.description = game.i18n.format("BITD.Roll.IndulgeVice.Regular", {stress: clearStress});
  // get data from actor

  return rollData
}

async function renderRoll(renderData, sheet) {
  const speaker = ChatMessage.getSpeaker({ actor: sheet });
  console.log("Render data:", renderData)
  const chatMessage = await renderTemplate("systems/bitd/templates/apps/rollResult.hbs", renderData);
  const chatData = {
    speaker: speaker,
    content: chatMessage,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    sound: CONFIG.sounds.dice
  };
  ChatMessage.create(chatData);
}
