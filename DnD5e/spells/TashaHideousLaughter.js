//##################################
// Read First!!! Requires both Dynamic Active Effects + Midi-QoL
// DAE setup
// Duration: Macro Repeat: End of each turn.
// Effects: Either use Item Macro or Macro Execute, no args needed.
//##################################

(async()=>{
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length-1];
let tactor;
if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
else tactor = game.actors.get(lastArg.actorId);
const ttoken = canvas.tokens.get(lastArg.tokenId);
const item = lastArg.efData.flags.dae.itemData;
const DC = item.data.save.dc;

async function savingThrow(){
    let workflow = await MidiQOL.Workflow.getWorkflow(item._id);
    let itemCard = await MidiQOL.showItemCard.bind(workflow.item)(false, workflow, false);
    workflow.itemCardId = await itemCard.id;
        await workflow.checkSaves(false);
        await workflow.displaySaves(false, true);
        let save = await workflow.saveResults[0];
        game.dice3d.showForRoll(save);
        if (await save._total >= DC) {
            let removeConc = workflow.actor.effects.entries.find(i=> i.data.label === "Concentrating");
            if(removeConc){
                await workflow.actor.deleteEmbeddedEntity("ActiveEffect", removeConc.data._id);
            } else {
                await tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
            }
    }
    
}

async function damageCheck(workflow) {
    await wait(500);
    let attackWorkflow = workflow.damageList.map((i)=> ({actorId : i?.actorID, appliedDamage : i?.appliedDamage, hpDamage : i?.hpDamage, newHP : i?.newHP, newTempHP : i?.newTempHP, oldHP : i?.oldHP, oldTempHP : i?.oldTempHP, tempDamage : i?.tempDamage, tokenId: i?.tokenId, totalDamage : i?.totalDamage})).filter(i=> i.tokenId === ttoken.id);
    let lastAttack = attackWorkflow[attackWorkflow.length -1];
    if(lastAttack?.totalDamage > 0){
    savingThrow();
    }
}


if(args[0]==="on"){
    if(tactor.data.data.abilities.int.value <= 4) await tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
    let hookId = Hooks.on("midi-qol.DamageRollComplete", damageCheck);
    DAE.setFlag(tactor, "damgeApplied", 0);
    DAE.setFlag(tactor, "hLaughter", hookId);
    let curtHP = tactor.data.data.attributes.hp.value;
    DAE.setFlag(tactor, "hLaughterHP", curtHP);
    let condition = ["Prone", "Incapacitated"];
    game.cub.addCondition(condition, ttoken);
}

if(args[0] === "each") {
    let curtHP = tactor.data.data.attributes.hp.value;
    DAE.setFlag(tactor, "hLaughterHP", curtHP);
    let workflow = await MidiQOL.Workflow.getWorkflow(item._id);
    let itemCard = await MidiQOL.showItemCard.bind(workflow.item)(false, workflow, false);
    workflow.itemCardId = await itemCard.id;
        await workflow.checkSaves(false);
        await workflow.displaySaves(false, true);
        let save = await workflow.saveResults[0];
        game.dice3d.showForRoll(save);
        if (await save._total >= DC) {
            let removeConc = workflow.actor.effects.entries.find(i=> i.data.label === "Concentrating");
            if(removeConc){
                await workflow.actor.deleteEmbeddedEntity("ActiveEffect", removeConc.data._id);
            } else {
                await tactor.deleteEmbeddedEntity("ActiveEffect", lastArg.effectId);
            }
        }
}

if(args[0]==="off"){
    let hookId = DAE.getFlag(tactor, "hLaughter");
    Hooks.off("midi-qol.DamageRollComplete", hookId);
    DAE.unsetFlag(tactor, "hLaughter");
    DAE.unsetFlag(tactor, "hLaughterHP");
    let removeInc = ttoken.actor.effects.entries.find(i=> i.data.label === "Incapacitated");
    await tactor.deleteEmbeddedEntity("ActiveEffect", removeInc.data._id);
}
})();