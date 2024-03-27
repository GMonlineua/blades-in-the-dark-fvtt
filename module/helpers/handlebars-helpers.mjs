export const registerHandlebarsHelpers = function() {
  Handlebars.registerHelper("numLoop", function (num, options) {
    let result = "";

    for (let i = 0, j = num; i < j; i++) {
      result = result + options.fn(i);
    }

    return result;
  });

  Handlebars.registerHelper("iff", function (a, operator, b, opts) {
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

    console.log("case", a, operator, b, bool)

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper("getLocalizeName", function (key, options) {
    const name = "BITD." + key.charAt(0).toUpperCase() + key.slice(1);
    const localizeName = game.i18n.localize(name);

    return localizeName;
  });

  Handlebars.registerHelper("getLocalizeDescription", function (type, key, options) {
    const localizeKey = key.charAt(0).toUpperCase() + key.slice(1);
    let name;
    switch (type) {
      case "attribute":
        name = "BITD.AttributeDescription." + localizeKey;
        break;
      case "action":
        name = "BITD.ActionDescription." + localizeKey;
        break;
    }
    const localizeName = game.i18n.localize(name);

    return localizeName;
  });

  Handlebars.registerHelper("testCon", function (i, options) {
    console.log(i);

    return options.fn(i);
  });
}
