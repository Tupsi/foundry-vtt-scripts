// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.1
// Foundry Version: 0.10.291
// twodsix Version: 
// Prerequisites: 
//
// Usage: Put this on your macro hotbar. 
// // // //  Change the weapon ID to yours.
//
// It searches the inventory of the selected actor for ranged weapons and fitting ammunition.
// After selection it puts the selected ammunition into the consume property of the weapons
// and rolls the attack.
//
// v 1.0 initial release
// v 1.1 fixes for v10
/////////////////////////////////////////////////////////////////////////
// you get this by dragging your weapon of choice to your macro bar and open the macro
// or open the item and look in the upper left corner.
let weaponId = "bp4Sv3YlG322ZojR";
//let weaponId = "r27jcEvYKR3kRBXz";
/////////////////////////////////////////////////////////////////////////

// debugging stuff
//console.log("------------------");
//console.log(actor);
//let characterId = game.user.character;

let weapon = actor.items.filter( i => i.id === weaponId)[0];
//console.log(weapon);
let currentAmmoId = weapon.system.useConsumableForAttack;
let ammoChoices = ``;
weapon.system.consumables.forEach((ammoId) => {
    let setCurrent = ``;
    if (ammoId === currentAmmoId) {
        setCurrent = `selected="selected"`;
    }
    
    ammoChoices += `<option value="${ammoId}" ${setCurrent}>${actor.items.filter( y => y.id === ammoId)[0].name} `;
});
content = `<form>
                    <div class="form-group">
                        <label>Ammo: </label>
                        <select id="ammo-selector">${ammoChoices}</select>
                    </div>
                </form>`;


let ammoDialog = new Dialog({
    title: `Ammo selector for ${weapon.name}`,
    content,
    buttons: {
        fire: {
            label: "Fire!",
            callback: async (html) => {
                const ammoId = html.find("#ammo-selector")[0].value;
                console.warn("ammo selected", ammoId);
                await weapon.update({ "useConsumableForAttack": ammoId});
                game.twodsix.rollItemMacro(weaponId);
            }
        },
        cancel: {
            label: "Cancel"
        }
    }
});

ammoDialog.render(true);
