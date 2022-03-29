// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.0
// Foundry Version: 0.9.255
// DnD5e Version: 1.5.7
// Prerequisites: Advanced Macros, Automated Animations, JB2A patreon, Monk's Active Tiles
// // // // // // 2nd macro called "dot-grease"
//
// Usage: This adds the trigger to the tile places by A-A. Put this inside the Grease Spell
// // //  in the A-A macro settings or on the Grease Template in the Global A-A Settings
//
// v 1.0 initial version
// v 2.0 changed call to setting the tile data for monks trigger to another macro which must be run as GM

async function addTrigger(tileDoc, weirdShit, id) {

    const actorD = args[1].actor;
    let rollData = await actorD.getRollData();
    // put the DC of the caster into the tile, so people who step on it can use it.
    await DAE.setFlag(actorD, "tileGrease", tileDoc.uuid);
    
    let myUpdate = {'flags.monks-active-tiles': 
        {
            "active": true,
            "record": false,
            "restriction": "all",
            "controlled": "all",
            "trigger": "both",
            "pointer": false,
            "pertoken": false,
            "minrequired": 0,
            "chance": 100,
            "actions": [
                    {
                        "action": "runmacro",
                        "id": foundry.utils.randomID(16),
                        "data": {
                            "macroid": game.macros.getName("dot-grease").id,
                            "args": "",
                            "runasgm": "gm"
                        }
                    }
                ]
        }, 'flags.world':
        {
            "spellDC": rollData.attributes.spelldc,
            "name": "Grease",
            "casterUuid": actorD.uuid
        }
    };

//    await tileDoc.update(myUpdate);
  game.macros.getName("updateAsGM").execute(tileDoc.id, myUpdate);  
}

Hooks.once("createTile", addTrigger);



// unused
// might remove effect on players if tile gets removed
async function deleteGreaseTile(tileDoc, weirdShit, id) {
    if (tileDoc.data.flags?.world?.name === "Grease") {
        let actorD = await fromUuid(tileDoc.data.flags.world.casterUuid);
        let tileGrease = await DAE.getFlag(actorD, "tileGrease");
        if (tileGrease === tileDoc.uuid) {
            console.warn("my grease tile removed");
            await DAE.unsetFlag(actorD, tileGrease);
            for (let sceneToken of game.canvas.scene.tokens ) {
                let targetTileGreaseUuid = await DAE.getFlag(sceneToken.actor.uuid, "tileGrease");
                if (targetTileGreaseUuid) {
                    console.warn(sceneToken.actor, targetTileGreaseUuid);
                }
            }
        }
    }
}