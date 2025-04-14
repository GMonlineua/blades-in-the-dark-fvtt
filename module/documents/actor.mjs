import { claimMap } from "../applications/claims-map.mjs";
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export default class BitdActor extends Actor {
  /** @inheritdoc */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    const prototypeToken = {
      actorLink: true,
      disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    };

    if (this.type === "scoundrel" || this.type === "crew") {
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
    } else if (this.type === "clock") {
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.ALWAYS;
    }

    this.updateSource({ prototypeToken });
  }

  async _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);

    this.prototypeToken.actorLink = true;

    // Load default items
    const defaultItemsID = CONFIG.BITD.defaultItems;
    const defaultItems = [];

    if (this.type == "scoundrel") {
      for (const id of defaultItemsID.scoundrel) {
        const uuid = "Compendium.bitd.items.Item." + id;
        const item = await fromUuid(uuid);
        defaultItems.push(item);
      }
    } else if (this.type == "crew") {
      for (const id of defaultItemsID.crew) {
        const uuid = "Compendium.bitd.upgrades.Item." + id;
        const item = await fromUuid(uuid);
        defaultItems.push(item);
      }
    }

    for (const [ownerId, permissions] of Object.entries(this.ownership)) {
      if (permissions === 3 && game.userId === ownerId) {
        this.createEmbeddedDocuments("Item", defaultItems);
      }
    }
  }

  _onCreateDescendantDocuments(
    parent,
    collection,
    documents,
    data,
    options,
    userId,
  ) {
    super._onCreateDescendantDocuments(
      parent,
      collection,
      documents,
      data,
      options,
      userId,
    );

    if (game.user.id === userId) {
      for (const dataItem of data) {
        if (dataItem.type === "claim") claimMap(this);
        if (dataItem.type === "prisonClaim") claimMap(this);

        if (!CONFIG.BITD.forLoad[this.type]) return;

        const targetItem = CONFIG.BITD.forLoad[this.type].container;
        if (dataItem.type != targetItem) return;
        const forLoad = CONFIG.BITD.forLoad[this.type].types;

        for (const i of this.items) {
          if (i.type === targetItem && i._id != dataItem._id) {
            const itemToDelete = this.items.get(i._id);
            itemToDelete.delete();
          }
        }
        this.update({ "system.playbook": dataItem._id });

        this._preCreateContainer(dataItem, forLoad);
      }
    }
  }

  _onUpdateDescendantDocuments(
    parent,
    collection,
    documents,
    changes,
    options,
    userId,
  ) {
    super._onUpdateDescendantDocuments(
      parent,
      collection,
      documents,
      changes,
      options,
      userId,
    );

    if (game.user.id === userId) {
      for (const changeData of changes) {
        const item = this.items.get(changeData._id);
        if (item.type === "claim") claimMap(this);
        if (item.type === "prisonClaim") claimMap(this);
      }
    }
  }

  async _preCreateContainer(container, forLoad) {
    const systemData = this.system;
    const toCreate = [];

    for (const array of forLoad) {
      const idArr = container.system[array];
      for (const itemData of idArr) {
        const item = await fromUuid(itemData.uuid);
        if (
          !this.items.find((i) => i.name === item.name && i.type === item.type)
        ) {
          toCreate.push(item);
        } else {
          ui.notifications.warn(
            game.i18n.localize("BITD.Errors.Item.ExistsName"),
          );
        }
      }
    }

    // Import contancts to world and add to actor
    const toImport = [];

    for (const contact of container.system.contacts) {
      const fromCompendium = contact.uuid.includes("Compendium");

      if (fromCompendium) {
        console.log("Import to world (Compentium):", contact)
        toImport.push(contact)
      } else {
        console.log("Direct add:", contact)
        const contactActor = await fromUuid(contact.uuid);
        this.addLinkedActor(contactActor);
      }
    }
    if (toImport) this.importActors(toImport)

    // Handle specific data
    if (container.type === "playbook") {
      for (const action in systemData.actions) {
        const playbookValue = container.system.actions[action];
        const actorValue = systemData.actions[action].value;
        if (playbookValue > actorValue) {
          const path = "system.actions." + action + ".value";
          await this.update({ [path]: playbookValue });
        }
      }
    } else if (container.type === "crewType") {
      const map = container.system.claimsMap;

      for (const item of this.items) {
        if (item.type === "claim") {
          item.delete();
        }
      }

      // Load empty matrix
      const defaultClaims = Array.from({ length: 15 }, () => ({
        ...CONFIG.BITD.claims.empty.actor,
      }));
      defaultClaims[7].name = "Lair";
      defaultClaims[7].active = true;
      await this.update({ "system.claimsMap": defaultClaims });

      for (const itemData of map) {
        if (itemData.id) {
          const item = await fromUuid(itemData.uuid);
          const newItem = await this.createEmbeddedDocuments("Item", [item]);
          itemData.id = newItem[0]._id;
        }
      }

      await this.update({ "system.claimsMap": map });
      claimMap(this);
    }

    this.createEmbeddedDocuments("Item", toCreate);
  }

  async addLinkedActor(actor) {
    if (!actor) return;

    if (actor.uuid === this.uuid)
      return ui.notifications.error(
        game.i18n.localize("BITD.Errors.Actor.CantAddYourself"),
      );

    const localizeType = game.i18n.localize("TYPES.Actor." + actor.type);
    const supported = CONFIG.BITD.supportedLinks[this.type];
    const key = supported[actor.type];

    if (!key)
      return ui.notifications.error(
        game.i18n.format("BITD.Errors.Actor.NotSupported", {
          type: localizeType,
          actor: actor.name,
        }),
      );

    const container = this.system[key];

    const idExist = container.some(
      (existingActor) => existingActor.id === actor.id,
    );
    const nameExist = container.some(
      (existingActor) => existingActor.name === actor.name,
    );

    if (idExist)
      return ui.notifications.error(
        game.i18n.localize("BITD.Errors.Actor.ExistsId"),
      );
    if (nameExist)
      ui.notifications.warn(game.i18n.localize("BITD.Errors.Actor.ExistsName"));

    if (actor.pack) {
      ui.notifications.warn(game.i18n.localize("BITD.Errors.Actor.InPack"));
      return this.importActor(actor, key);
    }

    const link = {
      id: actor.id,
      uuid: actor.uuid,
      name: actor.name,
    };
    if (actor.type === "faction") link.tier = actor.system.tier.value;
    if (actor.type === "clock") link.progress = actor.system.progress;
    container.push(link);

    const path = "system." + key;
    await this.update({ [path]: container });
  }

  async importActors(actors) {
    if (!game.user.hasPermission("ACTOR_CREATE"))
      return ui.notifications.warn(
        game.i18n.localize("BITD.Errors.Actor.NoPermission"),
      );

    const template = await renderTemplate(
      "systems/bitd/templates/apps/importActor.hbs",
      { actors },
    );

    const dialog = new Dialog(
      {
        title: game.i18n.localize("BITD.Link.ImportActor.Title"),
        content: template,
        buttons: {
          import: {
            label: game.i18n.localize("BITD.Link.ImportActor.Submit"),
            icon: '<i class="fas fa-check"></i>',
            callback: async (html) => {
              const selectedIds = html.find('input[name="actor"]:checked').map((_, el) => el.value).get();
              const selectedActors = actors.filter(a => selectedIds.includes(a.id));
              console.log(selectedActors);
              for (const actorData of selectedActors) {
                const actor = await BitdActor.create(actorData);
                this.addLinkedActor(actor);
              }
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("BITD.Roll.Cancel"),
          },
        },
        default: "import",
        close: () => { },
      },
      {
        classes: ["dialog", "bitd-import-dialog"],
        width: 400,
        height: "auto",
      },
    );

    dialog.render(true);
  }

  async loadLinkedData() {
    const access = this.isOwned || game.user.isGM;
    if (!access) return;
    if (!CONFIG.BITD.linkedForeign[this.type]) return;

    for (const key of CONFIG.BITD.linkedForeign[this.type]) {
      const container = this.system[key];
      const path = "system." + key;

      // Factions
      if (key === "relatedFactions") {
        for (const index in container) {
          const data = await fromUuid(container[index].uuid);
          if (data) {
            container[index].name = data.name;
            container[index].tier = data.system.tier.value;
          } else {
            const localizeType = game.i18n.localize("TYPES.Actor.faction");
            ui.notifications.error(
              game.i18n.format("BITD.Errors.Actor.NotExist", {
                type: localizeType,
                actor: container[index].name,
              }),
            );
            container.splice(index, 1);
          }

          await this.update({ [path]: container });
        }
      }

      // Goal's Clocks
      else if (key === "goals") {
        for (const index in container) {
          const data = await fromUuid(container[index].uuid);
          if (data) {
            container[index].name = data.name;
            container[index].img = data.img;
            container[index].progress = data.system.progress;
          } else {
            const localizeType = game.i18n.localize("TYPES.Actor.faction");
            ui.notifications.error(
              game.i18n.format("BITD.Errors.Actor.NotExist", {
                type: localizeType,
                actor: container[index].name,
              }),
            );
            container.splice(index, 1);
          }

          await this.update({ [path]: container });
        }
      } else {
        for (const index in container) {
          const data = await fromUuid(container[index].uuid);
          if (data) {
            container[index].name = data.name;
          } else {
            const localizeType = game.i18n.localize("TYPES.Actor.faction");
            ui.notifications.error(
              game.i18n.format("BITD.Errors.Actor.NotExist", {
                type: localizeType,
                actor: container[index].name,
              }),
            );
            container.splice(index, 1);
          }

          await this.update({ [path]: container });
        }
      }
    }
  }
}
