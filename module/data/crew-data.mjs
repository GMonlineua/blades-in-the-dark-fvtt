import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class CrewData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = {required: true, nullable: false, integer: true};
    const requiredPositiveInteger = {...requiredInteger, min: 0};

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
        max: new fields.NumberField({requiredPositiveInteger, initial: 12 }),
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
      contacts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
        relationship: new fields.NumberField({requiredInteger, min: -1, max: 1, initial: 0 })
      })),

      description: new fields.HTMLField()
    };
  }
}
