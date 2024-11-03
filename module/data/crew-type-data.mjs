import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class CrewTypeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const defaultClaims = Array.from({ length: 15 }, () => ({
      id: "",
      uuid: "",
      name: "Turf"
    }));
    defaultClaims[7].name = "Lair";

    return {
      abilities: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
        docType: new fields.StringField({initial: "Item"})
      })),
      cohorts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        type: new fields.StringField(),
        title: new fields.StringField(),
        docType: new fields.StringField({initial: "Item"})
      })),
      claims: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdItem, {idOnly: true, blank: true}),
          uuid: new fields.StringField(),
          name: new fields.StringField({ required: true }),
          type: new fields.StringField(),
          title: new fields.StringField(),
          docType: new fields.StringField({initial: "Item"})
        }),
        {
          required: true,
          initial: defaultClaims
        }
      ),
      upgrades: new fields.ArrayField(new fields.SchemaField({
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
