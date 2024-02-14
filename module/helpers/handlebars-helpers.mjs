export const registerHandlebarsHelpers = function() {
  Handlebars.registerHelper("numLoop", function (num, options) {
    let result = "";

    for (let i = 0; i < num; i++) {
      console.log(i)
      result += options.fn(i);
    }

    return result;
  });
}
