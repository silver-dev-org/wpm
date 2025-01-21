import { k } from "../kaplay";
import { totalCorrectChars } from "./game.js";
import { totalCorrectlines } from "./game.js";
import { totalTypedCharacters } from "./game.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { actualname } from "./nameSelection.js";
import { resizablePos } from "../components/resizablePos.js";
import { resizableRect } from "../components/resizableRect.js";
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

    let best_wpm = wpm;
    let best_lpm = lpm;
    let best_acc = acc;

    let reciveprevdata = 0;
    let prevdata = 0;
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
        resizablePos(() => k.vec2(k.width(), k.height())), 
        k.anchor("center"),
        k.z(17),
    ]);

    k.add([
        k.text(lpm.toFixed(2), { size: 48, }), 
        resizablePos(() => k.vec2(k.width() * 0.25, k.height() * 0.31)), 
        k.opacity(1),
        k.z(19),
    ]),
    k.add([
        k.text(wpm.toFixed(2), { size: 48, }), 
        resizablePos(() => k.vec2(k.width() * 0.46, k.height() * 0.31)), 
        k.opacity(1),
        k.z(19),
    ]),
    k.add([
        k.text(acc.toFixed(2)+"%", { size: 48, }), 
        resizablePos(() => k.vec2(k.width() *0.67, k.height() * 0.31)), 
        k.opacity(1),
        k.z(19),
    ]),


    k.add([
        k.sprite("icon_0"),
        resizablePos(() => k.vec2(k.width() * 0.77, k.height() * 0.38)),
        k.anchor("center"),
        k.opacity(0),
        k.z(18),
    ]);
    k.add([
        k.sprite("bg_analitycs"),
        resizablePos(() => k.vec2(k.width() * 0.50, k.height() * 0.40)),
        k.anchor("center"),
        k.z(18),
    ]);
    const username = actualname;
    const retrievedData = getPlay(username);

    if (retrievedData) {
        
        console.log("Load data:", retrievedData);
        reciveprevdata = retrievedData;
        console.log(prevdata);
        prevdata = JSON.parse(reciveprevdata);
        prev_wpm = parseFloat(prevdata.wpm) || 0;
        prev_lpm = parseFloat(prevdata.lpm) || 0;
        prev_acc = parseFloat(prevdata.acc) || 0;

        best_wpm = Math.max(prevdata.best_wpm || 0, wpm);
        best_lpm = Math.max(prevdata.best_lpm || 0, lpm);
        best_acc = Math.max(prevdata.best_acc || 0, acc);

        console.log(best_wpm, best_lpm, best_acc);
        console.log(prev_wpm, prev_lpm, prev_acc);

        k.add([
            k.text(best_lpm.toFixed(2), { size: 48, }), 
            resizablePos(() => k.vec2(k.width() * 0.24, k.height() * 0.64)), 
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_wpm.toFixed(2), { size: 48, }), 
            resizablePos(() => k.vec2(k.width() * 0.46, k.height() * 0.64)), 
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_acc.toFixed(2)+"%", { size: 48, }), 
            resizablePos(() => k.vec2(k.width() * 0.67, k.height() * 0.64)), 
            k.opacity(1),
            k.z(19),
        ]);
    } else {
        console.log("Empty load, load default data.");
    }

    k.add([
        k.text("Press", { size: 32 }),
        k.pos(k.center().x-100, k.center().y + 200),
        k.anchor("center"),
        k.z(19),
    ]);
    k.add([
        k.text("ENTER", { size: 32 }),
        k.pos(k.center().x, k.center().y + 200),
        k.anchor("center"),
        k.color(k.YELLOW), 
        k.z(19),
    ]);
    k.add([
        k.text("to retry", { size: 32 }),
        k.pos(k.center().x+130, k.center().y + 200),
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
        k.go("game");
    });

});
