import { k } from "../kaplay";
import { goal_acc, goal_lpm, goal_wpm, goal_awpm, goalCompletedBlocks, lastChallenge, startTime, goal_time } from "./game.js";
import { savePlay, getPlay, saveMute } from "../systems/saves.js";
import { settings } from "./selectionScene.js";
import { resizablePos } from "../components/resizablePos.js";
import "../types.js";
import { MAX_BLOCKS, goalBlocks } from "../constants.js";
k.scene("endgame", () => {
    let fontsize = 20;
    let record_blocks = goalCompletedBlocks;
    let record_challenges = lastChallenge;
    let awpm = goal_awpm;
    let wpm = goal_wpm;
    let lpm = goal_lpm;
    let acc = goal_acc;
    let time = goal_time;
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
    wpm = parseFloat((wpm  || 0).toFixed(2));
    lpm = parseFloat((lpm  || 0).toFixed(2));
    acc = parseFloat((acc  || 0).toFixed(2));

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
    const retrievedData = getPlay();
    if (retrievedData) {
        prev_awpm = parseFloat(retrievedData.awpm) || 0;
        prev_wpm = parseFloat(retrievedData.wpm) || 0;
        prev_lpm = parseFloat(retrievedData.lpm) || 0;
        prev_acc = parseFloat(retrievedData.acc) || 0;

        best_awpm = Math.max(retrievedData.awpm || 0, awpm);
        best_wpm = Math.max(retrievedData.wpm || 0, wpm);
        best_lpm = Math.max(retrievedData.lpm || 0, lpm);
        best_acc = Math.max(retrievedData.acc || 0, acc);
    } else {
        console.log("Empty load, load default data.");
        best_awpm = awpm;
        best_wpm = wpm;
        best_lpm = lpm;
        best_acc = acc;
    }
    const saved = getPlay();
if (saved) {
  k.add([
    k.text(
      `Best WPM (${new Date(saved.loadDate).toLocaleDateString()}): ${(saved.bestWpm || 0).toFixed(2)}`,
      { size: 22 }
    ),
    resizablePos(() => k.vec2(k.width()*0.5, k.height()*0.80)),
    k.anchor("center"),
    k.color(k.YELLOW),
    k.z(20),
  ]);
}
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(10),
    ]);

    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);

    k.add([
        k.text("WPM " + wpm.toFixed(2), {
            size: 32,
        }),
        resizablePos(() => k.vec2(k.width() * 0.35, k.height() * 0.50+20)),
        k.anchor("left"),
        k.color(k.YELLOW),
        k.opacity(1),
        k.z(19),
    ]);
    k.add([
        k.text("ACC " + acc.toFixed(2) + "%", {
            size: 32,
        }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.5+20)),
        k.color(k.YELLOW),
        k.anchor("left"),
        k.opacity(1),
        k.z(19),
    ]);
    k.add([
        k.text("Challenges " + record_blocks + " / " + goalBlocks, { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.9)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text("Last Challenge", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.30, k.height() * 0.7-70)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text(record_challenges, { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.30, k.height() * 0.75-70)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);
    k.add([
        k.text("Time elapsed", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.7-70)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text(goal_time.toFixed(2) + " seg", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.75-70)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);
    k.add([
        k.text("Last 60s WPM", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.7-70)),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(18),
    ]);
    k.add([
        k.text(awpm, { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.75-70)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(18),
    ]);
    const textPressEnd = k.add([
        k.text("ESC to retry", { size: 20 }),
        resizablePos(() => k.vec2(k.width() * 0.1+20, k.height() * 0.9)),
        k.anchor("center"),
        k.color(k.rgb(127, 134, 131)),
        k.animate(),
        k.z(19),
    ]);

    savePlay({
        wpm: best_wpm,
        lpm: best_lpm,
        acc: best_acc,
        bestWpm: best_wpm,
    });
    
    saveMute(settings.mute);

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

    onKeyPress("escape", () => {
        record_blocks = 0;
        record_challenges = "";
        music.stop();
        k.go("game");
    });

});