import { totalCorrectChars } from "./game.js";

scene("endgame", () => {
    const endgameLabel = add([
        text("Analytics", { size: 48 }),
        pos(center().x, center().y - 100),
        anchor("center"),
    ]);
});
