import { BitdItemSheet } from "./item-sheet.mjs";
import { claimMap } from "../applications/claims-map.mjs";

/**
 * Extend the basic BitdItemSheet
 * @extends {BitdItemSheet}
 */
export class BitdCrewTypeSheet extends BitdItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 700,
      height: 550,
      dragDrop: [{ dragSelector: ".item", dropSelector: ".crewType" }],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = await super.getData();
    claimMap(this.item);
    context.claims = this.item.system.claims;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Open external link
    html.on("click", "a.claim-open[data-uuid]", this._onClickLink.bind(this));

    // Edit items
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Delete Item
    html.find(".claim-delete").click((ev) => {
      const button = ev.currentTarget;
      const div = button.closest(".item");
      const id = div?.dataset.itemId;
      const map = this.item.system.claims.map;
      const claim = map.find((claim) => claim.id === id);

      if (claim) {
        claim.id = "";
        claim.uuid = "";
        claim.name = "";
        claim.type = "turf";
        claim.active = false;
      }

      this.item.update({ "system.claims.map": map });
      claimMap(this.item, "claim");
    });

    // Move claim in map
    html.find("a.claim-move").click(this._onMoveClaim.bind(this));
  }

  /* -------------------------------------------- */
  /*  Drag & Drop                                 */
  /* -------------------------------------------- */

  /**
   * Handle clicking on a content link to preview the content.
   * @param {MouseEvent} event  The triggering event.
   * @protected
   */
  async _onClickLink(event) {
    event.preventDefault();
    const uuid = event.currentTarget.dataset.uuid;
    const content = await fromUuid(uuid);
    content?.sheet.render(true);
  }

  /** @inheritdoc */
  _onDrop(event) {
    super._onDrop(event);

    if (!this.isEditable) return;
    const data = TextEditor.getDragEventData(event);

    if (data.type === "Item") {
      this.item.addLinkedItem(data);
    } else if (data.type === "Actor") {
      this.item.addLinkedActor(data);
    }
  }

  async _onMoveClaim(event) {
    const button = event.currentTarget;
    const direction = button.dataset.direction;
    const parent = $(button.parentNode);
    const index = parseInt(parent[0].dataset.index, 10);
    const container = this.item.system.claims;
    const map = container.map;
    const columns = container.columns;

    if (direction === "left" && index > 0) {
      [map[index], map[index - 1]] = [map[index - 1], map[index]];
    } else if (direction === "up" && index >= columns) {
      [map[index], map[index - columns]] = [map[index - columns], map[index]];
    } else if (direction === "right" && index < map.length - 1) {
      [map[index], map[index + 1]] = [map[index + 1], map[index]];
    } else if (direction === "down" && index <= map.length - columns) {
      [map[index], map[index + columns]] = [map[index + columns], map[index]];
    }

    await this.item.update({ "system.claims.map": map });
  }
}
