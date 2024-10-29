export function claimMap(actor, isActor) {
  const map = actor.system.claims;

  const items = [];
  if (isActor) {
    for (const i of actor.items) {
      if (i.type === 'claim') {
        items.push(i);
      }
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

  // Check dublicates & if original item exists
  itemsCheck(map, items);

  // Check array length
  while (map.length != 15) {
    if (map.length > 15) {
      const index = map.findLastIndex(item => item.id === "" && item.name != "Lair");
      if (index >= 0) {
        map.splice(index, 1);
      } else {
        const data = map.pop();
        const item = actor.items.get(data.id);
        item.delete();
      }
    } else {
      map.push({
        id: "",
        name: "Turf",
        active: false,
        effect: ""
      })
    }
  }

  return map
}

function itemsCheck(map, items) {
  const idArray = [];

  for (const [index, claim] of Array.from(map.entries())) {
    const exists = items.some(item => item._id === claim.id);

    if (idArray.includes(claim.id) || idArray.includes(claim.name)) {
      makeEmpty(claim); // remove dublicates
    } else if (claim.name === "Lair") {
      idArray.push(claim.name);
    } else if (!exists) {
      if (claim.id) {
        const localizeType = game.i18n.localize("TYPES.Item.claim");
        ui.notifications.warn(game.i18n.format("BITD.Errors.Item.NotExist", {type: localizeType, actor: claim.name}));
        makeEmpty(claim); // remove not exists
      }
    } else {
      idArray.push(claim.id);
    }
  }

  return map
}

function makeEmpty(claim) {
  claim.id = '';
  claim.name = 'Turf';
  claim.active = false;
  claim.effect = ""

  return claim
}
