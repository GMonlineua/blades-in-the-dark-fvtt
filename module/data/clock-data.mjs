export default class ClockData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredPositiveInteger = {required: true, nullable: false, integer: true, min: 0};

    return {
      progress: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 4 }),
      }),

      description: new fields.HTMLField()
    };
  }
}
