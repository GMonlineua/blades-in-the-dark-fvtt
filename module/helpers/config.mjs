export const BITD = {
  attributeLinks: {
    insight: ["hunt", "study", "survey", "tinker"],
    prowess: ["finesse", "prowl", "skirmish", "wreck"],
    resolve: ["attune", "command", "consort", "sway"]
  },
  defaultItems: {
    scoundrel: ["HZxYeBCQ4bZ632WU", "2H0lH4IeGq22kDyg", "cF0hFmTlXxI8CKSC", "FFNGcKvAeOjoGyI8", "jWTVSlCXWeOiGbfg", "vgMbINvoCQJAYp4q", "6NrhTvPbJTJJUn4s", "vrPi03rFguHYueWZ", "gnv9k4enWnR13mW4", "SapwXYuraydiNjej", "P95oe4AZgSomPqPs", "brU5pWiXWlG5o1Mi", "6cUx1jXXq4dx3wln", "oZOplJcmR6CjQZbO", "Wxoq19qr9LEuuNp4", "IDUBdq7KVd3dxC5W"],
    crew: ["QYT0VHUnH7NvELXE", "0jzSjAD7aC7sTJWB", "JRUITBP7ejrAS7DE", "a78hFI8IrZ4GvmMO", "gwPjJVlyOdpHHkSZ", "iK5vthVkcbBjwl9W", "eOYEeQFnf0Lpflst", "sIzU9C2J8Ff888hZ", "LGG0DCb9qv2Pijy7", "BJG1pPeOQQHc4Sxb", "DYvuI3w5fSwLstvG", "LOPmlnXrAI5baXOx"]
  },
  holdTypes: {strong: "BITD.Hold.Strong", weak: "BITD.Hold.Weak"},
  statusTypes: {
    allies: "BITD.Status.Allies",
    friendly: "BITD.Status.Friendly",
    helpful: "BITD.Status.Helpful",
    neutral: "BITD.Status.Neutral",
    interfering: "BITD.Status.Interfering",
    hostile: "BITD.Status.Hostile",
    war: "BITD.Status.War"
  },
  cohort: {
    types: {
      none: "",
      gang: "BITD.Cohort.Gang",
      expert: "BITD.Cohort.Expert"
    },
    gangTypes: {
      adepts: "BITD.Cohort.GangType.Adepts",
      rooks: "BITD.Cohort.GangType.Rooks",
      rovers: "BITD.Cohort.GangType.Rovers",
      skulks: "BITD.Cohort.GangType.Skulks",
      thugs: "BITD.Cohort.GangType.Thugs"
    },
    harm: {
      none: "BITD.Cohort.NoHarm",
      weakened: "BITD.Cohort.Weakened",
      impaired: "BITD.Cohort.Impaired",
      broken: "BITD.Cohort.Broken",
      dead: "BITD.Cohort.Dead"
    }
  },
  toolType: {
    common: "BITD.Tool.Common",
    special: "BITD.Tool.Special"
  },

  rolls: {
    type: {
      action: "BITD.Roll.Type.Action",
      resistance: "BITD.Roll.Type.Resistance",
      fortune: "BITD.Roll.Type.Fortune",
      information: "BITD.Roll.Type.GatherInformation",
      engagement: "BITD.Roll.Type.Engagement",
      asset: "BITD.Roll.Type.AcquireAsset",
      vice: "BITD.Roll.Type.IndulgeVice"
    },
    rollAs: {
      action: "BITD.Roll.Type.Action",
      fortune: "BITD.Roll.Type.Fortune"
    },
    attributes: {
      insight: "BITD.Insight",
      prowess: "BITD.Prowess",
      resolve: "BITD.Resolve"
    },
    actions: {
      hunt: "BITD.Hunt",
      study: "BITD.Study",
      survey: "BITD.Survey",
      tinker: "BITD.Tinker",
      finesse: "BITD.Finesse",
      prowl: "BITD.Prowl",
      skirmish: "BITD.Skirmish",
      wreck: "BITD.Wreck",
      attune: "BITD.Attune",
      command: "BITD.Command",
      consort: "BITD.Consort",
      sway: "BITD.Sway"
    },
    position: {
      controlled: "BITD.Roll.Position.Controlled",
      risky: "BITD.Roll.Position.Risky",
      desperate: "BITD.Roll.Position.Desperate"
    },
    effect: {
      zero: "BITD.Roll.Effect.Zero",
      limited: "BITD.Roll.Effect.Limited",
      standard: "BITD.Roll.Effect.Standard",
      great: "BITD.Roll.Effect.Great",
      extreme: "BITD.Roll.Effect.Extreme"
    },
    fortuneRollResult: {
      fail: "Zero",
      mixed: "Limited",
      success: "Standard",
      critical: "Great"
    },
    effectSequence: ["zero", "limited", "standard", "great", "extreme"]
  }
};
