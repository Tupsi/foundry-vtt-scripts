// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.0
// Foundry Version: 0.9.255
// DnD5e Version: 1.5.7
// Prerequisites: Advanced Macros, Automated Animations, JB2A patreon, Monk's Active Tiles, DFreds Convenient Effects,
// // // // // // 1st macro called "trigger-grease"
//
// Usage: Put this in your macro directory along side the first part "trigger-grease"
// // //  The spellDC from the caster is coming from there and is needed for for the spellDC roll.
//
// v 1.0 initial version


// actor is moving outside of the grease, so not firing
if (isNaN(arguments[0].pt.x)) return;

const tData = arguments[0].token;
const aData = arguments[0].actor;
const targetUuid = arguments[0].actor.uuid;
let spellDC = arguments[0].tile.data.flags.world.spellDC;
let rollData = await aData.getRollData();

let save = await new Roll('1d20').evaluate({async: true});
await game.dice3d?.showForRoll(save);
let saveBonus = parseInt(rollData.abilities.dex.save);
let result = save.total + saveBonus;
let checkProne = await game.dfreds.effectInterface.hasEffectApplied('Prone', targetUuid);
if (!checkProne) {
    if (result < spellDC) {
        console.warn("SpellDC failed, applying Prone");
        await game.dfreds.effectInterface.addEffect({ effectName: 'Prone', uuid: targetUuid});
    }
}
