export const registerHandlebarsHelpers = function() {
  Handlebars.registerHelper("numLoop", function(num, options) {
    let result = "";
    for (let i = 0, j = num; i < j; i++) {
      result = result + options.fn(i);
    }

        return result;
    });

  Handlebars.registerHelper("iff", function(a, operator, b, opts) {
    let bool = false;
    switch (operator) {
      case "==":
        bool = a == b;
        break;
      case ">":
        bool = a > b;
        break;
      case "<":
        bool = a < b;
        break;
      case ">=":
        bool = parseInt(a) >= parseInt(b);
        break;
      case "<=":
        bool = a <= b;
        break;
      case "!=":
        bool = a != b;
        break;
      case "contains":
        if (a && b) {
          bool = a.includes(b);
        } else {
          bool = false;
        }

  Handlebars.registerHelper("getValue", function(parent, path) {
    let value = parent;
    if (path.string || path.includes(".")) {
      const keys = path.string.split(".");

    Handlebars.registerHelper("getValue", function(parent, path) {
        let value = parent;
        if (path.string || path.includes(".")) {
            const keys = path.string.split(".");

  Handlebars.registerHelper("getLocalize", function(path, key) {
    const name = path + key.charAt(0).toUpperCase() + key.slice(1);
    const localizeName = game.i18n.localize(name);

    Handlebars.registerHelper("getLocalize", function(path, key) {
        const name = path + key.charAt(0).toUpperCase() + key.slice(1);
        const localizeName = game.i18n.localize(name);

  Handlebars.registerHelper("toolClass", function(data) {
    const conditions = [
      { condition: data.equipped, className: "active" },
      { condition: data.broken, className: "broken" },
      { condition: !data.loadout, className: "light" },
    ];
    let classes = "";

        return classes;
    });
 
    return classes;
  });

  Handlebars.registerHelper("getCohorHarm", function(key) {
    const name = CONFIG.BITD.cohort.harm[key];
    const localizeName = game.i18n.localize(name);

        return localizeName;
    });
};
