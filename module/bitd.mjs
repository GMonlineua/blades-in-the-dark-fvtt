import * as models from './data/_module.mjs';
import { BitdActor, BitdItem } from "./documents/_module.mjs";

// Import Actor Sheet
import { BitdActorSheet } from "./sheets/actor-sheet.mjs";
import { BitdCrewSheet } from "./sheets/crew-sheet.mjs";
import { BitdFactionSheet } from "./sheets/faction-sheet.mjs";
import { BitdScoundrelSheet } from "./sheets/scoundrel-sheet.mjs";

// Import Item Sheet
import { BitdItemSheet } from "./sheets/item-sheet.mjs";
import { BitdPlaybookSheet } from "./sheets/playbook-sheet.mjs";

// Import modules
import { preprocessChatMessage, renderChatMessage } from "./applications/chat-portraits.mjs";
import { createRollDialog } from "./applications/roll.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars-helpers.mjs";
import { BITD } from './helpers/config.mjs';

Hooks.once('init', async function() {

  game.bitd = {
    BitdActor,
    BitdItem
  };

  CONFIG.BITD = BITD;

  // Define custom Entity classes and Data Models
  CONFIG.Actor.documentClass = BitdActor;
  CONFIG.Actor.dataModels = {
    'faction': models.FactionData,
    'npc': models.NpcData
  };

  CONFIG.Item.documentClass = BitdItem;
  CONFIG.Item.dataModels = {
    'playbook': models.PlaybookData,
    'abilityScoundrel': models.AbilityScoundrelData,
    'abilityCrew': models.AbilityCrewData,
    'claim': models.ClaimData,
    'cohort': models.CohortData,
    'tool': models.ToolData,
    'upgrade': models.UpgradeData
  };


  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("bitd", BitdActorSheet, { makeDefault: true });
  Actors.registerSheet("bitd", BitdCrewSheet, { types: ["crew"], makeDefault: true });
  Actors.registerSheet("bitd", BitdFactionSheet, { types: ["faction"], makeDefault: true });
  Actors.registerSheet("bitd", BitdScoundrelSheet, { types: ["scoundrel"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bitd", BitdItemSheet, { makeDefault: true });
  Items.registerSheet("bitd", BitdPlaybookSheet, { types: ["playbook", "crewType"], makeDefault: true });

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
