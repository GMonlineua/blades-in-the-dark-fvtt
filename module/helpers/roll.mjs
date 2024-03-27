export async function createRollDialog (type, sheet, note) {
  let { rollName, rollFunction, templateData } = getTestData(type, sheet, note);
  console.log(rollName, rollFunction, templateData)

  const html = await renderTemplate("systems/bitd/templates/apps/rollDialog.hbs", templateData);

  const dialog = new Dialog({
    title: game.i18n.localize("BITD.Roll.Title"),
    content: html,
    buttons: {
      roll: {
        label: game.i18n.localize("BITD.Roll.Button"),
        icon: '<i class="fas fa-dice"></i>',
        callback: async (html) => {
          const formData = new FormData(html[0].querySelector("form"));
          const data = toIntData(Object.fromEntries(formData.entries()));

          const rollData = await roll(data);
          rollData.name = rollName;
          console.log(rollData);
          rollFunction(rollData, sheet, data);
          console.log(rollData);
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
  });
  dialog.render(true);
}

function getTestData(type, sheet, note) {
  let attribute, action, actionLocalize;

  if (type == "action") {
    attribute = note.split('.')[0];
    action = note.split('.')[2];
    actionLocalize = game.i18n.localize("BITD." + action.charAt(0).toUpperCase() + action.slice(1));
  } else {
    actionLocalize = "";
  }

  const testData = {
    action: {
      rollName: `${game.i18n.localize("BITD.RollType.Action")}: ${actionLocalize}`,
      rollFunction: actionRoll,
      templateData: {
        diceNumber: note ? sheet.system.attributes[attribute].actions[action] : '',
        rollType: type
      }
    },
    fortune: {
      rollName: game.i18n.localize("ROGUE.RollType.Fortune"),
      rollFunction: fortuneRoll,
      templateData: {
        diceNumber: 1,
        rollType: type
      }
    }
  };

  return testData[type];
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
  const number = data.diceNumber + data.modifier;
  const roll = new Roll(number + "d6");
  await roll.evaluate();
  const resultsArr = roll.terms[0].results.map((element) => (element.result));

  const rollResult = {
    dice: resultsArr,
    max: Math.max(...resultsArr)
  }

  if (resultsArr.filter(num => num === 6).length === 2) {
    rollResult.result = "critical";
  } else {
    switch (rollData.max) {
      case 6:
        rollResult.result = "success";
        break;
      case 4:
      case 5:
        rollResult.result = "mixed";
        break;
      case 1:
      case 2:
      case 3:
        rollResult.result = "fail";
    }
  }

  return rollResult
}

function actionRoll(rollData, sheet, formData) {
  console.log(rollData);
}

function fortuneRoll(rollData) {
  switch (rollData.result) {
    case "critical":
      rollResult.description = game.i18n.localize("BITD.FortuneRoll.Critical");
      break;
    case "success":
      rollResult.description = game.i18n.localize("BITD.FortuneRoll.Success");
      break;
    case "mixed":
      rollResult.description = game.i18n.localize("BITD.FortuneRoll.Mixed");
      break;
    case "fail":
      rollResult.description = game.i18n.localize("BITD.FortuneRoll.Fail");
  }

  return rollData
}
