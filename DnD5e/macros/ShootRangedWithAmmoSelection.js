// Macro Author: Tupsi#7299 (on discord)
// Macro version: 1.0
// Foundry Version: 0.9.249
// DnD5e Version: 1.5.7
// Prerequisites: Advanced Macros, Warpgate
//
// Usage: Put this on your macro hotbar.
//
// It searches the inventory of the selected actor for ranged weapons and fitting ammunition.
// After selection it puts the selected ammunition into the consume property of the weapons
// and rolls the attack.

let selected = canvas.tokens.controlled[0];
if(selected === undefined || selected.length > 1){
    ui.notifications.error("You dont have your own token selected")
    return;
}

if (Array.from(game.user.targets).length !== 1) {
    ui.notifications.error("Please target one token");
    return;
}

let actorId = selected.data.actorId;
let actorD = game.actors.get(actorId);
let weaponChoices = actorD.data.items.filter( i => i.data.data.properties?.amm)
                                     .sort((a,b)=> a.name < b.name)
                                     .reduce((acc, i, index) => {
                                         if (acc === 0) acc = new Array();
                                         let entry = new Object();
                                         entry.label = i.name;
                                         entry.value = {"id": i.id, "uuid": i.uuid};
                                         acc.push(entry);
                                         return acc;
                                     },0);

if (weaponChoices === 0) {
    ui.notifications.warn("You do not seem to have a ranged weapon. What makes you think pressing this button would conjure one?");
    return;
}

let weapon;
if (weaponChoices.length > 1) {
    let weaponSelected = await warpgate.menu(
        {
          buttons: weaponChoices,
        }, 
        {
          title: 'Choose your weapon carefully...'
        });
    if (weaponSelected.buttons === false) return;
    weapon = actorD.data.items.find( i => i.id === weaponSelected.buttons.id);

} else
{
    weapon = actorD.data.items.find( i => i.id === weaponChoices[0].value.id);
}

let ammoType = (weapon.name.toLowerCase().includes("crossbow") || weapon.name.toLowerCase().includes("armbrust")) ? "bolt" : "arrow";
const ammoChoices = actorD.data.items
                    .filter(i => i.name.toLowerCase().includes(ammoType) && i.data.type === "consumable" && i.data.data.quantity > 0)
                    .sort((a,b)=> a.data.data.price - b.data.data.price)
                    .reduce((acc, i) => {
                        if (acc === 0) acc = new Array();
                        let entry = new Object();
                        entry.label = `${i.name} </br> ${i.data.data.quantity} in the quiver`;
                        entry.value = i.id;
                        acc.push(entry);
                        return acc;
                    },0);

if (ammoChoices === 0) {
    ui.notifications.warn("You are out of ammunition for that weapon! Better luck next time!");
    return;
}
let ammo = await warpgate.menu(
    {
      buttons: ammoChoices,
    }, 
    {
      title: 'Hawkeye, what gadget do you wanna use today?'
    });

if (ammo.buttons === false) return;

await weapon.update({"data.consume.amount": "1", "data.consume.target": ammo.buttons, "data.consume.type": "ammo"});
weapon.roll();
