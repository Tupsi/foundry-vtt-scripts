// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.0
// Foundry Version: 0.9.249
// DnD5e Version: 1.5.7
// Prerequisites: Advanced Macros, Sequencer, Warpgate, JB2A patreon
//
// Thanks to david (aka claudekennilol)#2244 for the initial macro
//
// Usage: Use as ItemMacro in the spell item
// // //  You can teleport yourself or up to one extra targeted token
//
// v 1.0 initial version


let tokenD = canvas.tokens.get(args[0]?.tokenId);
let passenger = args[0]?.targets[0]?.object;

if (!tokenD) {
    tokenD = token;
    passenger = 0;
}

const config = {
    drawIcon: false,
    interval: tokenD.data.width % 2 === 0 ? 1 : -1,
    label: 'Dimension Door',
    size: tokenD.w / canvas.grid.size,
}
if (typeof item !== 'undefined') {
    config.drawIcon = true;
    config.icon = item.img;
    config.label = item.name;
}

let position = await warpgate.crosshairs.show(config);
if (position.cancelled) {
    return;
}

let portalScale = tokenD.w / canvas.grid.size * 0.9;
const magicSign = new Sequence().effect()
    .file('jb2a.magic_signs.rune.conjuration.intro.blue')
    .atLocation(tokenD)
    .scale(portalScale * .5)
    .opacity(0.5)
    .waitUntilFinished(-600);

const introSequence = new Sequence()
    introSequence.effect()
        .file('jb2a.portals.vertical.vortex.blue')
        .atLocation(tokenD)
        .offset({ y: (tokenD.height)})
        .scale(portalScale)
        .duration(1200)
        .fadeIn(200)
        .fadeOut(500);
    introSequence.animation()
        .on(tokenD)
        .opacity(0);
    introSequence.effect()
        .from(tokenD)
        .moveTowards({ x: tokenD.center.x, y: tokenD.center.y - tokenD.h })
        .zeroSpriteRotation()
        .fadeOut(500)
        .duration(500)
        .waitUntilFinished();
if (typeof passenger !== 'undefined') {
    introSequence.animation()
        .on(passenger)
        .opacity(0);
    introSequence.effect()
        .from(passenger)
        .moveTowards({ x: tokenD.center.x, y: tokenD.center.y - tokenD.h })
        .zeroSpriteRotation()
        .fadeOut(500)
        .duration(500);
}
        introSequence.wait(250);

const outroSequence = new Sequence();
    outroSequence.effect()
        .file('jb2a.portals.vertical.vortex.blue')
        .atLocation(position)
        .offset({ y: (tokenD.height)})
        .scale(portalScale)
        .duration(1200)
        .fadeOut(500)
        .fadeIn(200);
    outroSequence.effect()
        .from(tokenD)
        .atLocation({ x: position.x, y: position.y - tokenD.h })
        .fadeIn(500)
        .duration(500)
        .moveTowards(position)
        .zeroSpriteRotation()
        .waitUntilFinished();
    outroSequence.animation()
        .on(tokenD)
        .teleportTo(position, { relativeToCenter: true })
        .opacity(1);

if (typeof passenger !== 'undefined') {
    let passengerPos = JSON.parse(JSON.stringify(position));
    passengerPos.x = position.x + passenger.x - tokenD.x;
    passengerPos.y = position.y + passenger.y - tokenD.y;
    outroSequence.effect()
        .from(passenger)
        .atLocation({ x: position.x, y: position.y - tokenD.h })
        .fadeIn(500)
        .duration(500)
        .moveTowards(passengerPos)
        .zeroSpriteRotation()
        .waitUntilFinished();
    outroSequence.animation()
        .on(passenger)
        .teleportTo(passengerPos, { relativeToCenter: true })
        .opacity(1)
        .waitUntilFinished();
}
        
let posX = tokenD.x;
let posY = tokenD.y;

await magicSign.play();

await introSequence.play();
await outroSequence.play();
