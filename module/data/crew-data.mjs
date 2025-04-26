import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class CrewData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredPositiveInteger = { ...requiredInteger, min: 0 };
    const defaultClaims = Array.from({ length: 15 }, () => ({
      id: "",
      name: "",
      type: "turf",
      active: false,
      effect: "",
    }));
    defaultClaims[7].type = "home";

    const defaultPrison = Array.from({ length: 12 }, () => ({
      id: "",
      name: "",
      type: "turf",
      active: false,
      effect: "",
    }));
    defaultPrison[5].type = "home";

    return {
      tier: new fields.SchemaField({
        value: new fields.NumberField({ requiredPositiveInteger, initial: 1 }),
        max: new fields.NumberField({ requiredPositiveInteger, initial: 5 }),
      }),
      hold: new fields.StringField({ initial: "strong" }),
      exp: new fields.SchemaField({
        value: new fields.NumberField({ requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({ requiredPositiveInteger, initial: 10 }),
      }),
      coins: new fields.SchemaField({
        value: new fields.NumberField({ requiredPositiveInteger, initial: 2 }),
        max: new fields.NumberField({ requiredPositiveInteger, initial: 4 }),
      }),
      reputation: new fields.SchemaField({
        type: new fields.StringField(),
        value: new fields.NumberField({ requiredPositiveInteger, initial: 0 }),
        modifier: new fields.NumberField({ requiredInteger, initial: 0 }),
      }),
      tier: new fields.SchemaField({
        value: new fields.NumberField({ requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({ requiredPositiveInteger, initial: 4 }),
      }),
      heat: new fields.SchemaField({
        value: new fields.NumberField({ requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({ requiredPositiveInteger, initial: 9 }),
      }),
      wanted: new fields.SchemaField({
        value: new fields.NumberField({ requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({ requiredPositiveInteger, initial: 4 }),
      }),
      lair: new fields.StringField(),
      hunting: new fields.SchemaField({
        customName: new fields.StringField(),
        ground: new fields.StringField(),
        operation: new fields.StringField(),
      }),

      playbook: new fields.ForeignDocumentField(BitdItem, { idOnly: true }),

      members: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdActor, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
        }),
      ),

      contacts: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdActor, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          relationship: new fields.NumberField({
            requiredPositiveInteger,
            max: 3,
            initial: 1,
          }),
        }),
      ),

      relatedFactions: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdActor, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          tier: new fields.NumberField(),
          status: new fields.StringField({ initial: "neutral" }),
        }),
      ),

      goals: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdActor, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          img: new fields.StringField(),
          progress: new fields.SchemaField({
            value: new fields.NumberField({
              requiredPositiveInteger,
              initial: 0,
            }),
            max: new fields.NumberField({
              requiredPositiveInteger,
              initial: 4,
            }),
          }),
        }),
      ),

      claimsMap: new fields.SchemaField({
        rows: new fields.NumberField({
          requiredInteger,
          min: 3,
          max: 10,
          initial: 3,
        }),
        columns: new fields.NumberField({
          requiredInteger,
          min: 3,
          max: 10,
          initial: 5,
        }),
        map: new fields.ArrayField(
          new fields.SchemaField({
            id: new fields.ForeignDocumentField(BitdItem, {
              idOnly: true,
              blank: true,
            }),
            name: new fields.StringField({ required: true }),
            type: new fields.StringField({ required: true, initial: "turf" }),
            active: new fields.BooleanField({ initial: false }),
            effect: new fields.StringField(),
          }),
          {
            required: true,
            initial: defaultClaims,
          },
        ),
      }),

      prisonMap: new fields.SchemaField({
        rows: new fields.NumberField({
          requiredInteger,
          min: 3,
          max: 10,
          initial: 3,
        }),
        columns: new fields.NumberField({
          requiredInteger,
          min: 3,
          max: 10,
          initial: 4,
        }),
        map: new fields.ArrayField(
          new fields.SchemaField({
            id: new fields.ForeignDocumentField(BitdItem, {
              idOnly: true,
              blank: true,
            }),
            name: new fields.StringField({ required: true }),
            type: new fields.StringField({ required: true, initial: "turf" }),
            active: new fields.BooleanField({ initial: false }),
            effect: new fields.StringField(),
          }),
          {
            required: true,
            initial: defaultPrison,
          },
        ),
      }),

      description: new fields.HTMLField(),
    };
  }

  /* -------------------------------------------- */

  /**
   * Migrate legacy data to the new structure.
   * @param {object} source - The source data to migrate.
   * @returns {object} The migrated data.
   */
  static migrateData(source) {
    if (source.claims) {
      const map = this.migrateMap(source.claims);

      source.claimsMap = {
        rows: 3,
        columns: 5,
        map: map,
      };
    }

    if (source.prison) {
      const map = this.migrateMap(source.prison);

      source.prisonMap = {
        rows: 3,
        columns: 4,
        map: map,
      };
    }

    return super.migrateData(source);
  }

  /** @inheritdoc */
  prepareDerivedData() {
    // Count turfs
    this.turfs = 0;
    for (const claim of this.claimsMap.map) {
      if (claim.type == "turf" && claim.active) this.turfs++
    }

    // Count max reputation
    const rep = this.reputation;
    rep.max = 12 - this.turfs + rep.modifier;
  }
}
