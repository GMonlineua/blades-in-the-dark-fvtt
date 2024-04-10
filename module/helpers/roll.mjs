import { getRollData } from "./roll-data.mjs";

export async function createRollDialog (type, sheet, note) {
  if (!sheet && game.user.character) {
    sheet = game.user.character;
  } else if (!sheet && canvas.tokens.controlled[0]) {
    sheet = canvas.tokens.controlled[0].actor;
  }

  const templateData = getRollData(type, note);

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
          const speaker = ChatMessage.getSpeaker({ actor: sheet });
          await renderRoll(rollData, speaker);
          giveExp(rollData, speaker);
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
    render: (html) => {
      optionalBlocks(html);
      // if (sheet) {
      //   getDiceNumber(html, sheet);
      //   html.find("#roll-type, #roll-as, #attribute, #action").on("change", function() {
      //     getDiceNumber(html, sheet);
      //   });
      // }

      html.find("#roll-type, #roll-as").on("change", function() {
        optionalBlocks(html);
      });
    }
  },
  {
    classes: ["dialog", "bitd-roll-dialog"],
    width: 400,
    height: 200
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

function optionalBlocks(html) {
  const type = html.find("#roll-type")[0].value;
  const rollAs = html.find("#roll-as")[0].value;

  const blocksArr = html.find(".optional");
  blocksArr.removeClass("active");

  for (const block of blocksArr) {
    const supportedType = block.dataset.connected.split(',');

    if (supportedType.includes(type)) {
      block.classList.add("active");
    }

    if (type == "information" && supportedType.includes(rollAs)) {
      block.classList.add("active");
    }
  }
}

// function getDiceNumber(html, sheet) {
//   const type = html.find("#roll-type")[0].value;
//   const rollAs = html.find("#roll-as")[0].value;
//
//   const targetType = type == "information" ? rollAs : type;
//   let diceNumber;
//   switch (targetType) {
//     case 'action':
//       const action = html.find("#action")[0].value;
//       diceNumber = 1;
//       break;
//     case 'resistance':
//       const attribute = html.find("#attribute")[0].value;
//       diceNumber = 1;
//       break;
//     case 'vice':
//       diceNumber = 1;
//       break;
//   }
// }

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
    type: data.rollType,
    dice: resultsArr,
    max: Math.max(...resultsArr),
    assistance: data.assistance,
    pushEffect: data.pushEffect,
    pushDice: data.pushDice,
    push: data.pushEffect || data.pushDice,
    devisBargain: data.devisBargain,
    position: data.position,
    effect: data.effect
  }

  let stress = 0;
  if (data.pushEffect) {
    stress += 2;
  }
  if (data.pushDice) {
    stress += 2;
  }
  rollResult.pushDescription = game.i18n.format("BITD.Roll.BonusDescription.Push", {stress: stress})


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
  rollResult.positionKey = rollResult.position.charAt(0).toUpperCase() + rollResult.position.slice(1);
  rollResult.positionLocalize = game.i18n.localize("BITD.Roll.Position." + rollResult.positionKey);
  rollResult.effectKey = rollResult.effect.charAt(0).toUpperCase() + rollResult.effect.slice(1);
  rollResult.effectLocalize = game.i18n.localize("BITD.Roll.Effect." + rollResult.effectKey);

  return rollResult
}

function actionRoll(rollData, sheet, formData) {
  rollData.description = game.i18n.localize("BITD.Roll.Action." + rollData.positionKey + "." + rollData.resultKey);
  rollData.effectShow = true;
  rollData.positionShow = true;

  const actionKey = formData.action.charAt(0).toUpperCase() + formData.action.slice(1);
  rollData.name += ": " + game.i18n.localize("BITD." + actionKey);

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

  const attributeKey = formData.attribute.charAt(0).toUpperCase() + formData.attribute.slice(1);
  rollData.name += ": " + game.i18n.localize("BITD." + attributeKey);

  if (sheet) {
    const stress = sheet.system.stress + sufferedStress
    sheet.update({ "system.stress": stress });
  }

  return rollData
}

function fortuneRoll(rollData) {
  rollData.description = game.i18n.localize("BITD.Roll.Fortune." + rollData.resultKey);

  return rollData
}

function GatherInformation(rollData, sheet, formData) {
  rollData.rollAs = formData.rollAs;
  rollData.description = game.i18n.localize("BITD.Roll.GatherInformation." + rollData.effectKey);
  rollData.effectShow = true;

  let addDescription;
  if (rollData.rollAs == "action") {
    addDescription = game.i18n.localize("BITD.Roll.Action." + rollData.positionKey + "." + rollData.resultKey);
    rollData.positionShow = true;
    rollData.rollAs = game.i18n.localize("BITD.Roll.Type.Action");
  } else if (rollData.rollAs == "fortune") {
    addDescription = game.i18n.localize("BITD.Roll.Fortune." + rollData.resultKey);
    rollData.rollAs = game.i18n.localize("BITD.Roll.Type.Fortune");
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

function IndulgeVice(rollData, sheet) {
  let clearStress = rollData.max;
  rollData.description = game.i18n.format("BITD.Roll.IndulgeVice.Regular", {stress: clearStress});

  if (sheet) {
    const stress = sheet.system.stress - clearStress

    if (stress < 0) {
      sheet.update({ "system.stress": 0 });
      rollData.description = game.i18n.localize("BITD.Roll.IndulgeVice.Overindulgence");
      rollData.description += "<ul>" + game.i18n.localize("BITD.Roll.IndulgeVice.Trouble") + game.i18n.localize("BITD.Roll.IndulgeVice.Brag") + game.i18n.localize("BITD.Roll.IndulgeVice.Lost") + game.i18n.localize("BITD.Roll.IndulgeVice.Trapped") + "</ul>";
    } else {
      sheet.update({ "system.stress": stress });
    }
  }

  return rollData
}

async function renderRoll(renderData, speaker) {
  console.log("Render data:", renderData)
  const chatMessage = await renderTemplate("systems/bitd/templates/apps/rollResult.hbs", renderData);
  const chatData = {
    user: game.user.id,
    speaker: speaker,
    content: chatMessage,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    sound: CONFIG.sounds.dice
  };
  ChatMessage.create(chatData);
}

function giveExp(rollData, speaker) {
  const supportedType = ["action", "resistance", "information"];
  if (rollData.position == "desperate" && supportedType.includes(rollData.type)) {
    const actorName = speaker.actor ? speaker.alias : "???";
    const message = game.i18n.format("BITD.Roll.Result.Exp", {actor: actorName});
    const chatData = {
      user: game.user.id,
      speaker: speaker,
      content: message
    };
    ChatMessage.create(chatData);
  }
}
