/**
 * Prompt the user to change settings
 * @extends {FormApplication}
 */
export default class BITDChangeSettings extends FormApplication {

  /** @override */
  constructor(object, options = {}) {
    super(object, options);
    this._editable = object.testUserPermission(game.user, "OWNER");
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bitd", "dialog", "sheet-settings"],
      width: "500",
      height: "fit-content"
    });
  }

  /** @override */
  get isEditable() {
    return this._editable;
  }

  /** @override */
  get template() {
    const type = this.object.type;
    const sheetTemplate = `systems/bitd/templates/settings/${type}-settings.hbs`;

    return sheetTemplate;
  }

  /** @override */
  get title() {
    const key = this.object.type;
    const localizeKey = key.charAt(0).toUpperCase() + key.slice(1);
    const title = game.i18n.localize("BITD." + localizeKey + ".Settings.Title");
    return title;
  }

  /** @override */
  async getData(options = {}) {
    return Object.assign({}, options);
  }

  /** @override */
  async _updateObject(event, formData) {
    const updateData = foundry.utils.expandObject(formData);
    await this.object.update(updateData);
  }
}
