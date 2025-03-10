import { k } from "../kaplay";
import { goal_acc, goal_lpm, goal_wpm, goal_awpm } from "./game.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { actualname, settings } from "./nameSelection.js";
import { resizablePos } from "../components/resizablePos.js";
import "../types.js";

k.scene("endgame", () => {

    let awpm = goal_awpm;
    let wpm = goal_wpm;
    let lpm = goal_lpm;
    let acc = goal_acc;

    let prev_awpm = 0;
    let prev_wpm = 0;
    let prev_lpm = 0;
    let prev_acc = 0;

    let best_awpm = awpm;
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
        awpm: awpm,
        lpm: lpm,
        acc: acc,
    };

    k.volume(1);
    const music = k.play("endgame");
    music.loop = true;
    music.volume = 0;
    const maxVolume = 0.05;
    const volumeStep = 0.01;
    const intervalTime = 100;
    let volumeIncrease;
    
    function updateMusicVolume() {
        clearInterval(volumeIncrease); 
    
        if (!settings.mute) {
            music.volume = 0.0;
        } else {
            let currentVolume = 0.0;
            volumeIncrease = setInterval(() => {
                if (currentVolume < maxVolume) {
                    currentVolume += volumeStep;
                     music.volume = Math.min(currentVolume, maxVolume);
                } else {
                    clearInterval(volumeIncrease);
                }
            }, intervalTime);
        }
    }
    
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);
    const subTitle = k.add([
        k.sprite("SilverDev"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.15)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.text(lpm.toFixed(2), { size: 48, }),
        resizablePos(() => k.vec2(k.width() * 0.17, k.height() * 0.54)),
        k.opacity(1),
        k.z(19),
    ]),
        k.add([
            k.text(wpm.toFixed(2), { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.37, k.height() * 0.54)),
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(awpm.toFixed(2), { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.57, k.height() * 0.54)),
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(acc.toFixed(2) + "%", { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.75, k.height() * 0.54)),
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
        k.sprite("BG_analitycs1"),
        resizablePos(() => k.vec2(k.width() * 0.2, k.height() * 0.56)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs2"),
        resizablePos(() => k.vec2(k.width() * 0.4, k.height() * 0.56)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycsACC"),
        resizablePos(() => k.vec2(k.width() * 0.8, k.height() * 0.56)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycsAWPM"),
        resizablePos(() => k.vec2(k.width() * 0.6, k.height() * 0.56)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs4"),
        resizablePos(() => k.vec2(k.width() * 0.2, k.height() * 0.75)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycs5"),
        resizablePos(() => k.vec2(k.width() * 0.4, k.height() * 0.75)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycsACC_B"),
        resizablePos(() => k.vec2(k.width() * 0.8, k.height() * 0.75)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycsAWPM_B"),
        resizablePos(() => k.vec2(k.width() * 0.6, k.height() * 0.75)),
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
        prev_awpm = parseFloat(prevdata.awpm) || 0;
        prev_wpm = parseFloat(prevdata.wpm) || 0;
        prev_lpm = parseFloat(prevdata.lpm) || 0;
        prev_acc = parseFloat(prevdata.acc) || 0;

        best_awpm = Math.max(prevdata.awpm || 0, wpm);
        best_wpm = Math.max(prevdata.wpm || 0, wpm);
        best_lpm = Math.max(prevdata.lpm || 0, lpm);
        best_acc = Math.max(prevdata.acc || 0, acc);

    } else {
        console.log("Empty load, load default data.");
        best_awpm = awpm;
        best_wpm = wpm;
        best_lpm = lpm;
        best_acc = acc;
    }

    k.add([
        k.text(best_lpm.toFixed(2), { size: 48, }),
        resizablePos(() => k.vec2(k.width() * 0.17, k.height() * 0.73)),
        k.opacity(1),
        k.z(19),
    ]),
        k.add([
            k.text(best_wpm.toFixed(2), { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.37, k.height() * 0.73)),
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_awpm.toFixed(2), { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.57, k.height() * 0.73)),
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_acc.toFixed(2) + "%", { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.75, k.height() * 0.73)),
            k.opacity(1),
            k.z(19),
        ]);

    //console.log(best_awpm, best_wpm, best_lpm, best_acc);
    //console.log(prev_awpm, prev_wpm, prev_lpm, prev_acc);


    k.add([
        k.text("Press", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.44, k.height() * 0.90)),
        k.anchor("center"),
        k.z(19),
    ]);
    const textC = k.add([
        k.text("ENTER", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.50, k.height() * 0.90)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.animate(),
        k.z(19),
    ]);

    const isNewBestWpm = wpm > prev_wpm;
    const isNewBestLpm = lpm > prev_lpm;
    const isNewBestAcc = acc > prev_acc;

    /* if (isNewBestLpm) {
         k.add([
             k.sprite("icon_0"),
             resizablePos(() => k.vec2(k.width() * 0.21, k.height() * 0.25)),
             k.anchor("center"),
             k.z(20),
         ]);
         k.add([
             k.text("New record", { size: 28 }),
             resizablePos(() => k.vec2(k.width() * 0.3, k.height() * 0.20)),
             k.anchor("center"),
             k.z(20),
         ]);
     }
 
     if (isNewBestWpm) {
         k.add([
             k.sprite("icon_0"),
             resizablePos(() => k.vec2(k.width() * 0.43, k.height() * 0.25)),
             k.anchor("center"),
             k.z(20),
         ]);
         k.add([
             k.text("New record", { size: 28 }),
             resizablePos(() => k.vec2(k.width() * 0.51, k.height() * 0.25)),
             k.anchor("center"),
             k.z(20),
         ]);
     }
 
     if (isNewBestAcc) {
         k.add([
             k.sprite("icon_0"),
             resizablePos(() => k.vec2(k.width() * 0.715, k.height() * 0.25)),
             k.anchor("center"),
             k.z(20),
         ]);
         k.add([
             k.text("New record", { size: 28 }),
             resizablePos(() => k.vec2(k.width() * 0.795, k.height() * 0.25)),
             k.anchor("center"),
             k.z(20),
         ]);
     }*/

    moveText();
    function moveText() {
        textC.animate("pos", [k.vec2(textC.pos.x, textC.pos.y + 5), k.vec2(textC.pos.x, textC.pos.y - 5)], {
            duration: 0.5,
            direction: "ping-pong",
        });
    }
    k.add([
        k.text("to retry", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.57, k.height() * 0.90)),
        k.anchor("center"),
        k.z(19),
    ]);
    savePlay({
        userName: username,
        wpm: currentResults.wpm,
        lpm: currentResults.lpm,
        acc: currentResults.acc,
    });
    const button_muteON = k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.02, k.height() * 0.01),
        k.opacity(1),
        k.animate(),
        k.z(29),
    ]);
    const button_muteOFF = k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.02, k.height() * 0.01),
        k.opacity(0),
        k.animate(),
        k.z(28),
    ]);
    k.onKeyPress((keyPressed) => {
        if (keyPressed.toLowerCase() === "m" && k.isKeyDown("tab")) {
            if (settings.mute) {
                button_muteON.opacity = 0;
                button_muteOFF.opacity = 1;
                settings.mute = false;
                updateMusicVolume();
            }
            else {
                button_muteON.opacity = 1;
                button_muteOFF.opacity = 0;
                settings.mute = true;
                updateMusicVolume();
            }
            return;
        }
    });

    if (settings.mute) {
        button_muteON.opacity = 1;
        button_muteOFF.opacity = 0;
        updateMusicVolume();
    }
    else {
        button_muteON.opacity = 0;
        button_muteOFF.opacity = 1;
        updateMusicVolume();
    }

    onKeyPress("enter", () => {
        music.stop();
        k.go("name_selection");
    });

});
