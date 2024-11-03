import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class CrewData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = {required: true, nullable: false, integer: true};
    const requiredPositiveInteger = {...requiredInteger, min: 0};
    const defaultClaims = Array.from({ length: 15 }, () => ({
      id: "",
      name: "Turf",
      active: false
    }));
    defaultClaims[7].name = "Lair";

    return {
      tier: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 1 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 5 }),
      }),
      hold: new fields.StringField({initial: "strong"}),
      exp: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 10 }),
      }),
      coins: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 2 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 4 }),
      }),
      reputation: new fields.SchemaField({
        type: new fields.StringField(),
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
      }),
      tier: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 4 }),
      }),
      turf: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 6 }),
      }),
      heat: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 9 }),
      }),
      wanted: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 4 }),
      }),
      lair: new fields.StringField(),
      hunting: new fields.SchemaField({
        ground: new fields.StringField(),
        operation: new fields.StringField(),
      }),

      playbook: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
      members: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField()
      })),
      contacts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        relationship: new fields.NumberField({requiredPositiveInteger, max: 3, initial: 1 })
      })),
      relatedFactions: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        tier: new fields.NumberField(),
        status: new fields.StringField({initial: "neutral"})
      })),
      goals: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        img: new fields.StringField(),
        progress: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 }),
        })
      })),

      claims: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdItem, {idOnly: true, blank: true}),
          name: new fields.StringField({ required: true }),
          active: new fields.BooleanField({initial: false}),
          effect: new fields.StringField()
        }),
        {
          required: true,
          initial: defaultClaims
        }
      ),

      description: new fields.HTMLField()
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedData() {
    this.reputation.max = 12 - this.turf.value;
  }
}
