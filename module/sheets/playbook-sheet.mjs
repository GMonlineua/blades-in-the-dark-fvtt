import { BitdItemSheet } from "./item-sheet.mjs";

/**
 * Extend the basic BitdItemSheet
 * @extends {BitdItemSheet}
 */
export class BitdPlaybookSheet extends BitdItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      dragDrop: [
        {dragSelector: ".item", dropSelector: ".playbook"},
        {dragSelector: ".item", dropSelector: ".crewType"}
      ]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    // Delete linked item
    html.find('.link-delete').click(this._onRemoveLink.bind(this));
  }

  /* -------------------------------------------- */
  /*  Drag & Drop                                 */
  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onDrop(event) {
    super._onDrop(event);

    if (!this.isEditable) return;
    const data = TextEditor.getDragEventData(event);

    if (data.type === "Item") {
      this.item.addLinkedItem(data)
    } else if (data.type === "Actor") {
      this.item.addLinkedActor(data)
    }
  }
}
