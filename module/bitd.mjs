// Import Modules
import { BitdActor } from "./documents/actor.mjs";
import { BitdScoundrelSheet } from "./sheets/scoundrel-sheet.mjs";
import { BitdCrewSheet } from "./sheets/crew-sheet.mjs";
import { BitdItem } from "./documents/item.mjs";
import { BitdItemSheet } from "./sheets/item-sheet.mjs";
import { preprocessChatMessage, renderChatMessage } from "./helpers/chat-portraits.mjs";
import { defaultItemsID } from "./helpers/default-items.mjs";
import { createRollDialog } from "./helpers/roll.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars-helpers.mjs";

Hooks.once('init', async function() {

  game.bitd = {
    BitdActor,
    BitdItem
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = BitdActor;
  CONFIG.Item.documentClass = BitdItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("bitd", BitdScoundrelSheet, { types: ["scoundrel"], makeDefault: true });
  Actors.registerSheet("bitd", BitdCrewSheet, { types: ["crew"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bitd", BitdItemSheet, { makeDefault: true });

  registerHandlebarsHelpers();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

// Preprocess chat message before it is created hook
Hooks.on("preCreateChatMessage", preprocessChatMessage);

// Render chat message hook
Hooks.on("renderChatMessage", renderChatMessage);

// Add scene controls
Hooks.on("renderSceneControls", async (app, html) => {
  const diceRollButton = $(`
    <li class="scene-control" data-control="bitd-dice" title="BitD Dice Roller">
    <i class="fas fa-dice"></i>
    </li>
  `);
  diceRollButton.click( async function() {
    await createRollDialog("fortune");
  });
  html.children().first().append( diceRollButton );
});

Hooks.on("createActor", async function(actor, options, actorId) {

    if (actor.type == "scoundrel") {
      const defaultItems = [];
      for (const id of defaultItemsID.scoundrelInventory) {
        const uuid = "Compendium.bitd.items.Item." + id;
        const item = await fromUuid(uuid);
        defaultItems.push(item);
      }

      const cls = getDocumentClass("Item");
      for (const item of defaultItems) {
        cls.create(item, {parent: actor})
      }
    }
});
