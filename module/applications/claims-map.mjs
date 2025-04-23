export function claimMap(parent) {
  const functions = {
    crew: actorClaimsCheck,
    crewType: itemClaimsCheck,
  };

  const checkFunction = functions[parent.type];
  const isActor = parent.type == "crew";

  const claims = parent.system.claimsMap;
  checkFunction(claims, parent, "claim");
  checkArrayLength(claims, isActor);
  updateMap(claims, parent, "claimsMap");

  if (isActor) {
    const container = parent.system.prisonMap;

    checkFunction(container, parent, "prisonClaim");
    checkArrayLength(container, isActor);
    updateMap(container, parent, "prisonMap");
  }
}

function actorClaimsCheck(container, actor, type) {
  const map = container.map;

  const items = [];
  for (const i of actor.items) {
    if (i.type === type) {
      items.push(i);
    }
  }

  let noHome = true;

  // Check all claims in map
  for (const claim of map) {
    if (claim.type === "home") {
      if (noHome) {
        makeEmpty(claim);
        claim.type = "home";
        noHome = false;
      } else {
        makeEmpty(claim);
      }
    } else if (claim.type === "claim") {
      const item = items.find((i) => i._id === claim.id);
      loadData(claim, item, true);
    } else {
      makeEmpty(claim);
    }
  }

  // Add home if doesn't exists
  if (noHome) {
    const emptyClaim = map.find((claim) => claim.type === "turf");
    if (emptyClaim) {
      makeEmpty(emptyClaim);
      emptyClaim.type = "home";
    } else {
      makeEmpty(map[-1]);
      map[-1].type = "home";
    }
  }

  // Check if all claims are in map
  for (const item of items) {
    const exists = map.some((claim) => claim.id === item._id);
    if (!exists) {
      const emptyClaim = map.find((claim) => claim.type === "turf");

      if (emptyClaim) {
        loadData(emptyClaim, item, true);
      } else {
        ui.notifications.warn(
          game.i18n.format("BITD.Claim.NoFreeSpace", {
            name: item.name,
            id: item._id,
          }),
        );
        item.delete();
      }
    }
  }

  return container;
}

async function itemClaimsCheck(container, item) {
  const map = container.map;

  let noHome = true;
  // Check all claims in map
  for (const claim of map) {
    if (claim.type === "home") {
      if (noHome) {
        makeEmpty(claim);
        claim.type = "home";
        noHome = false;
      } else {
        makeEmpty(claim);
      }
    } else if (claim.type === "claim") {
      const data = await fromUuid(claim.uuid);
      loadData(claim, data, false);
    } else {
      makeEmpty(claim);
    }
  }

  // Add home if doesn't exists
  if (noHome) {
    const emptyClaim = map.find((claim) => claim.type === "turf");
    if (emptyClaim) {
      makeEmpty(emptyClaim);
      emptyClaim.type = "home";
    } else {
      makeEmpty(map[-1]);
      map[-1].type = "home";
    }
  }

  return container;
}

function checkArrayLength(container, isActor) {
  const map = container.map;
  const requirement = container.rows * container.columns;

  while (map.length != requirement) {
    if (map.length > requirement) {
      const index = map.findLastIndex(
        (item) =>
          item.type != "home" && item.type != "claim",
      );
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
      map.push(
        isActor
          ? CONFIG.BITD.claims.empty.actor
          : CONFIG.BITD.claims.empty.item,
      );
    }
  }

  return map;
}

function makeEmpty(claim, isActor) {
  claim.id = "";
  if (!isActor) claim.uuid = "";
  claim.name = "";
  claim.type = "turf";
  claim.active = false;
  if (isActor) claim.effect = "";

  return claim;
}

function loadData(claim, data, isActor) {
  claim.id = data._id;
  if (!isActor) claim.uuid = data.uuid;
  claim.name = data.name;
  claim.type = "claim";
  claim.active = data.system.active;
  if (isActor) claim.effect = data.system.effect;

  return claim;
}

async function updateMap(container, parent, containerName) {
  const path = "system." + containerName;
  await parent.update({ [path]: container });
}
