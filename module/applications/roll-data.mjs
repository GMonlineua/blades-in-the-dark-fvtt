export function getRollData(type, note) {
  const rollData = {
    action: {
      defaultAction: note ? note : ""
    },
    resistance: {
      defaultAttribute: note ? note : ""
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
    defaultType: type ? type : "",
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
      zero: game.i18n.localize("BITD.Roll.Effect.Zero"),
      limited: game.i18n.localize("BITD.Roll.Effect.Limited"),
      standard: game.i18n.localize("BITD.Roll.Effect.Standard"),
      great: game.i18n.localize("BITD.Roll.Effect.Great"),
      extreme: game.i18n.localize("BITD.Roll.Effect.Extreme")
    },
    fortuneRollResult: {
      fail: "Zero",
      mixed: "Limited",
      success: "Standard",
      critical: "Great"
    },
    effectSequence: ["Zero", "Limited", "Standard", "Great", "Extreme"]
  }

  Object.assign(templateData, rollData[type]);

  return templateData;
}
