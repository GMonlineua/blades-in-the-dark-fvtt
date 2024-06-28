import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class CrewTypeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      abilities: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
      })),
      cohorts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
      })),
      claims: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
      })),
      upgrades: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
      })),
      relationship: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
      })),

      summary: new fields.StringField(),
      exp: new fields.StringField(),
      description: new fields.HTMLField()
    }
  }
}
