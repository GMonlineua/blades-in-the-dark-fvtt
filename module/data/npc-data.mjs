export default class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      realName: new fields.StringField(),
      aka: new fields.StringField(),
      summary: new fields.StringField(),
      description: new fields.HTMLField(),
    };
  }
}
