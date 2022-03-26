// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.0
// Foundry Version: 0.9.249
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
/////////////////////////////////////////////////////////////////////////
// you get this by dragging your weapon of choice to your macro bar and open the macro
let weaponId = "r27jcEvYKR3kRBXz";
/////////////////////////////////////////////////////////////////////////

let characterId = game.user.data.character;
let actor = game.actors.get(characterId);
let weapon = actor.data.items.filter( i => i.id === weaponId)[0];
console.warn(weapon);
let ammoChoices = weapon.data.data.consumables.reduce((acc, i) => acc += `<option value="${i}">${actor.data.items.filter( y => y.id === i)[0].name} `,``);

let ammoChoicesIds = weapon.data.data.consumables;
foreach (int i in ammoChoicesIds) {

}

content = `<form>
                    <div class="form-group">
                        <label>Ammo: </label>
                        <select id="ammo-selector">${ammoChoices}</select>
                    </div>
                </form>`;


let ammoDialog = new Dialog({
    title: "Ammo selector",
    content,
    buttons: {
        fire: {
            label: "Fire!",
            callback: async (html) => {
                const ammoId = html.find("#ammo-selector")[0].value;
                console.warn("ammo selected", ammoId);
                await weapon.update({ "data.useConsumableForAttack": ammoId});
                game.twodsix.rollItemMacro(weaponId);
            }
        },
        cancel: {
            label: "Cancel"
        }
    }
});

ammoDialog.render(true);

