import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class PlaybookData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredPositiveInteger = {required: true, nullable: false, integer: true, min: 0};

    return {
      actions: new fields.SchemaField({
        hunt: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        study: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        survey: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        tinker: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        finesse: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        prowl: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        skirmish: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        wreck: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        attune: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        command: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        consort: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        sway: new fields.NumberField({requiredPositiveInteger, initial: 0 })
      }),

      abilities: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
        docType: new fields.StringField({initial: "Item"})
      })),
      inventory: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
        docType: new fields.StringField({initial: "Item"})
      })),
      contacts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
        docType: new fields.StringField({initial: "Actor"})
      })),

      summary: new fields.StringField(),
      exp: new fields.StringField(),
      description: new fields.HTMLField()
    }
  }
}
