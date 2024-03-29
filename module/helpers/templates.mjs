 /**
  *@return {Promise}
  */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    "systems/bitd/templates/actor/parts/abilities.hbs",
    "systems/bitd/templates/actor/parts/attributes.hbs",
    "systems/bitd/templates/actor/parts/armor-harm.hbs",
    "systems/bitd/templates/actor/parts/contacts.hbs",
    "systems/bitd/templates/actor/parts/inventory.hbs",
    "systems/bitd/templates/actor/parts/stress-trauma.hbs",

    "systems/bitd/templates/item/parts/linked-item.hbs",
  ]);
};
