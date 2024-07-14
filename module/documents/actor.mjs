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
      disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL
    }

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
        this.createEmbeddedDocuments('Item', defaultItems)
      }
    }
  }

  _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

    if (game.user.id === userId) {
      const target = {
        actor: "scoundrel",
        item: "playbook",
        forLoad: ["abilities", "inventory"]
      }

      if (this.type == "crew") {
        target.actor = "crew",
        target.item = "crewType",
        target.forLoad = ["abilities", "claims", "cohorts", "upgrades"]
      }

      for (const dataItem of data) {
        if (dataItem.type == target.item && this.type == target.actor) {
          for (const i of this.items) {
            if (i.type === target.item && i._id != dataItem._id) {
              const item2Delete = this.items.get(i._id);
              item2Delete.delete();
            }
          }
          this.update({ "system.playbook": dataItem._id });

          this._preCreateContainer(dataItem, target.forLoad);
        }
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
        if (!this.items.find(i => i.name === item.name && i.type === item.type)) {
          toCreate.push(item)
        } else {
          ui.notifications.warn(game.i18n.localize("BITD.Errors.Item.ExistsName"));
        }
      }
    }
    this.createEmbeddedDocuments('Item', toCreate)

    for (const contact of container.system.contacts) {
      this.addContact(contact);
    }

    if (container.type === "playbook") {
      for (const action in systemData.actions) {
        const playbookValue = container.system.actions[action];
        const actorValue = systemData.actions[action].value;
        if (playbookValue > actorValue) {
          const path = "system.actions." + action + ".value";
          await this.update({ [path]: playbookValue });
        }
      }
    }
  }

  async addLinkedActor(npc) {
    const localizeType = game.i18n.localize("TYPES.Actor." + npc.type);
    if (!npc) return;
    if (npc.type != "npc") return ui.notifications.error(game.i18n.format("BITD.Errors.Actor.NotSupported", { type: localizeType, actor: npc.name }));

    if (npc.pack) {
      ui.notifications.warn(game.i18n.localize("BITD.Errors.Actor.InPack"));
      return this.importActor(npc);
    }

    const contacts = this.system.contacts;

    const idExist = contacts.some(existingActor => existingActor.id === npc.id);
    const nameExist = contacts.some(existingActor => existingActor.name === npc.name);

    if (idExist) return ui.notifications.error(game.i18n.localize("BITD.Errors.Actor.ExistsId"));
    if (nameExist) ui.notifications.warn(game.i18n.localize("BITD.Errors.Actor.ExistsName"));

    const actor = await fromUuid(npc.uuid);
    const link = {
      id: actor.id,
      uuid: actor.uuid,
      name: actor.name,
      type: actor.type,
      title: localizeType
    }
    contacts.push(link);
    await this.update({ "system.contacts": contacts });
  }

  async importActor(sourceActor) {
    const dialog = new Dialog({
      title: game.i18n.localize("BITD.ImportActor.Title"),
      content: game.i18n.localize("BITD.ImportActor.Description"),
      buttons: {
        import: {
          label: game.i18n.localize("BITD.ImportActor.Submit"),
          icon: '<i class="fas fa-check"></i>',
          callback: async () => {
            const actor = await BitdActor.create(sourceActor);
            this.addLinkedActor(actor)
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("BITD.Roll.Cancel"),
          callback: () => {},
        },
      },
      default: "import",
      close: () => {}
    },
    {
      classes: ["dialog", "bitd-import-dialog"],
      width: 400,
      height: 100
    });

    dialog.render(true);
  }
}
