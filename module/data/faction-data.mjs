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

      goals: new fields.SchemaField({
        value: new fields.StringField(),
        show: new fields.BooleanField({ initial: false })
      }),
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

      npc: new fields.SchemaField({
        actors: new fields.ArrayField(new fields.ForeignDocumentField(BitdActor, {idOnly: true})),
        show: new fields.BooleanField({ initial: false })
      }),

      contacts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
      })),

      relatedFactions: new fields.SchemaField({
        allies: new fields.StringField(),
        enemies: new fields.StringField(),
        show: new fields.BooleanField({ initial: false })
      }),

      situation: new fields.HTMLField(),
      description: new fields.HTMLField()
    }
  }
}
