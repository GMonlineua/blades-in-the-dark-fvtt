import { BitdActorSheet } from "./actor-sheet.mjs";
import { claimMap } from "../applications/claims-map.mjs";

/**
 * Extend the BitdActorSheet
 * @extends {BitdActorSheet}
 */
export class BitdCrewSheet extends BitdActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["bitd", "sheet", "actor", "crew"],
            width: 850,
            height: 900,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".sheet-body",
                    initial: "claims",
                },
            ],
        });
    }

    /** @override */
    async getData() {
        const context = await super.getData();

        // Prepare crew data and items.
        this._prepareItems(context);
        context.claims = this.actor.system.claims;
        context.prison = this.actor.system.prison;

        return context;
    }

    /**
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     */
    _prepareItems(context) {
        let playbook;
        const abilities = [];
        const cohorts = [];
        const upgrades = [];
        const specUpgrades = [];

        const playbookId = this.actor.system.playbook;

        for (const i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;

            if (i.type === "crewType") {
                if (i._id === playbookId) {
                    playbook = i;
                }
            } else if (i.type === "abilityCrew") {
                abilities.push(i);
            } else if (i.type === "cohort") {
                cohorts.push(i);
            } else if (i.type === "upgrade") {
                if (i.system.type === "common") {
                    upgrades.push(i);
                } else {
                    specUpgrades.push(i);
                }
            }
        }

        context.abilities = abilities;
        context.cohorts = cohorts;
        context.playbook = playbook;
        context.upgrades = upgrades;
        context.specUpgrades = specUpgrades;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Change hunting ground
        html
            .find("a.edit-hunting-ground")
            .click(this._onEditHuntingGround.bind(this));

        // Delete Item
        html.find("a.claim-delete").click(this._onDeleteClaim.bind(this));

        // Move claim in map
        html.find("a.claim-move").click(this._onMoveClaim.bind(this));

        // Claim checkbox for turf
        html.on("change", "input.claim-checkbox", this._onActiveTurf.bind(this));

        // Load default prison claims
        html.find("a.load-prison").click(this._onLoadPrison.bind(this));
    }

    /* -------------------------------------------- */

    /**
     * Handle editing hunting ground and operation type.
     * @param {Event} the originating click event
     * @private
     */
    async _onEditHuntingGround(event) {
        const data = this.actor.system.hunting;

        const template = await renderTemplate(
            "systems/bitd/templates/apps/hunting.hbs",
            data,
        );

        const dialog = new Dialog(
            {
                title: game.i18n.localize("BITD.HuntingGround.Edit"),
                content: template,
                buttons: {
                    ok: {
                        label: game.i18n.localize("BITD.HuntingGround.Ok"),
                        callback: async (html) => {
                            const formData = new FormData(html[0].querySelector("form"));
                            const newData = Object.fromEntries(formData.entries());
                            newData["ground"] = newData["ground"].replace(/\n/g, "<br>");
                            newData["operation"] = newData["operation"].replace(
                                /\n/g,
                                "<br>",
                            );

                            await this.actor.update({ "system.hunting": newData });
                        },
                    },
                },
                default: "add",
                close: () => { },
            },
            {
                width: 500,
            },
        );

        dialog.render(true);
    }

    async _onDeleteClaim(event) {
        event.preventDefault();
        const button = event.currentTarget;

        const map = button.closest(".claims-map");
        const containerName = map.dataset.container;
        const path = "system." + containerName;
        const container = this.actor.system[containerName];

        const div = button.closest(".item");
        const itemID = div.dataset.itemId;
        const claim = container.find((claim) => claim.id === itemID);

        if (claim) {
            claim.id = "";
            claim.name = "Turf";
            claim.active = false;
            claim.effect = "";
        }

        await this.actor.update({ [path]: container });

        try {
            const item = this.actor.items.get(itemID);
            await item.delete();
        } catch {
            console.log("item doesn't exist")
        }

        claimMap(this.actor, "claim");
        claimMap(this.actor, "prisonClaim");
    }

    async _onMoveClaim(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const direction = button.dataset.direction;
        const parent = $(button.parentNode);
        const index = parseInt(parent[0].dataset.index, 10);

        const map = button.closest(".claims-map");
        const containerName = map.dataset.container;
        const path = "system." + containerName;
        const container = this.actor.system[containerName];

        if (direction === "left" && index > 0) {
            [container[index], container[index - 1]] = [container[index - 1], container[index]];
        } else if (direction === "right" && index < container.length - 1) {
            [container[index], container[index + 1]] = [container[index + 1], container[index]];
        }

        await this.actor.update({ [path]: container });

        claimMap(this.actor, "claim");
        claimMap(this.actor, "prisonClaim");
    }

    async _onActiveTurf(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const parent = element.closest("div.item");
        const active = element.checked;
        const index = parent.dataset.index;

        const map = element.closest(".claims-map");
        const containerName = map.dataset.container;
        const path = "system." + containerName;
        const container = this.actor.system[containerName];

        container[index].active = active;
        await this.actor.update({ [path]: container });
    }

    async _onLoadPrison(event) {
        event.preventDefault();
        const data = CONFIG.BITD.defaultItems.prison;
        const map = this.actor.system.prison;

        // delete exist prison claims
        for (const item of this.actor.items) {
            if (item.type === "prisonClaim") {
                await item.delete()
            }
        }

        // Load empty matrix
        const defaultPrison = Array.from({ length: 12 }, () => ({ ...CONFIG.BITD.claims.empty.actor }));
        defaultPrison[5].name = "Prison";
        defaultPrison[5].active = true;
        await this.actor.update({ "system.prison": defaultPrison });

        // load new
        for (const index in data) {
            if (index != 5) {
                const uuid = "Compendium.bitd.claims.Item." + data[index];
                const item = await fromUuid(uuid);
                const array = await this.actor.createEmbeddedDocuments('Item', [item]);
                const newItem = array[0];

                map[index].id = newItem._id;
                map[index].name = newItem.name;
                map[index].active = newItem.system.active;
                map[index].effect = newItem.system.effect;
            } else {
                map[index] = CONFIG.BITD.claims.empty.home.prisonClaim;
            }
        }

        await this.actor.update({ "system.prison": map });
        claimMap(this.actor, "prisonClaim");
    }

    /** @override */
    async _onDropActor(event, data) {
        if (!this.isEditable) return;
        const cls = getDocumentClass("Actor");
        const sourceActor = await cls.fromDropData(data);

        this.actor.addLinkedActor(sourceActor);
    }
}
