import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class FactionData extends foundry.abstract.TypeDataModel {
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
      status: new fields.StringField({...requiredInteger, initial: "neutral" }),
      summary: new fields.StringField(),

      lair: new fields.SchemaField({
        value: new fields.StringField(),
        show: new fields.BooleanField({ initial: false })
      }),
      assets: new fields.SchemaField({
        value: new fields.StringField(),
        show: new fields.BooleanField({ initial: false })
      }),
      quirks: new fields.SchemaField({
        value: new fields.StringField(),
        show: new fields.BooleanField({ initial: false })
      }),

      showTurf: new fields.BooleanField({ initial: false }),

      members: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        show: new fields.BooleanField({ initial: false })
      })),

      relatedFactions: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        tier: new fields.NumberField(),
        status: new fields.StringField({initial: "neutral"}),
        show: new fields.BooleanField({ initial: false })
      })),

      goals: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        img: new fields.StringField(),
        progress: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 }),
        }),
        show: new fields.BooleanField({ initial: false })
      })),

      situation: new fields.HTMLField(),
      description: new fields.HTMLField()
    }
  }
}
