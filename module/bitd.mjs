// Import Modules
import { BitdActor } from "./documents/actor.mjs";
import { BitdActorSheet } from "./sheets/actor-sheet.mjs";
import { BitdItem } from "./documents/item.mjs";
import { BitdItemSheet } from "./sheets/item-sheet.mjs";
import { preprocessChatMessage, renderChatMessage } from "./helpers/chat-portraits.mjs";
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
  Actors.registerSheet("bitd", BitdActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bitd", BitdItemSheet, { makeDefault: true });

  await registerHandlebarsHelpers();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

// Preprocess chat message before it is created hook
Hooks.on("preCreateChatMessage", preprocessChatMessage);

// Render chat message hook
Hooks.on("renderChatMessage", renderChatMessage);
