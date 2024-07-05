export class AbilityScoundrelData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      active: new fields.BooleanField(),
      description: new fields.HTMLField()
    }
  }
}

export class AbilityCrewData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      active: new fields.BooleanField(),
      description: new fields.HTMLField()
    }
  }
}

export class ClaimData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      active: new fields.BooleanField(),
      effect: new fields.StringField(),
      description: new fields.HTMLField()
    }
  }
}

export class CohortData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      type: new fields.StringField(),
      specialisation: new fields.StringField(),
      elite: new fields.BooleanField(),
      armor: new fields.BooleanField(),
      harm: new fields.SchemaField({
        value: new fields.NumberField({required: true, nullable: false, integer: true, min: 0, initial: 0 }),
        max: new fields.NumberField({required: true, nullable: false, integer: true, min: 0, initial: 4 }),
      }),
      edges: new fields.StringField(),
      flaws: new fields.StringField(),
      description: new fields.HTMLField()
    }
  }
}

export class ToolData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      type: new fields.StringField(),
      loadout: new fields.NumberField({required: true, nullable: false, integer: true, min: 0, initial: 1}),
      equipped: new fields.BooleanField(),
      broken: new fields.BooleanField(),
      description: new fields.HTMLField()
    }
  }
}

export class UpgradeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      active: new fields.BooleanField(),
      price: new fields.NumberField({required: true, nullable: false, integer: true, min: 0, initial: 1}),
      description: new fields.HTMLField()
    }
  }
}
