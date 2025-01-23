import { k } from "../kaplay";
import { totalCorrectChars } from "./game.js";
import { totalCorrectlines } from "./game.js";
import { totalTypedCharacters } from "./game.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { actualname } from "./nameSelection.js";
import { resizablePos } from "../components/resizablePos.js";
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
        k.sprite("bg3"),
        resizablePos(() => k.vec2(k.width()-0.1, k.height()))*0.1, 
        k.anchor("left"),
        k.z(17),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.1, k.height() * 0.1)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.text(lpm.toFixed(2), { size: 48, }), 
        resizablePos(() => k.vec2(k.width() * 0.255, k.height() * 0.34)), 
        k.opacity(1),
        k.z(19),
    ]),
    k.add([
        k.text(wpm.toFixed(2), { size: 48, }), 
        resizablePos(() => k.vec2(k.width() * 0.465, k.height() *0.34)), 
        k.opacity(1),
        k.z(19),
    ]),
    k.add([
        k.text(acc.toFixed(2)+"%", { size: 48, }), 
        resizablePos(() => k.vec2(k.width() *0.65, k.height() * 0.34)), 
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
        k.opacity(0),
        k.z(18),
    ]);

    k.add([
        k.sprite("BG_analitycs1"),
        resizablePos(() => k.vec2(k.width() * 0.28, k.height() * 0.36)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs2"),
        resizablePos(() => k.vec2(k.width() *  0.49, k.height()* 0.36)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs3"),
        resizablePos(() => k.vec2(k.width() * 0.68, k.height() * 0.36)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs4"),
        resizablePos(() => k.vec2(k.width() * 0.28, k.height() * 0.60)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs5"),
        resizablePos(() => k.vec2(k.width() * 0.49, k.height() * 0.60)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs6"),
        resizablePos(() => k.vec2(k.width() * 0.68, k.height() * 0.60)),
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
            resizablePos(() => k.vec2(k.width() * 0.255, k.height() * 0.58)),
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_wpm.toFixed(2), { size: 48, }), 
            resizablePos(() => k.vec2(k.width() * 0.465, k.height() *  0.58)), 
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_acc.toFixed(2)+"%", { size: 48, }), 
            resizablePos(() => k.vec2(k.width() * 0.65, k.height() *  0.58)), 
            k.opacity(1),
            k.z(19),
        ]);
    } else {
        console.log("Empty load, load default data.");
    }

    k.add([
        k.text("Press", { size: 32 }),
        k.pos(k.center().x-120, k.center().y + 300),
        k.anchor("center"),
        k.z(19),
    ]);
    k.add([
        k.text("ENTER", { size: 32 }),
        k.pos(k.center().x-20, k.center().y + 295),
        k.anchor("center"),
        k.color(k.YELLOW), 
        k.z(19),
    ]);
    k.add([
        k.text("to retry", { size: 32 }),
        k.pos(k.center().x+110, k.center().y + 300),
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
