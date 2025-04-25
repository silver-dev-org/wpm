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

    let wpm = parseFloat((goal_wpm || 0).toFixed(0));
    let lpm = parseFloat((goal_lpm || 0).toFixed(0));
    let acc = parseFloat((goal_acc || 0).toFixed(0));
    let awpm = parseFloat((goal_awpm || 0).toFixed(0));

    const saved = getPlay() || {};
    const best_wpm = Math.max(parseFloat(saved.bestWpm) || 0, wpm);

    wpm = parseFloat((wpm || 0).toFixed(0));
    lpm = parseFloat((lpm || 0).toFixed(0));
    acc = parseFloat((acc || 0).toFixed(0));

    const currentResults = {
        wpm: wpm,
        awpm: awpm,
        lpm: lpm,
        acc: acc,
    };
    savePlay({
        wpm: wpm,
        bestWpm: best_wpm,
        lpm: lpm,
        acc: acc,
        blockNames: blockNamesString
    });

    saveMute(settings.mute);
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

    const center = () => k.vec2(k.width() / 2, k.height() / 2);
    const offsetX = k.width() * 0.10;
    const offsetY = k.height() * 0.20;
    const pos = (dx, dy) => resizablePos(() => center().add(k.vec2(dx, dy)));
    const labelX = -offsetX - 45;
    const baseY = offsetY * 0.45;
    const textSpacing = fontsize + 20;
    const labelOffset = 4 * fontsize * 0.6; 
//sprites
    k.add([k.sprite("bg2"), k.pos(center()), k.anchor("center"), k.z(10)]);
    k.add([k.sprite("WPM"), resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.25)), k.anchor("center"), k.z(18)]);
//box
    k.add([k.rect(1080, 925, { radius: 36 }), k.pos(center()), k.anchor("center"), k.color(k.rgb(53, 53, 71)), k.z(10), k.opacity(0.3)]);
    k.add([k.rect(290, 280, { radius: 36 }), pos(-offsetX - 145, -offsetY + 130), k.color(k.rgb(53, 53, 71)), k.z(10), k.opacity(0.3)]);
    k.add([k.rect(290, 280, { radius: 36 }), pos(+offsetX - 145, -offsetY + 130), k.color(k.rgb(53, 53, 71)), k.z(10), k.opacity(0.3)]);
//texts
    k.add([k.text("WPM", { size: 32 }), pos(-offsetX, -offsetY / 10), k.anchor("center"), k.color(k.WHITE), k.z(19)]);
    k.add([k.text(wpm.toFixed(0), { size: 42 }), pos(-offsetX, offsetY * 0.2), k.anchor("center"), k.color(k.YELLOW), k.z(19)]);
    k.add([k.text("BEST", { size: fontsize }), pos(labelX, baseY), k.anchor("left"), k.color(k.WHITE), k.z(20)]);
    k.add([k.text(best_wpm.toFixed(0), { size: fontsize }), pos(labelX + labelOffset + 20, baseY), k.anchor("left"), k.color(k.WHITE), k.z(20)]);
    k.add([k.text("ACC", { size: fontsize }), pos(labelX, baseY + textSpacing), k.anchor("left"), k.color(k.YELLOW), k.z(19)]);
    k.add([k.text(`${acc.toFixed(0)}%`, { size: fontsize }), pos(labelX + labelOffset + 20, baseY + textSpacing), k.anchor("left"), k.color(k.YELLOW), k.z(19)]);
    k.add([k.text("SCORE", { size: 32 }), pos(+offsetX, -offsetY / 10), k.anchor("center"), k.color(k.WHITE), k.z(19)]);
    k.add([k.text(`${record_blocks}/${goalBlocks}`, { size: 42 }), pos(+offsetX, +offsetY * 0.2), k.anchor("center"), k.color(k.YELLOW), k.z(18)]);
    k.add([k.text("last challenge", { size: fontsize }), pos(+offsetX, +offsetY * 0.45), k.anchor("center"), k.color(k.WHITE), k.z(18)]);
    k.add([k.text(record_challenges, { size: fontsize }), pos(+offsetX, +offsetY * 0.4 + 50), k.anchor("center"), k.color(k.YELLOW), k.z(18)]);
    k.add([k.text("ChallengeSet:", { size: fontsize + 2 }), k.pos(k.width() * 0.45, k.height() * 0.74), k.anchor("left"), k.color(k.YELLOW), k.z(18)]);
    
    const lineHeight = fontsize + 12;
    blockNamesString.forEach((title, i) => {
        k.add([
            k.text(title, { size: fontsize + 2 }),
            resizablePos(() => k.vec2(k.width() * 0.45, k.height() * 0.78 + i * lineHeight)),
            k.anchor("left"), k.color(k.WHITE), k.z(18)
        ]);
    });

    onKeyPress("escape", () => {
        music.stop();
        k.go("game");
    });

    const button_muteON = k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.9, k.height() * 0 + 5),
        k.opacity(1),
        k.animate(),
        k.z(50),
    ]);
    const button_muteOFF = k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.9, k.height() * 0 + 5),
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
    const rest_text = k.add([
        k.text("ESC to retry", { size: 20 }),
        resizablePos(() => k.vec2(k.width() * 0.1 + 20, k.height() * 0.9)),
        k.anchor("center"),
        k.color(k.rgb(127, 134, 131)),
        k.animate(),
        k.z(19),
    ]);
    onKeyPress("escape", () => {
        record_blocks = 0;
        record_challenges = "";
        music.stop();
        k.go("game");
    });

});