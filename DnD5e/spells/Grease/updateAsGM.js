// must have the checkbox "Execute Macro As GM" set
let tileDoc = canvas.scene.tiles.get(args[0])
await tileDoc.update(args[1]);
