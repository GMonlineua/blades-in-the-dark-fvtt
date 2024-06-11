import { BitdActorSheet } from "./actor-sheet.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdScoundrelSheet extends BitdActorSheet
{

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["bitd", "sheet", "actor", "scoundrel"],
      width: 750,
      height: 900,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "general"
      }]
    });
  }

  /** @override */
  async getData() {
    const context = await super.getData();

    // Prepare scoundrel data and items.
    this._prepareItems(context);

    return context;
  }

    /**
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareItems(context) {
    let playbook;
    const abilities = [];
    const contacts = [];
    const inventory = [];
    const specInventory = [];

    const playbookId = this.actor.system.playbook;

    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;

      if (i.type === 'playbook') {
        if (i._id === playbookId) {
          playbook = i;
        }
      }
      else if (i.type === 'abilityScoundrel') {
        abilities.push(i);
      }
      else if (i.type === 'contact') {
        contacts.push(i);
      }
      else if (i.type === 'tool') {
        if (i.system.type === 'common') {
          inventory.push(i);
        } else {
          specInventory.push(i);
        }
      }
    }

    context.abilities = abilities;
    context.contacts = contacts;
    context.inventory = inventory;
    context.playbook = playbook;
    context.specInventory = specInventory;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Add Trauma
    html.find('.add-trauma').click(this._onAddTrauma.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle adding traumas.
   * @param {Event} the originating click event
   * @private
   */
  async _onAddTrauma(event) {
    const currentTraumas = (this.actor.system.trauma || []).filter(Boolean);
    const defaultTraumas = [
      "BITD.Traumas.Cold",
      "BITD.Traumas.Haunted",
      "BITD.Traumas.Obsessed",
      "BITD.Traumas.Paranoid",
      "BITD.Traumas.Reckless",
      "BITD.Traumas.Soft",
      "BITD.Traumas.Unstable",
      "BITD.Traumas.Vicious",
    ];
    const filteredTraumas = defaultTraumas.filter(trauma => !currentTraumas.includes(trauma));

    const template = await renderTemplate("systems/bitd/templates/apps/trauma.hbs", { currentTraumas, filteredTraumas });

    const dialog = new Dialog({
      title: game.i18n.localize("BITD.ChooseTrauma"),
      content: template,
      buttons: {
        add: {
          label: game.i18n.localize("BITD.AddTrauma"),
          callback: async (html) => {
            const elements = Array.from(html.find(".trauma.active"));
            const newTraumas = elements.map(el => el.dataset.value);

            const customTrauma = html.find("input.custom-trauma")[0].value;
            if (customTrauma) {
              newTraumas.push(customTrauma);
            }

            await this.actor.update({ "system.trauma": newTraumas });
          }
        }
      },
      default: "add",
      close: () => {},
      render: (html) => {
        html.find(".trauma").on("click", function() {
          $(this).toggleClass("active");
        });
      }
    },
    {
      width: 220
    });

    dialog.render(true);
  }
}
