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

async function addTrigger(tileDoc, weirdShit, id) {

    await tileDoc.update({'flags.monks-active-tiles': {
    "active": true,
    "record": false,
    "restriction": "all",
    "controlled": "all",
    "trigger": "movement",
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
                    "runasgm": "player"
                }
            }
        ]
    }});

    const actorD = args[1].actor;
    let rollData = await actorD.getRollData();
    let spellDC = rollData.attributes.spelldc;
    await tileDoc.setFlag('world', "spellDC", spellDC );
}

Hooks.once("createTile", addTrigger);