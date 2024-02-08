// Import Modules
import { BitdActor } from "./documents/actor.mjs";
import { BitdActorSheet } from "./sheets/actor-sheet.mjs";
import { BitdItem } from "./documents/item.mjs";
import { BitdItemSheet } from "./sheets/item-sheet.mjs";
import { preprocessChatMessage, renderChatMessage } from "./helpers/chat-portraits.mjs";

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
});


/* -------------------------------------------- */
/*  Chat Message                   */
/* -------------------------------------------- */

// Preprocess chat message before it is created hook
Hooks.on("preCreateChatMessage", preprocessChatMessage);

// Render chat message hook
Hooks.on("renderChatMessage", renderChatMessage);


/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper("load", function(data) {
  let load = game.i18n.localize("ROGUE.Unloaded");
  if (data.free >= 5) {
    load = game.i18n.localize("ROGUE.Unloaded")
  } else if (data.free >= 2 && data.free < 5) {
    load = game.i18n.localize("ROGUE.LightlyLoaded")
  } else if (data.free >= 0 && data.free < 2) {
    load = game.i18n.localize("ROGUE.HeavilyLoaded")
  } else if (data.free >= -2 && data.free < 0) {
    load = game.i18n.localize("ROGUE.Overloaded")
  } else {
    load = game.i18n.localize("ROGUE.MoveBlocked")
  }
  return load;
});
