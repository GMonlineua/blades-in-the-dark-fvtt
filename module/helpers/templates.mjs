 /**
  *@return {Promise}
  */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    "systems/bitd/templates/actor/parts/abilities.hbs",
    "systems/bitd/templates/actor/parts/attributes.hbs",
    "systems/bitd/templates/actor/parts/claims-map.hbs",
    "systems/bitd/templates/actor/parts/cohorts.hbs",
    "systems/bitd/templates/actor/parts/contacts.hbs",
    "systems/bitd/templates/actor/parts/harm.hbs",
    "systems/bitd/templates/actor/parts/inventory.hbs",
    "systems/bitd/templates/actor/parts/scoundrel-notes.hbs",
    "systems/bitd/templates/actor/parts/stress-trauma.hbs",
    "systems/bitd/templates/actor/parts/upgrades.hbs",

    "systems/bitd/templates/item/parts/claims-map.hbs",
    "systems/bitd/templates/item/parts/linked-item.hbs",
  ]);
};
