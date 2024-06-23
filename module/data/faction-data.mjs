import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class FactionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = {required: true, nullable: false, integer: true};
    const requiredPositiveInteger = {...requiredInteger, min: 0};
    const textFiled = {
      value: new fields.StringField(),
      show: new fields.BooleanField({ initial: false })
    };

    const schema = {
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

      situation: new fields.HTMLField(),
      description: new fields.HTMLField()
    };

    // NPC connected to faction
    schema.npc = new fields.SchemaField({
      // items: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
      // actors: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
      show: new fields.BooleanField({ initial: false })
    });

    // Claims connected to faction
    schema.turf = new fields.SchemaField({
      // items: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
      show: new fields.BooleanField({ initial: false })
    });

    // Claims connected to faction
    schema.relatedFactions = new fields.SchemaField({
      allies: new fields.StringField(),
      enemies: new fields.StringField(),
      show: new fields.BooleanField({ initial: false })
    });

    return schema;
  }
}
