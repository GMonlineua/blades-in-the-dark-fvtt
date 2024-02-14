 /**
  *@return {Promise}
  */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    "systems/bitd/templates/actor/parts/attributes.hbs",
  ]);
};
