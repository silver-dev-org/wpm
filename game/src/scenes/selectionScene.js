import {
    escapeBackslashes,
    preventError,
} from "../data/utilities.js";
import { getMute, saveMute } from "../systems/preferences.js";
import { resizablePos } from "../components/resizablePos.js";
import { k } from "../kaplay.js";
export const settings = {
    mute: false,
    practiceMode: false,
    isCapsOn: false,
    rivalSpeed: 0,
    language: "js"
};
function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent);
}
k.scene("selection", () => {
    k.loadSprite("icon_05", "/sprites/icon_05.png");
    k.loadSprite("icon_04", "/sprites/icon_04.png");
    k.loadSprite("icon_03", "/sprites/icon_03.png");
    k.loadSprite("icon_02", "/sprites/icon_02.png");
    k.loadSprite("icon_01", "/sprites/icon_01.png");
    k.loadSprite("BG_WPM_IN_GAME", "/sprites/BG_WPM_IN_GAME.png");
    k.loadSprite("BG_TIME_IN_GAME", "/sprites/BG_TIME_IN_GAME.png");
    k.loadSprite("SilverDevs", "/sprites/SilverDev_logo.png");
    k.loadMusic("videogame", "/sounds/videogame.mp3");
    let commands = [];
    const fontsize = 18;
    const boxWidth = 800;
    const textY = k.height() * 0.85;
    const underscoreY = k.height() * 0.86;
    const boxY = k.height() * 0.66;
    const boxX = k.width() * 0.30 - 10;
    const boxCenterX = boxX + boxWidth / 2;
    const arrowYOffset = 0;
    const buttonLeftX = k.width() * 0.35 - 40;
    const buttonRightX = k.width() * 0.6 - 40;
    const buttonTopY = boxY + 80;
    const buttonGap = 30;
    let stage = 0;
    settings.mute = getMute();
    k.setVolume(settings.mute ? 0 : 0.5);
    k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    if (isMobile()) {
        k.add([
            k.text("WPM is a desktop-only experience", { size: 18 }),
            resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.5)),
            k.anchor("center"),
            k.color(k.YELLOW),
            k.z(18),
        ]);
        const title = k.add([
            k.sprite("WPM"),
            resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.25)),
            k.anchor("center"),
            k.scale(0.5),
            k.z(18),
        ]);
        return;
    }
    isMobile();
    k.add([
        k.pos(boxCenterX, k.height() * 0.50),
        k.anchor("center"),
        k.text("Get faster and better at technical interviewing", { size: 22 }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    k.add([
        k.pos(boxCenterX, k.height() * 0.55),
        k.anchor("center"),
        k.text("by practicing typing code.", { size: 22 }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.25)),
        k.anchor("center"),
        k.z(18),
    ]);

    const outsideBox = k.add([k.rect(810, 260, { radius: 0 }), k.pos(k.width() * 0.30 - 15, boxY), k.color(k.rgb(52, 53, 54)), k.z(20), k.opacity(0.3)]);
    const outerBox = k.add([k.rect(790, 230, { radius: 1 }), k.pos(k.width() * 0.30 - 5, boxY + 20), k.color(0, 0, 0), k.z(20), k.opacity(1)]);
    const selecttext = k.add([k.anchor("left"), k.text("", { size: fontsize }), resizablePos(() => k.vec2(buttonLeftX, buttonTopY)), k.opacity(1), k.z(21)]);
    const selecttext2 = k.add([k.anchor("left"), k.text("", { size: fontsize }), resizablePos(() => k.vec2(buttonLeftX, buttonTopY + buttonGap)), k.opacity(1), k.z(21)]);
    const selecttext3 = k.add([k.anchor("left"), k.text("", { size: fontsize }), resizablePos(() => k.vec2(buttonLeftX, buttonTopY + buttonGap * 2)), k.opacity(1), k.z(21)]);
    const selecttext4 = k.add([k.anchor("left"), k.text("", { size: fontsize }), resizablePos(() => k.vec2(buttonLeftX + 250, buttonTopY + buttonGap)), k.opacity(1), k.z(21)]);

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
    audioUpadte();

    const commandArrow = k.add([
        k.text("←", { size: 22 }),
        resizablePos(() => k.vec2(0, 0)),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.opacity(1),
        k.z(22),
        k.animate(),
    ]);
    function updateStageCommands() {
        switch (stage) {
            case 0:
                commands = ["about", "github", "start"];
                break;
            case 1:
                commands = ["yes", "no"];
                break;
            case 2:
                commands = ["javascript", "python", "golang"];
                break;
            case 3:
                commands = ["interview", "practice"];
                break;
        }
        selecttext.text = stage === 0 ? "Start"
            : stage === 1 ? "Play with Audio?"
                : stage === 2 ? "Language"
                    : "Game Mode";
        selecttext2.text = commands[0];
        selecttext3.text = commands[1];
        if (stage === 2) selecttext4.text = commands[2];
        else selecttext4.text = "";

        updateTextColors();
    }
    function calcNewTarget(input) {
        if (input !== "") {
            const match = commands.find(cmd =>
                cmd.startsWith(input.toLowerCase())
            );
            if (match) return match;
        }

        const defaults = {
            1: "yes",
            2: "javascript",
            3: "interview"
        };

        return defaults[stage] || "start";
    }

    function moveArrow(targetObj) {
        const newY = targetObj.pos.y + arrowYOffset;
        const newX = targetObj.pos.x + targetObj.text.length * 16;
        commandArrow.pos = k.vec2(newX, newY);
        commandArrow.animate("pos", [k.vec2(newX, newY), k.vec2(newX + 10, newY)], {
            duration: 0.5,
            loop: true,
            direction: "ping-pong",
        });
    }

    let targetText = "Start";
    let maxLength = targetText.length;
    const letterSpacing = 14;
    const fixedStartX = k.width() / 2.88 - ((maxLength - 1) * letterSpacing) / 2;
    let letterObjects = [];
    let underscoreObjects = [];
    updateTextColors();

    function createLetterObjects() {
        letterObjects.forEach(obj => k.destroy(obj));
        underscoreObjects.forEach(obj => k.destroy(obj));
        letterObjects = [];
        underscoreObjects = [];

        for (let i = 0; i < maxLength; i++) {
            const letter = k.add([
                k.text(targetText[i], { size: fontsize }),
                k.pos(fixedStartX + i * letterSpacing, textY),
                k.anchor("center"),
                k.color(k.rgb(128, 128, 128)),
                k.z(22),
                k.animate(),
            ]);

            letterObjects.push(letter);

            const underscore = k.add([
                k.text("_", { size: fontsize + 4 }),
                k.pos(fixedStartX + i * letterSpacing, underscoreY),
                k.anchor("center"),
                k.color(k.rgb(3, 255, 87)),
                k.opacity(i === 0 ? 1 : 0),
                k.z(20),
            ]);
            underscoreObjects.push(underscore);
        }
    }
    createLetterObjects();

    function updateTextColors() {
        selecttext.color = k.rgb(255, 255, 255);
        selecttext2.color = k.rgb(255, 255, 255);
        selecttext3.color = k.rgb(255, 255, 255);

        const cmdLower = targetText.toLowerCase();
        let commandList;

        switch (stage) {
            case 0:
                commandList = [
                    { obj: selecttext, label: "start" },
                    { obj: selecttext2, label: "github" },
                    { obj: selecttext3, label: "about" }
                ];
                break;
            case 1:
                commandList = [
                    { obj: selecttext2, label: "yes" },
                    { obj: selecttext3, label: "no" }
                ];
                break;
            case 2:
                commandList = [
                    { obj: selecttext2, label: "javascript" },
                    { obj: selecttext3, label: "python" },
                    { obj: selecttext4, label: "golang" }
                ];
                break;
            case 3:
                commandList = [
                    { obj: selecttext2, label: "interview" },
                    { obj: selecttext3, label: "practice" }
                ];
                break;
            default:
                commandList = [];
        }

        let selected = null;
        commandList.forEach(({ obj, label }) => {
            if (cmdLower === label) {
                obj.color = k.rgb(3, 255, 87);
                selected = obj;
            }
        });

        if (selected) {
            commandArrow.opacity = 1;
            moveArrow(selected);
        } else if (commandList.length) {
            commandArrow.opacity = 1;
            moveArrow(commandList[0].obj);
        } else {
            commandArrow.opacity = 0;
        }
    }

    settings.mute = getMute();
    k.setVolume(settings.mute ? 0 : 0.5);
    button_muteON.opacity = settings.mute ? 0 : 1;
    button_muteOFF.opacity = settings.mute ? 1 : 0;

    const name = k.add([
        k.text("", { size: fontsize }),
        k.pos(fixedStartX, textY),
        k.anchor("left"),
        k.color(k.YELLOW),
        k.opacity(0),
        k.z(21),
    ]);
    const slashChar = k.add([
        k.text("-", { size: fontsize }),
        k.pos(name.pos.x - 30, textY),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.z(21),
    ]);

    function audioUpadte() {
        button_muteON.opacity = settings.mute ? 0 : 1;
        button_muteOFF.opacity = settings.mute ? 1 : 0;
    }

    let previousInput = "";
    let lastErrorCount = 0;
    let rawInput = "";

    function handleInputUpdate(input) {
        const candidate = calcNewTarget(input);
        if (!input || candidate.toLowerCase().startsWith(input.toLowerCase())) {
            if (candidate !== targetText) {
                targetText = candidate;
                maxLength = targetText.length;
                createLetterObjects();
            }
        }

        let localErrorCount = 0;
        let lastErrorIndex = -1;
        for (let i = 0; i < input.length; i++) {
            if (input[i].toLowerCase() !== targetText[i]?.toLowerCase()) {
                localErrorCount++;
                lastErrorIndex = i;
            }
        }

        const maxError = 3;
        const isTooLongTotal = input.length > targetText.length;
        const isGrowingWithErrors = input.length > previousInput.length && localErrorCount >= maxError;
        const hasAdvancedPastError = localErrorCount >= 2 && input.length > lastErrorIndex + 1;

        if (isTooLongTotal || isGrowingWithErrors) {
            preventError(k, settings);
            rawInput = previousInput;
            name.text = escapeBackslashes(rawInput);
            return;
        }

        if (localErrorCount > lastErrorCount) {
            preventError(k, settings);
        }
        lastErrorCount = localErrorCount;

        if (hasAdvancedPastError) {
            rawInput = input.slice(0, lastErrorIndex + 1);
            name.text = escapeBackslashes(rawInput);
            return;
        }

        rawInput = input;
        previousInput = rawInput;

        letterObjects.forEach((letterObj, i) => {
            const correct = targetText[i];
            const char = input[i];
            const displayChar = !char
                ? correct
                : (char === " " && correct !== " " ? "_" : char);

            letterObj.text = escapeBackslashes(displayChar);
            letterObj.color = !char
                ? k.rgb(128, 128, 128)
                : (char.toLowerCase() !== correct.toLowerCase() || (char === " " && correct !== " "))
                    ? k.rgb(255, 0, 0)
                    : k.rgb(3, 255, 87);
        });

        underscoreObjects.forEach((uObj, i) => {
            if (i === input.length) {
                uObj.color = k.rgb(3, 255, 87);
                uObj.opacity = Math.abs(Math.sin(k.time() * 5));
            } else {
                uObj.opacity = 0;
            }
        });

        switch (input.toLowerCase()) {
            case "javascript":
            case "python":
            case "golang":
                if (stage === 2) {
                    settings.language = input.toLowerCase();
                    advanceStage();
                    updateStageCommands();
                    const candidate = calcNewTarget("");
                    if (candidate !== targetText) {
                        targetText = candidate;
                        maxLength = targetText.length;
                        createLetterObjects();
                    }
                }
                break;
            case "github":
                if (stage === 0) {
                    window.open("https://github.com/conanbatt/wpm", "_blank");
                    ResetGame();
                }
                break;
            case "about":
                if (stage === 0) {
                    window.removeEventListener("keydown", handleKeydown);
                    k.go("about");
                }
                break;
            case "start":
                if (stage === 0) {
                    advanceStage();
                    updateStageCommands();
                    const candidate = calcNewTarget("");
                    if (candidate !== targetText) {
                        targetText = candidate;
                        maxLength = targetText.length;
                        createLetterObjects();
                    }
                }
                break;
            case "yes":
                if (stage === 1) {
                    settings.mute = false;
                    saveMute(false);
                    k.setVolume(0.5);
                    audioUpadte();
                    advanceStage();
                }
                break;
            case "no":
                if (stage === 1) {
                    settings.mute = true;
                    saveMute(true);
                    k.setVolume(0);
                    audioUpadte();
                    advanceStage();
                }
                break;
            case "interview":
                if (stage === 3) {
                    window.removeEventListener("keydown", handleKeydown);
                    k.go("game");
                }
                break;
            case "practice":
                if (stage === 3) {
                    settings.practiceMode = true;
                    window.removeEventListener("keydown", handleKeydown);
                    k.go("game");
                }
                break;
        }
        updateTextColors();
    }

    function resetCommon(initialTarget) {
        rawInput = "";
        previousInput = "";
        lastErrorCount = 0;
        updateStageCommands();
        targetText = initialTarget;
        maxLength = targetText.length;
        createLetterObjects();
        updateTextColors();
        name.text = "";
    }

    function ResetGame() {
        stage = 0;
        resetCommon("Start");
    }

    function resetInputUI() {
        switch (stage) {
            case 1:
                resetCommon("Yes");
                break;
            case 2:
                resetCommon("javascript");
                break;
            case 3:
                resetCommon("Interview");
                break;
            default:
                resetCommon(commands[0]);
                break;
        }
    }
    function advanceStage() {
        stage++;
        resetInputUI();
    }

    let handleKeydown;

    function setupKeyboardInput() {
        handleKeydown = (e) => {
            e.preventDefault();
            if (e.getModifierState && typeof e.getModifierState === "function") {
                settings.isCapsOn = e.getModifierState("CapsLock");
            }
            if (e.key.length === 1) {
                previousInput = rawInput;
                rawInput += e.key;
                name.text = escapeBackslashes(rawInput);
                handleInputUpdate(rawInput);

                if (e.key !== " " && !settings.mute) {
                    k.play("code_sound");
                }
            }
        };

        window.addEventListener("keydown", handleKeydown);
    }

    k.onKeyPress('backspace', () => {
        if (!rawInput) return;
        rawInput = rawInput.slice(0, -1);
        name.text = escapeBackslashes(rawInput);
        handleInputUpdate(rawInput);
    });

    k.onKeyDown("escape", () => {
        ResetGame();
    });

    k.onUpdate(() => {
        underscoreObjects.forEach((uObj, i) => {
            if (i === rawInput.length) {
                uObj.color = k.rgb(3, 255, 87);
                uObj.opacity = Math.abs(Math.sin(k.time() * 5));
            } else {
                uObj.opacity = 0;
            }
        });
    });
    updateStageCommands();
    setupKeyboardInput();
});
