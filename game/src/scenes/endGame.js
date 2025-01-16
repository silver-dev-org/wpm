import { k } from "../kaplay";
import { totalCorrectChars } from "./game.js";
import { totalCorrectlines } from "./game.js";
import { totalIcorrectCorrectChars } from "./game.js";
import { totalTypedCharacters } from "./game.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { actualname } from "./nameSelection.js";

import "../types.js";

k.scene("endgame", () => {
    let wpm_totalChars = totalCorrectChars / 5;
    let wpm = wpm_totalChars / 60;
    let wpm_totalLines = totalCorrectlines / 5;
    let lpm = wpm_totalLines / 60;
    let acc = (totalCorrectChars / totalTypedCharacters) * 100;

    let prev_wpm = 0;
    let prev_lpm = 0;
    let prev_acc = 0;

    wpm = parseFloat(wpm.toFixed(2));
    lpm = parseFloat(lpm.toFixed(2));
    acc = parseFloat(acc.toFixed(2));

    const currentResults = {
        wpm: wpm,
        lpm: lpm,
        acc: acc,
    };

    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);

    k.add([
        k.text("Analytics", { size: 48 }),
        k.pos(k.center().x, k.center().y - 100),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.text("WPM", { size: 48 }),
        k.pos(k.center().x - 200, k.center().y + 50),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.text("LOC", { size: 48 }),
        k.pos(k.center().x, k.center().y + 50),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.text("ACC", { size: 48 }),
        k.pos(k.center().x + 200, k.center().y + 50),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.text(wpm.toString(), { size: 48 }),
        k.pos(k.center().x - 200, k.center().y + 120),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.text(lpm.toString(), { size: 48 }),
        k.pos(k.center().x, k.center().y + 120),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.text(acc.toString(), { size: 48 }),
        k.pos(k.center().x + 200, k.center().y + 120),
        k.anchor("center"),
        k.z(19),
    ]);

    k.add([
        k.sprite("icon_0"),
        k.pos(k.width() / 2, k.height() / 4),
        k.anchor("center"),
        k.z(18),
    ]);

    const username = actualname;
    const retrievedData = getPlay(username);

    if (retrievedData) {
        console.log("Load data:", retrievedData);
    
        prev_wpm = retrievedData.wpm || 0;
        prev_lpm = retrievedData.lpm || 0;
        prev_acc = retrievedData.acc || 0;
    
        k.add([
            k.text(prev_wpm.toFixed(2), { size: 48 }),
            k.pos(k.center().x - 200, k.center().y + 250),
            k.anchor("center"),
            k.z(19),
        ]);
    
        k.add([
            k.text(prev_lpm.toFixed(2), { size: 48 }),
            k.pos(k.center().x, k.center().y + 250),
            k.anchor("center"),
            k.z(19),
        ]);
    
        k.add([
            k.text(prev_acc.toFixed(2), { size: 48 }),
            k.pos(k.center().x + 200, k.center().y + 250),
            k.anchor("center"),
            k.z(19),
        ]);
    } else {
        console.log("Empty load, load default data.");
    }

    k.add([
        k.text("Previous result", { size: 48 }),
        k.pos(k.center().x, k.center().y + 200),
        k.anchor("center"),
        k.z(19),
    ]);

    savePlay({
        userName: username,
        wpm: currentResults.wpm,
        lpm: currentResults.lpm,
        acc: currentResults.acc,
    });

    onKeyPress("enter", () => {
        k.go("name_selection");
    });

});
