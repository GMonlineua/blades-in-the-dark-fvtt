export function claimMap(parent, type) {
    const functions = {
        crew: actorClaimsCheck,
        crewType: itemClaimsCheck
    }
    const map = (type == "claim") ? parent.system.claims : parent.system.prison;
    const checkFunction = functions[parent.type];
    const requirement = CONFIG.BITD.claims.mapLength[type];
    const isActor = (parent.type == "crew");

    checkFunction(map, parent, type);
    checkArrayLength(map, requirement, isActor);

    updateMap(map, parent, type);
}

function actorClaimsCheck(map, actor, type) {
    const home = CONFIG.BITD.claims.empty.home[type];

    const items = [];
    for (const i of actor.items) {
        if (i.type === type) {
            items.push(i);
        }
    }

    // Compare claims in items and map
    for (const item of items) {
        const exists = map.some(claim => claim.id === item._id);

        if (exists) {
            const claim = map.find(claim => claim.id === item._id);
            claim.name = item.name;
            claim.active = item.system.active;
            claim.effect = item.system.effect;
        } else {
            const emptyClaim = map.find(claim => !claim.id && claim.name != home.name);
            if (emptyClaim) {
                emptyClaim.id = item._id;
                emptyClaim.name = item.name;
                emptyClaim.active = item.system.active;
                emptyClaim.effect = item.system.effect;
            } else {
                ui.notifications.warn(game.i18n.format("BITD.Claim.NoFreeSpace", { name: item.name, id: item._id }));
                item.delete();
            }
        }
    }

    const idArray = [];
    for (const [index, claim] of Array.from(map.entries())) {
        const exists = items.some(item => item._id === claim.id);

        if (idArray.includes(claim.id) && claim.name != home.name) {
            makeEmpty(claim); // remove dublicates
        } else if (idArray.includes(claim.name)) {
            makeEmpty(claim);
        } else if (claim.name === home.name) {
            idArray.push(claim.name);
        } else if (!exists) {
            if (claim.id) {
                const localizeType = game.i18n.localize("TYPES.Item.claim");
                ui.notifications.warn(game.i18n.format("BITD.Errors.Item.NotExist", { type: localizeType, item: claim.name }));
                makeEmpty(claim); // remove not exists
            }
        } else {
            idArray.push(claim.id);
        }
    }

    if (!idArray.includes(home.name)) map.push(home);

    return map
}

function itemClaimsCheck(map) {

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

    if (!idArray.includes("Lair")) map.push(CONFIG.BITD.claims.empty.home.item)

    return map
}

function checkArrayLength(map, requirement, isActor) {
    while (map.length != requirement) {
        if (map.length > requirement) {
            const index = map.findLastIndex(item => item.id === "" && item.name != "Lair" && item.name != "Prison");
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

function makeEmpty(claim) {
    claim.id = '';
    claim.name = 'Turf';
    claim.active = false;
    claim.effect = ""

    return claim
}

async function updateMap(map, parent, type) {
    const containerName = (type == "claim") ? "claims" : "prison";
    const path = "system." + containerName;
    await parent.update({ [path]: map });
}
