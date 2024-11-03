export function claimMap(parent, isActor) {
  const map = parent.system.claims;

  // Check dublicates & if original item exists
  if (isActor) {
    actorClaimsCheck(map, parent);
  } else {
    itemClaimsCheck(map, parent);
  }

  // Check array length
  while (map.length != 15) {
    if (map.length > 15) {
      const index = map.findLastIndex(item => item.id === "" && item.name != "Lair");
      if (index >= 0) {
        map.splice(index, 1);
      } else {
        const data = map.pop();

        // Delete original item if it's actor
        if (isActor) {
          const item = parent.items.get(data.id);
          item.delete();
        }
      }
    } else {
      map.push(isActor ? CONFIG.BITD.claims.empty.actor : CONFIG.BITD.claims.empty.item);
    }
  }

  return map
}

function actorClaimsCheck(map, actor) {

  const items = [];
  for (const i of actor.items) {
    if (i.type === 'claim') {
      items.push(i);
    }
  }

  // Compare claims in items and map
  for (const i of items) {
    const exists = map.some(claim => claim.id === i._id);

    if (exists) {
      const claim = map.find(claim => claim.id === i._id);
      claim.name = i.name;
      claim.active = i.system.active;
      claim.effect = i.system.effect;
    } else {
      const emptyClaim = map.find(claim => !claim.id && claim.name != "Lair");
      if (emptyClaim) {
        emptyClaim.id = i._id;
        emptyClaim.name = i.name;
        emptyClaim.active = i.system.active;
        emptyClaim.effect = i.system.effect;
      } else {
        ui.notifications.warn(game.i18n.format("BITD.Claim.NoFreeSpace", { name: i.name, id: i._id}));
      }
    }
  }

  const idArray = [];

  for (const [index, claim] of Array.from(map.entries())) {
    const exists = items.some(item => item._id === claim.id);

    if (idArray.includes(claim.id) && claim.name != "Lair") {
      makeEmpty(claim); // remove dublicates
    } else if (idArray.includes(claim.name)) {
      makeEmpty(claim);
    } else if (claim.name === "Lair") {
      idArray.push(claim.name);
    } else if (!exists) {
      if (claim.id) {
        const localizeType = game.i18n.localize("TYPES.Item.claim");
        ui.notifications.warn(game.i18n.format("BITD.Errors.Item.NotExist", {type: localizeType, item: claim.name}));
        makeEmpty(claim); // remove not exists
      }
    } else {
      idArray.push(claim.id);
    }
  }

  if (!idArray.includes("Lair")) map.push(CONFIG.BITD.claims.empty.lair)

  return map
}

function makeEmpty(claim) {
  claim.id = '';
  claim.name = 'Turf';
  claim.active = false;
  claim.effect = ""

  return claim
}

function itemClaimsCheck(map, actor) {

  const idArray = [];

  for (const [index, claim] of Array.from(map.entries())) {
    if (idArray.includes(claim.id) && claim.name != "Lair") {
      makeEmpty(claim); // remove dublicates
    } else if (idArray.includes(claim.name)) {
      makeEmpty(claim);
    } else if (claim.name === "Lair") {
      idArray.push(claim.name);
    } else {
      idArray.push(claim.id);
    }
  }

  if (!idArray.includes("Lair")) map.push(CONFIG.BITD.claims.empty.lair)

  return map
}
