import * as models from './data/_module.mjs';
import { BitdActor, BitdItem } from "./documents/_module.mjs";

// Import Actor Sheet
import { BitdActorSheet } from "./sheets/actor-sheet.mjs";
import { BitdScoundrelSheet } from "./sheets/scoundrel-sheet.mjs";
import { BitdCrewSheet } from "./sheets/crew-sheet.mjs";
import { BitdFactionSheet } from "./sheets/faction-sheet.mjs";
import { BitdClockSheet } from "./sheets/clock-sheet.mjs";

// Import Item Sheet
import { BitdItemSheet } from "./sheets/item-sheet.mjs";
import { BitdCrewTypeSheet } from "./sheets/crew-type-sheet.mjs";
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
    'scoundrel': models.ScoundrelData,
    'crew': models.CrewData,
    'faction': models.FactionData,
    'npc': models.NpcData,
    'clock': models.ClockData
  };

  CONFIG.Item.documentClass = BitdItem;
  CONFIG.Item.dataModels = {
    'playbook': models.PlaybookData,
    'crewType': models.CrewTypeData,
    'abilityScoundrel': models.AbilityScoundrelData,
    'abilityCrew': models.AbilityCrewData,
    'claim': models.ClaimData,
    'prisonClaim': models.PrisonClaimData,
    'cohort': models.CohortData,
    'tool': models.ToolData,
    'upgrade': models.UpgradeData
  };


  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("bitd", BitdActorSheet, { makeDefault: true });
  Actors.registerSheet("bitd", BitdScoundrelSheet, { types: ["scoundrel"], makeDefault: true });
  Actors.registerSheet("bitd", BitdCrewSheet, { types: ["crew"], makeDefault: true });
  Actors.registerSheet("bitd", BitdFactionSheet, { types: ["faction"], makeDefault: true });
  Actors.registerSheet("bitd", BitdClockSheet, { types: ["clock"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bitd", BitdItemSheet, { makeDefault: true });
  Items.registerSheet("bitd", BitdCrewTypeSheet, { types: ["crewType"], makeDefault: true });
  Items.registerSheet("bitd", BitdPlaybookSheet, { types: ["playbook"], makeDefault: true });

  // Custom buners for compendiums
  CONFIG.Actor.compendiumBanner = "systems/bitd/ui/compendium-banners/actor-banner.jpg";
  CONFIG.Adventure.compendiumBanner = "systems/bitd/ui/compendium-banners/adventure-banner.jpg";
  CONFIG.Card.compendiumBanner = "systems/bitd/ui/compendium-banners/card-banner.jpg";
  CONFIG.JournalEntry.compendiumBanner = "systems/bitd/ui/compendium-banners/journalentry-banner.jpg";
  CONFIG.Item.compendiumBanner = "systems/bitd/ui/compendium-banners/item-banner.jpg";
  CONFIG.Macro.compendiumBanner = "systems/bitd/ui/compendium-banners/macro-banner.jpg";
  CONFIG.Playlist.compendiumBanner = "systems/bitd/ui/compendium-banners/playlist-banner.jpg";
  CONFIG.RollTable.compendiumBanner = "systems/bitd/ui/compendium-banners/rolltable-banner.jpg";
  CONFIG.Scene.compendiumBanner = "systems/bitd/ui/compendium-banners/scene-banner.jpg";

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
  diceRollButton.click(async function() {
    await createRollDialog("fortune");
  });
  html.children().first().append(diceRollButton);
});
