export default class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      names: new fields.SchemaField({
        useAlias: new fields.BooleanField({ initial: false }),
        real: new fields.StringField(),
        alias: new fields.StringField(),
      }),
      summary: new fields.StringField(),
      description: new fields.HTMLField(),
    };
  }
}
