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
// v 2.0 total revamp as I missed some parts of the rules completely

//console.warn("midi-args dot-grease", args);
//console.warn("matt-args", arguments);

const lastArg = args[args.length - 1];

if (args[0] === "on") {
//    console.warn("inside on");
    let actorD = await DAE.DAEfromActorUuid(lastArg.actorUuid);
    await DAE.setFlag(actorD, "greaseSpellDC", args[1]);
}

if (args[0] === "off") {
//    console.warn("inside Enter");
    let actorD = await DAE.DAEfromActorUuid(lastArg.actorUuid);
    await DAE.unsetFlag(actorD, "greaseSpellDC");
}


if (arguments[0].method === "Enter"){
//    console.warn("inside Enter");
    let spellDC = arguments[0].tile.data.flags.world.spellDC;
    await DAE.setFlag(arguments[0].actor, "greaseSpellDC", spellDC);
    const targetUuid = arguments[0].actor.uuid;
    let checkEffect = await game.dfreds.effectInterface.hasEffectApplied('Greased', targetUuid);
    if (!checkEffect) {
        await game.dfreds.effectInterface.addEffect({ effectName: 'Greased', uuid: targetUuid});
    }
    let flavor = `${CONFIG.DND5E.abilities["dex"]} DC ${spellDC} Greased`;
    let saveRoll = (await arguments[0].actor.rollAbilitySave("dex", { flavor, fastForward: false}))?.total;
    if (saveRoll < spellDC) {
        let effect = 'Prone';
        let checkEffect = await game.dfreds.effectInterface.hasEffectApplied(effect, targetUuid);
        if (!checkEffect) {
            await game.dfreds.effectInterface.addEffect({ effectName: effect, uuid: targetUuid});
        }
    }
    return;
}

if (arguments[0].method === "Exit"){
//    console.warn("inside Exit");
    await DAE.unsetFlag(arguments[0].actor, "greaseSpellDC");
    const targetUuid = arguments[0].actor.uuid;
    let checkEffect = await game.dfreds.effectInterface.hasEffectApplied('Greased', targetUuid);
    if (checkEffect) {
        await game.dfreds.effectInterface.removeEffect({ effectName: 'Greased', uuid: targetUuid});
    }
    await DAE.unsetFlag(arguments[0].actor, "greaseSpellDC");
    await DAE.unsetFlag(arguments[0].actor, "tileGrease");
    return;
}

if (lastArg.tag === "OnUse") {
//    console.warn("inside OnUse");
    let effect = 'Prone';
    for (let targetUuid of args[0].failedSaveUuids) {
        let checkEffect = await game.dfreds.effectInterface.hasEffectApplied(effect, targetUuid);
        if (!checkEffect) {
            await game.dfreds.effectInterface.addEffect({ effectName: effect, uuid: targetUuid});
        }
    }
    return; 
}