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
        break;
      default:
        throw "Unknown operator " + operator;
    }

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper("getValue", function(parent, path) {
    let value = parent;
    if (path.string || path.includes(".")) {
      const keys = path.string.split(".");

      for (const key of keys) {
        value = value[key];
      }
    } else {
      value = value[path];
    }
    return value;
  });

  Handlebars.registerHelper("getLocalize", function(path, key) {
    const name = path + key.charAt(0).toUpperCase() + key.slice(1);
    const localizeName = game.i18n.localize(name);

    return localizeName;
  });

  Handlebars.registerHelper("toolClass", function(data) {
    const conditions = [
      { condition: data.equipped, className: "active" },
      { condition: data.broken, className: "broken" },
      { condition: !data.loadout, className: "light" },
    ];
    let classes = "";

    conditions.forEach(({ condition, className }) => {
      if (condition) {
        classes += ` ${className}`;
      }
    });

    return classes;
  });

  Handlebars.registerHelper("getCohorHarm", function(key) {
    const name = CONFIG.BITD.cohort.harm[key];
    const localizeName = game.i18n.localize(name);

    return localizeName;
  });
};
