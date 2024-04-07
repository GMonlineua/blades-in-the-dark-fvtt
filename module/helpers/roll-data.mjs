export function getRollData(type, sheet, note) {
  const rollData = {
    action: {
      defaultType: type,
      diceNumber: getValue(sheet, note),
      positionANDeffect: true
    },
    resistance: {
      defaultType: type,
      diceNumber: getValue(sheet, note)
    },
    fortune: {
      defaultType: type,
      diceNumber: 1
    },
    information: {
      defaultType: type,
      diceNumber: 1,
      positionANDeffect: true
    },
    engagement: {
      defaultType: type,
      diceNumber: 1
    },
    asset: {
      defaultType: type,
      diceNumber: 1
    },
    vice: {
      defaultType: type,
      diceNumber: 1
    }
  };

  const templateData = {
    type: {
      action: game.i18n.localize("BITD.Roll.Type.Action"),
      resistance: game.i18n.localize("BITD.Roll.Type.Resistance"),
      fortune: game.i18n.localize("BITD.Roll.Type.Fortune"),
      information: game.i18n.localize("BITD.Roll.Type.GatherInformation"),
      engagement: game.i18n.localize("BITD.Roll.Type.Engagement"),
      asset: game.i18n.localize("BITD.Roll.Type.AcquireAsset"),
      vice: game.i18n.localize("BITD.Roll.Type.IndulgeVice")
    },
    attributes: {
      insight: game.i18n.localize("BITD.Insight"),
      prowess: game.i18n.localize("BITD.Prowess"),
      resolve: game.i18n.localize("BITD.Resolve")
    },
    actions: {
      hunt: game.i18n.localize("BITD.Hunt"),
      study: game.i18n.localize("BITD.Study"),
      survey: game.i18n.localize("BITD.Survey"),
      tinker: game.i18n.localize("BITD.Tinker"),
      finesse: game.i18n.localize("BITD.Finesse"),
      prowl: game.i18n.localize("BITD.Prowl"),
      skirmish: game.i18n.localize("BITD.Skirmish"),
      wreck: game.i18n.localize("BITD.Wreck"),
      attune: game.i18n.localize("BITD.Attune"),
      command: game.i18n.localize("BITD.Command"),
      consort: game.i18n.localize("BITD.Consort"),
      sway: game.i18n.localize("BITD.Sway")
    },
    position: {
      controlled: game.i18n.localize("BITD.Roll.Position.Controlled"),
      risky: game.i18n.localize("BITD.Roll.Position.Risky"),
      desperate: game.i18n.localize("BITD.Roll.Position.Desperate")
    },
    effect: {
      limited: game.i18n.localize("BITD.Roll.Effect.Limited"),
      standard: game.i18n.localize("BITD.Roll.Effect.Standard"),
      great: game.i18n.localize("BITD.Roll.Effect.Great")
    }
  }

  Object.assign(templateData, rollData[type]);

  return templateData;
}

function getValue(sheet, note) {
  let value = 1;
  console.log("getValue:", sheet, note)

  if (sheet && note) {
    const noteKeys = note.split('.');
    let path = sheet.system.attributes;

    for (const key of noteKeys) {
      if (path[key]) {
        path = path[key];
      } else {
        path = null;
        break;
      }
    }

    if (path !== null) {
      value = path;
    }
  }

  return value
}
