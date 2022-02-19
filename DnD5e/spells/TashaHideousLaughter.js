// Macro Author: Tupsi#7299 (on discord) (initial macro from Crymic)
// Macro version: 1.1
// Foundry Version: 0.9.249
// DnD5e Version: 1.5.7
// Prerequisites: Advanced Macros, DAE, DFreds Convenient Effects (CE)
//
// Usage: Use as ItemMacro in the spell item
//
// Takes care of prone and the automated saving throw.
// Does not check for Int > 4
//
// v 1.0 initial copy of Crymics macro
// v 1.1 changed active effects to CE


async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }

if (args[0].tag === "OnUse") {
    let checkProne;
    for (let targetUuid of args[0].failedSaveUuids) {
        checkProne = await game.dfreds.effectInterface.hasEffectApplied('Prone', targetUuid);
        if (!checkProne) {
            await game.dfreds.effectInterface.addEffect({ effectName: 'Prone', uuid: targetUuid});
        }
    }
    return;
}

const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const actorD = canvas.tokens.get(lastArg.tokenId).actor;
const itemD = lastArg.efData.flags.dae.itemData;
const origin = lastArg.origin;
const itemUuid = await fromUuid(origin);
const caster = itemUuid.actor;
const gameRound = game.combat ? game.combat.round : 0;
const tokenUuid = canvas.tokens.get(lastArg.tokenId).actor.uuid;

async function damageCheck(workflow) {
    console.warn("args inside damageCheck: ", args)
    let effectData = [{
        label: "Damage Save",
        icon: "icons/skills/wounds/injury-triple-slash-bleed.webp",
        origin: origin,
        disabled: false,
        flags: { dae: { specialDuration: ["isDamaged"] } },
        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        changes: [{ key: `flags.midi-qol.advantage.ability.save.all`, mode: 2, value: 1, priority: 20 }]
    }];
    let damageSave = actorD.effects.find(i => i.data.label === "Damage Save");
    if (!damageSave) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.actorUuid, effects: effectData });
    await wait(600);
    let attackWorkflow = workflow.damageList.map((i) => ({ tokenId: i?.tokenId, totalDamage: i?.totalDamage })).filter(i => i.tokenId === tokenD.id);
    let lastAttack = attackWorkflow[attackWorkflow.length - 1];
    if (lastAttack?.totalDamage > 0) {
        let workflow = await MidiQOL.Workflow.getWorkflow(origin);
        workflow.advantage = true;
        let itemCard = await MidiQOL.showItemCard.bind(workflow.item)(false, workflow, false);
        workflow.itemCardId = await itemCard.id;
        await workflow.checkSaves(false);
        await workflow.displaySaves(false, true);
        let save = await workflow.saveResults[0];
        let DC = workflow.item.data.data.save.dc;
        game.dice3d?.showForRoll(save);
        await ui.chat.scrollBottom();
        if (save.total >= DC) {
            let removeConc = caster.effects.find(i => i.data.label === "Concentrating");
            if (removeConc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: caster.uuid, effects: [removeConc.id] });
        } else {
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker({ token: tokenD.document }),
                content: `${tokenD.name} laughs maniacally`,
                type: CONST.CHAT_MESSAGE_TYPES.EMOTE
            });
        }
    }
}

if (args[0] === "on") {
    let hookId = await Hooks.on("midi-qol.DamageRollComplete", damageCheck);
    await DAE.setFlag(actorD, "hLaughter", hookId);
    if (!(game.modules.get("jb2a_patreon")?.active || game.modules.get("JB2A_DnD5e")?.active)) return {};
    if (!(game.modules.get("sequencer")?.active)) return {};
    console.warn("tokenD", tokenD);
    new Sequence()
        .effect()
        .file("jb2a.toll_the_dead.purple.skull_smoke")
        .atLocation(tokenD)
        .scaleToObject(1.5)
        .waitUntilFinished(-500)
    .play()
}

if (args[0] === "off") {
    let hookId = await DAE.getFlag(actorD, "hLaughter");
    await Hooks.off("midi-qol.DamageRollComplete", hookId);
    await DAE.unsetFlag(actorD, "hLaughter");
    let conc = caster.effects.find(i => i.data.label === "Concentration");
    if (conc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: caster.uuid, effects: [conc.id] });
}