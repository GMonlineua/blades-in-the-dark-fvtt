export const registerHandlebarsHelpers = function() {
  Handlebars.registerHelper("numLoop", function (num, options) {
    let result = "";

    for (let i = 0, j = num; i < j; i++) {
      result = result + options.fn(i);
    }

    return result;
  });

  Handlebars.registerHelper("getLocalizeName", function (key) {
    const name = "BITD." + key.charAt(0).toUpperCase() + key.slice(1);
    const localizeName = game.i18n.localize(name);

    return localizeName;
  });

  Handlebars.registerHelper("getLocalizeDescription", function (type, key) {
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

  Handlebars.registerHelper("toolClass", function (item) {
    let classes;

    if (item.equipped && item.broken) {
      classes = "active broken";
    } else if (item.equipped) {
      classes = "active";
    } else if (item.broken) {
      classes = "broken";
    }

    return classes
  });
}
