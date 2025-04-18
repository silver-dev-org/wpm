import { k } from "../kaplay";
import { goal_acc, goal_lpm, goal_wpm, goal_awpm, goalCompletedBlocks,lastChallenge,startTime} from "./game.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { actualname, settings } from "./selectionScene.js";
import { resizablePos } from "../components/resizablePos.js";
import "../types.js";
import { MAX_BLOCKS,goalBlocks } from "../constants.js";
k.scene("endgame", () => {

    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);

    let record_blocks = goalCompletedBlocks;
    let record_challenges = lastChallenge;
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

        if (settings.mute) {
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
    const username = actualname;
    const retrievedData = getPlay(username);

    if (retrievedData) {

        reciveprevdata = retrievedData;
        prevdata = JSON.parse(reciveprevdata);
        prev_awpm = parseFloat(prevdata.awpm) || 0;
        prev_wpm = parseFloat(prevdata.wpm) || 0;
        prev_lpm = parseFloat(prevdata.lpm) || 0;
        prev_acc = parseFloat(prevdata.acc) || 0;

        best_awpm = Math.max(prevdata.awpm || 0, awpm);
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
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);

    k.add([
        k.text("WPM "+wpm.toFixed(2), {
            size: 48,
            font: "thaleahFat",
        }),
        resizablePos(() => k.vec2(k.width() * 0.40, k.height() * 0.55)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.opacity(1),
        k.z(19),
    ]);
    k.add([
         k.text("ACC "+ acc.toFixed(2) + "%", {
            size: 48,
            font: "thaleahFat",
        }),
        resizablePos(() => k.vec2(k.width() * 0.6, k.height() * 0.55)),
        k.color(k.YELLOW),
        k.anchor("center"),
        k.opacity(1),
        k.z(19),
    ]);
    k.add([
        k.text("Challenges "+  record_blocks+ " / " + goalBlocks, { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.51, k.height() * 0.65)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);
    k.add([
        k.text("Last Challenge", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.30, k.height() * 0.75)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text(record_challenges, { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.30, k.height() * 0.8)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);
    k.add([
        k.text("Time elapsed", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.75)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text(startTime.toFixed(2)+" seg", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.80)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);
    k.add([
        k.text("Last 60s WPM", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.75)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text(awpm, { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.80)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);

    const textPressEnd = k.add([
        k.text("Press ENTER to retry", { size: 32 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.9)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.animate(),
        k.z(19),
    ]);

    moveText();
    function moveText() {
        textPressEnd.animate("pos", [k.vec2(textPressEnd.pos.x, textPressEnd.pos.y + 5), k.vec2(textPressEnd.pos.x, textPressEnd.pos.y - 5)], {
            duration: 0.5,
            direction: "ping-pong",
        });
    }
    savePlay({
        userName: username,
        awpm: currentResults.awpm,
        wpm: currentResults.wpm,
        lpm: currentResults.lpm,
        acc: currentResults.acc,
        mute: settings.mute,
    });

    const button_muteON = k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.9, k.height() * 0),
        k.opacity(1),
        k.animate(),
        k.z(50),
    ]);
    const button_muteOFF = k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.9, k.height() * 0),
        k.opacity(0),
        k.animate(),
        k.z(50),
    ]);

    if (settings.mute) {
        button_muteON.opacity = 0;
        button_muteOFF.opacity = 1;
        updateMusicVolume();
    }
    else {
        button_muteON.opacity = 1;
        button_muteOFF.opacity = 0;
        updateMusicVolume();
    }
    
    onKeyPress("enter", () => {
        record_blocks = 0;
        record_challenges = "";
        music.stop();
        k.go("selection");
    });

});