import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class ScoundrelData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = {required: true, nullable: false, integer: true};
    const requiredPositiveInteger = {...requiredInteger, min: 0};

    return {
      alias: new fields.StringField(),
      vice: new fields.StringField(),
      look: new fields.StringField(),
      belives: new fields.StringField(),
      drives: new fields.StringField(),
      heritage: new fields.StringField(),
      background: new fields.StringField(),
      stress: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 9 })
      }),
      trauma: new fields.ArrayField(new fields.StringField()),
      coins: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
      }),
      stash: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 30 })
      }),
      exp: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 8 })
      }),
      load: new fields.SchemaField({
        max: new fields.NumberField({requiredPositiveInteger, initial: 5 })
      }),

      healing: new fields.SchemaField({
        value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
        max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
      }),
      harm: new fields.SchemaField({
        lesser: new fields.ArrayField(new fields.StringField(), {
          validate: v => v.length <= 2,
          validationError: "must only have 2 Lesser harms"
        }),
        moderate: new fields.ArrayField(new fields.StringField(), {
          validate: v => v.length <= 2,
          validationError: "must only have 2 Moderate harms"
        }),
        severe: new fields.StringField()
      }),

      attributes: new fields.SchemaField({
        insight: new fields.SchemaField({
          exp: new fields.SchemaField({
            value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
            max: new fields.NumberField({requiredPositiveInteger, initial: 6 })
          })
        }),
        prowess: new fields.SchemaField({
          exp: new fields.SchemaField({
            value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
            max: new fields.NumberField({requiredPositiveInteger, initial: 6 })
          })
        }),
        resolve: new fields.SchemaField({
          exp: new fields.SchemaField({
            value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
            max: new fields.NumberField({requiredPositiveInteger, initial: 6 })
          })
        }),
      }),

      actions: new fields.SchemaField({
        hunt: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        study: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        survey: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        tinker: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        finesse: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        prowl: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        skirmish: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        wreck: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        attune: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        command: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        consort: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        }),
        sway: new fields.SchemaField({
          value: new fields.NumberField({requiredPositiveInteger, initial: 0 }),
          max: new fields.NumberField({requiredPositiveInteger, initial: 4 })
        })
      }),

      playbook: new fields.ForeignDocumentField(BitdItem, {idOnly: true}),
      contacts: new fields.ArrayField(new fields.SchemaField({
        id: new fields.ForeignDocumentField(BitdActor, {idOnly: true}),
        uuid: new fields.StringField(),
        name: new fields.StringField(),
        relationship: new fields.NumberField({requiredPositiveInteger, max: 3, initial: 1 })
      })),

      description: new fields.HTMLField()
    }
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedData() {
    for (const [attrKey, attribute] of Object.entries(this.attributes)) {
      attribute.value = 0;
      const linkedActions = CONFIG.BITD.attributeLinks[attrKey];
      for (const key of linkedActions) {
        const action = this.actions[key];
        if (action.value > 0) attribute.value += 1;
      }
    }

    const load = this.load;
    load.value = 0;
    for (const i of this.parent.items) {
      if (i.system.loadout && i.system.equipped) {
        load.value += i.system.loadout;
      }
    }
  }
}
