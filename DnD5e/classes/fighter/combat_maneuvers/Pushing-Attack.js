// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.0
// Foundry Version: 0.9.249
// DnD5e Version: 1.5.7
// Prerequisites: Advanced Macros, Warpgate, Sequencer, JB2A patreon module
//
// Thanks to david (aka claudekennilol)#2244 for the crosshair magic!!!
//
// Usage: needs the pushed target as token directly from the hotbar or as ItemMacro
// // //  use args[2] to change the range (standard is 15 feet)
//
// It searches the inventory of the selected actor for ranged weapons and fitting ammunition.
// After selection it puts the selected ammunition into the consume property of the weapons
// and rolls the attack.
//
// v 1.0 initial release

let source;
let icon;
if (args[0]?.tag === "OnUse") {
    token = args[0].targets[0].object;
    source = await fromUuid(args[0].tokenUuid);
    source = source.object;
    icon = args[0].item.img;
} else {
    token = Array.from(game.user.targets)[0];
    source = token;
    icon = 'icons/svg/dice-target.svg';
}

let distanceAvailable
if (!args[2]) {
    distanceAvailable = 15;
} else {
    distanceAvailable = args[2];
}

let crosshairsDistance = 0;
const checkDistance = async (crosshairs) => {
    while (crosshairs.inFlight) {
        //wait for initial render
        await warpgate.wait(100);
        const ray = new Ray(token.center, crosshairs);
        const distance = canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];

        //only update if the distance has changed
        if (crosshairsDistance !== distance) {
            crosshairsDistance = distance;
            if (distance > distanceAvailable) {
                crosshairs.icon = 'icons/svg/hazard.svg';
            } else {
                crosshairs.icon = icon;
            }

            crosshairs.draw();
            crosshairs.label = `${distance} ft`;
        }
    }
}

const location = await warpgate.crosshairs.show(
    {
        // swap between targeting the grid square vs intersection based on token's size
        interval: token.data.width % 2 === 0 ? 1 : -1,
        size: token.data.width,
        icon: icon,
        label: '0 ft.',
    },
    {
        show: checkDistance
    },
);

if (location.cancelled || crosshairsDistance > distanceAvailable) {
    return;
}

const seq = new Sequence().effect()
    .scale(.75)
    .endTime(400)
    .file('jb2a.impact.blue.8')
    .waitUntilFinished(-500)
    .atLocation(source)
seq.effect()
    .file('jb2a.impact.blue.10')
    .atLocation(token)
seq.animation()
    .on(token)
    .moveTowards(location, { relativeToCenter: true })
    .waitUntilFinished();
seq.effect()
    .scale(.75)
    .startTime(100)
    .file('jb2a.impact.blue.15')
    .atLocation(token)
await seq.play();