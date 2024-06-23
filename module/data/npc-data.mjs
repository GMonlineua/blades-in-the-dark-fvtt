export default class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.name = new fields.StringField();
    schema.aka = new fields.StringField();

    schema.description = new fields.HTMLField();

    return schema;
  }
}
