import { BitdActor, BitdItem } from "../documents/_module.mjs";

export default class CrewTypeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const defaultClaims = Array.from({ length: 15 }, () => ({
      id: "",
      uuid: "",
      name: "",
      type: "turf",
      active: false
    }));
    defaultClaims[7].type = "home";

    return {
      abilities: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdItem, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          type: new fields.StringField(),
          title: new fields.StringField(),
          docType: new fields.StringField({ initial: "Item" }),
        }),
      ),
      cohorts: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdItem, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          type: new fields.StringField(),
          title: new fields.StringField(),
          docType: new fields.StringField({ initial: "Item" }),
        }),
      ),
      claimsMap: new fields.SchemaField({
        rows: new fields.NumberField({
          requiredInteger,
          min: 3,
          max: 10,
          initial: 3,
        }),
        columns: new fields.NumberField({
          requiredInteger,
          min: 3,
          max: 10,
          initial: 5,
        }),
        map: new fields.ArrayField(
          new fields.SchemaField({
            id: new fields.ForeignDocumentField(BitdItem, {
              idOnly: true,
              blank: true,
            }),
            uuid: new fields.StringField(),
            name: new fields.StringField({ required: true }),
            type: new fields.StringField({ required: true, initial: "turf" }),
            active: new fields.BooleanField({ initial: false }),
          }),
          {
            required: true,
            initial: defaultClaims,
          },
        ),
      }),
      upgrades: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdItem, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          type: new fields.StringField(),
          title: new fields.StringField(),
          docType: new fields.StringField({ initial: "Item" }),
        }),
      ),
      contacts: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.ForeignDocumentField(BitdActor, { idOnly: true }),
          uuid: new fields.StringField(),
          name: new fields.StringField(),
          type: new fields.StringField(),
          title: new fields.StringField(),
          docType: new fields.StringField({ initial: "Actor" }),
        }),
      ),

      summary: new fields.StringField(),
      exp: new fields.StringField(),
      description: new fields.HTMLField(),
    };
  }

  /* -------------------------------------------- */

  /**
   * Migrate legacy data to the new structure.
   * @param {object} source - The source data to migrate.
   * @returns {object} The migrated data.
   */
  static migrateData(source) {
    if (source.claims) {
      const map = this.migrateMap(source.claims)

      source.claimsMap = {
        rows: 3,
        columns: 5,
        map: map,
      };
    }

    return super.migrateData(source);
  }

  /** Migrate map method */
  static migrateMap(data) {
    const map = [];
    for (const claim of data) {
      if (claim.name === "Lair") {
        map.push({
          id: "",
          uuid: "",
          name: "",
          type: "home",
          active: false
        });
      } else if (claim.id) {
        map.push({
          id: claim.id,
          uuid: claim.uuid,
          name: claim.name,
          type: "claim",
          active: claim.active,
        });
      } else {
        map.push({
          id: "",
          uuid: "",
          name: "",
          type: "turf",
          active: false,
        });
      }
    }

    return map;
  }
}
