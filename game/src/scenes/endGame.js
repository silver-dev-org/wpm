import { k } from "../kaplay";
import { goal_acc, goal_lpm, goal_wpm, goal_awpm, goalCompletedBlocks, lastChallenge, blockNamesString, goal_time } from "./game.js";
import { savePlay, getPlay, saveMute } from "../systems/saves.js";
import { settings } from "./selectionScene.js";
import { resizablePos } from "../components/resizablePos.js";
import "../types.js";
import { MAX_BLOCKS, goalBlocks } from "../constants.js";
k.scene("endgame", () => {
    let fontsize = 18;
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
    wpm = parseFloat((wpm || 0).toFixed(0));
    lpm = parseFloat((lpm || 0).toFixed(0));
    acc = parseFloat((acc || 0).toFixed(0));

    const currentResults = {
        wpm: wpm,
        awpm: awpm,
        lpm: lpm,
        acc: acc,
    };

    k.setVolume(1);
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

    const center = () => k.vec2(k.width() / 2, k.height() / 2);
    const offsetX = k.width() * 0.10;
    const offsetY = k.height() * 0.20;
    const pos = (dx, dy) => resizablePos(() => center().add(k.vec2(dx, dy)));
    
    k.add([
      k.sprite("bg2"),
      k.pos(center()),
      k.anchor("center"),
      k.z(10),
    ]);
    const BackBoxCenter = k.add([
        k.rect(1080, 925, { radius: 36 }),
        k.pos(center()),
        k.anchor("center"),
        k.color(k.rgb(53, 53, 71)),
        k.z(10),
        k.opacity(0.3),
    ]);
    const outsideBoxLeft = k.add([
        k.rect(290, 280, { radius: 36 }),
        pos(-offsetX-145, -offsetY+130),
        k.color(k.rgb(53, 53, 71)),
        k.z(10),
        k.opacity(0.3),
        
    ]);
   /* const insideBoxLeft = k.add([
        k.rect(280, 230, { radius: 36 }),
        pos(-offsetX-140+5, -offsetY+150+5),
        k.color(k.rgb(7, 8, 9)),
        k.z(11),
        k.opacity(1),
    ]);*/

    const outsideBoxRight = k.add([
        k.rect(290, 280, { radius: 36 }),
        pos(+offsetX-145, -offsetY+130),
        k.color(k.rgb(53, 53, 71)),
        k.z(10),
        k.opacity(0.3),
        
    ]);
    /*const insideBoxRight = k.add([
        k.rect(280, 230, { radius: 36 }),
        pos(+offsetX-140+5, -offsetY+150+5),
        k.color(k.rgb(7, 8, 9)),
        k.z(11),
        k.opacity(1),
    ]);*/

    k.add([
      k.sprite("WPM"),
      resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
      k.anchor("center"),
      k.z(18),
    ]);

    if (saved) {
      k.add([
        k.text(
          `${(saved.bestWpm || wpm).toFixed(0)}`,
          { size: fontsize }
        ),
        pos(-offsetX+50, +offsetY * 0.45),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(20),
      ]);
    }
    k.add([
        k.text("best WPM", { size: fontsize }),
        pos(-offsetX-30, +offsetY * 0.45),
        k.anchor("center"),
        k.color(k.WHITE),
        k.z(19),
      ]);
    k.add([
      k.text("WPM", { size: 32 }),
      pos(-offsetX, -offsetY / 10),
      k.anchor("center"),
      k.color(k.WHITE),
      k.z(19),
    ]);
    k.add([
      k.text(wpm.toFixed(0), { size: 42 }),
      pos(-offsetX, +offsetY * 0.2),
      k.anchor("center"),
      k.color(k.YELLOW),
      k.z(19),
    ]);
    k.add([
      k.text(`accuracy ${acc.toFixed(0)}%`, { size: fontsize }),
      pos(-offsetX, +offsetY * 0.4+50),
      k.anchor("center"),
      k.color(k.YELLOW),
      k.z(19),
    ]);
    
    k.add([
      k.text("SCORE", { size: 32 }),
      pos(+offsetX, -offsetY / 10),
      k.anchor("center"),
      k.color(k.WHITE),
      k.z(19),
    ]);
    k.add([
      k.text(`${record_blocks}/${goalBlocks}`, { size: 42 }),
      pos(+offsetX, +offsetY * 0.2),
      k.anchor("center"),
      k.color(k.YELLOW),
      k.z(18),
    ]);
    
    k.add([
      k.text("last challenge", { size: fontsize }),
      pos(+offsetX, +offsetY * 0.45),
      k.anchor("center"),
      k.color(k.WHITE),
      k.z(18),
    ]);
    k.add([
      k.text(record_challenges, { size: fontsize }),
      pos(+offsetX, +offsetY * 0.4+50),
      k.anchor("center"),
      k.color(k.YELLOW),
      k.z(18),
    ]);
    k.add([
      k.text("ChallengeSet:", { size: fontsize +4 }),
      pos(0, +offsetY+25),
      k.anchor("center"),
      k.color(k.YELLOW),
      k.z(18),
    ]);
    k.add([
      k.text(blockNamesString, {
        size: fontsize,
        wrap: false,
        lineSpacing: 12,
      }),
      pos(0, +offsetY + 130),
      k.anchor("center"),
      k.color(k.WHITE),
      k.z(18),
    ]);
    k.add([
      k.text("ESC to retry", { size: 20 }),
      resizablePos(() => k.vec2(k.width() * 0.1 + 20, k.height() * 0.9)),
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
        blockNames:blockNamesString
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