// @ts-check

import { k } from "../kaplay";
import { totalCorrectChars } from "./game.js";
import { totalCorrectlines } from "./game.js";
import { totalIcorrectCorrectChars } from "./game.js";
import { totalTypedCharacters } from "./game.js";
import { userName } from "./game.js";
import "../types.js";
k.scene("endgame", () => {
    let wpm_totalChars = (totalCorrectChars / 5);
    let wpm = (wpm_totalChars / 60);
    let wpm_totalLines = (totalCorrectlines / 5);
    let lpm = (wpm_totalLines / 60);
    let acc = (totalCorrectChars / totalTypedCharacters) * 100;
    wpm = parseFloat(wpm.toFixed(2));
    lpm = parseFloat(lpm.toFixed(2));
    acc = parseFloat(acc.toFixed(2));

    //const accuracy = (totalCorrectCharacters / totalTypedCharacters) * 100;

    
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    
    const endgameLabel = k.add([
        k.text("Analytics", { size: 48 }),
        k.pos(k.center().x, k.center().y - 100),
        k.anchor("center"),
        k.z(19),
    ]);

    const WPMLabel = k.add([
        k.text("WPM", { size: 48 }),
        k.pos(k.center().x - 200, k.center().y + 50),
        k.anchor("center"),
        k.z(19),
    ]);

    const LOClabel = k.add([
        k.text("LOC", { size: 48 }),
        k.pos(k.center().x, k.center().y + 50),
        k.anchor("center"),
        k.z(19),
    ]);

    const ACClabel = k.add([
        k.text("ACC", { size: 48 }),
        k.pos(k.center().x + 200, k.center().y + 50),
        k.anchor("center"),
        k.z(19),
    ]);

    const WPMNumber = k.add([
        k. text(wpm.toString(), { size: 48 }),
        k.pos(k.center().x - 200, k.center().y + 120),
        k.anchor("center"),
        k.z(19),
    ]);

    const LOCNumber = k.add([
        k.text(lpm.toString(), { size: 48 }),
        k.pos(k.center().x, k.center().y + 120),
        k.anchor("center"),
        k.z(19),
    ]);

    const ACCNumber = k.add([
        k.text(acc.toString(), { size: 48 }),
        k.pos(k.center().x + 200, k.center().y + 120),
        k.anchor("center"),
        k.z(19),
    ]);

   const icon_position = k.add([
    k. sprite("icon_0"),
    k.pos(k.width() / 2, k.height() / 4),
    k.anchor("center"),
    k. z(18),
    
    ]);
});


