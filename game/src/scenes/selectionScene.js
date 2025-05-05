import { k } from "../kaplay.js";
import { getMute, saveMute } from "../systems/preferences.js";
import { resizablePos } from "../components/resizablePos.js";

export const settings = {
    mute: false,
};
function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        .test(navigator.userAgent);
}
function escapeBackslashes(str) {
    return str.replace(/\\/g, "\\\\");
}
k.scene("selection", () => {
    k.loadSprite("icon_05", "/sprites/icon_04.png");
    k.loadSprite("icon_04", "/sprites/icon_04.png");
    k.loadSprite("icon_03", "/sprites/icon_03.png");
    k.loadSprite("icon_02", "/sprites/icon_02.png");
    k.loadSprite("icon_01", "/sprites/icon_01.png");
    k.loadSprite("BG_WPM_IN_GAME", "/sprites/BG_WPM_IN_GAME.png");
    k.loadSprite("BG_TIME_IN_GAME", "/sprites/BG_TIME_IN_GAME.png");
    k.loadSprite("SilverDevs", "/sprites/SilverDev_logo.png");
    k.loadMusic("videogame", "/sounds/videogame.mp3");
    
    const commands = ["about", "github", "start with sound", "start muted"];
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
    const buttonGap = 50;
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
    const StartText = k.add([k.anchor("left"), k.text("Start with sound", { size: fontsize }), resizablePos(() => k.vec2(buttonLeftX, buttonTopY)), k.opacity(1), k.z(21)]);
    const muteText = k.add([k.anchor("left"), k.text("Start muted", { size: fontsize }), resizablePos(() => k.vec2(buttonLeftX, buttonTopY + buttonGap)), k.opacity(1), k.z(21)]);
    const gitText = k.add([k.anchor("left"), k.text("Github", { size: fontsize }), resizablePos(() => k.vec2(buttonRightX, buttonTopY)), k.opacity(1), k.z(21)]);
    const aboutText = k.add([k.anchor("left"), k.text("About", { size: fontsize }), resizablePos(() => k.vec2(buttonRightX, buttonTopY + buttonGap)), k.opacity(1), k.z(21)]);

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
    const commandArrow = k.add([
        k.text("←", { size: 22 }),
        resizablePos(() => k.vec2(0, 0)),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.opacity(1),
        k.z(22),
        k.animate(),
    ]);

    function calcNewTarget(input) {
        if (input === "") return "Start with sound";
        const found = commands.find(cmd => cmd.startsWith(input.toLowerCase()));
        return found ? found : "Start with sound";
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

    let targetText = "Start with sound";
    let maxLength = targetText.length;
    const letterSpacing = 14;
    const fixedStartX = k.width() / 2.58 - ((maxLength - 1) * letterSpacing) / 2;
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
        const targetLower = targetText.toLowerCase();

        const allCommands = [
            { textObj: StartText, label: "start with sound" },
            { textObj: muteText, label: "start muted" },
            { textObj: gitText, label: "github" },
            { textObj: aboutText, label: "about" },
        ];

        let targetObj = null;

        allCommands.forEach(({ textObj, label }) => {
            const isSelected = targetLower === label.toLowerCase();
            textObj.color = isSelected ? k.rgb(3, 255, 87) : k.rgb(255, 255, 255);
            if (isSelected) {
                targetObj = textObj;
            }
        });

        if (targetObj) {
            commandArrow.opacity = 1;
            moveArrow(targetObj);
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
        k.text("$-", { size: fontsize }),
        k.pos(name.pos.x - 40, textY),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.z(21),
    ]);

    button_muteON.opacity = settings.mute ? 0 : 1;
    button_muteOFF.opacity = settings.mute ? 1 : 0;

    let isPreventingError = false;
    let previousInput = "";
    let lastErrorCount = 0;
    let rawInput = "";
    function preventError() {
        if (isPreventingError) return;
        isPreventingError = true;
        k.shake(2);
        if (!settings.mute) {
            k.play("wrong_typing");
        }
        k.wait(0.3, () => { isPreventingError = false; });
    }

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

        //check long and max error count
        if (isTooLongTotal || isGrowingWithErrors) {
            preventError();
            rawInput = previousInput;
            name.text = escapeBackslashes(rawInput);
            return;
        }

        if (localErrorCount > lastErrorCount) {
            preventError();
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
            case "github":
                window.open("https://github.com/conanbatt/wpm", "_blank");
                ResetGame();
                break;
            case "about":
                k.go("about");
                break;
            case "start with sound":
                settings.mute = false; saveMute(false);
                k.setVolume(0.5); 
                k.go("game");
                break;
            case "start muted":
                settings.mute = true; saveMute(true);
                k.setVolume(0); 
                k.go("game");
                break;
        }
        updateTextColors();
    }
    
    function ResetGame() {
        rawInput = "";
        previousInput = "";
        lastErrorCount = 0;
        targetText = "Start with sound";
        maxLength = targetText.length;
        createLetterObjects();
        updateTextColors();
        name.text = "";
    }

    k.onKeyPress((ch) => {
        if (ch.length !== 1) return;
        const shifting = k.isKeyDown("shift");
        const char = shifting ? ch.toUpperCase() : ch;
        previousInput = rawInput;
        rawInput += char;
        name.text = escapeBackslashes(rawInput);
        handleInputUpdate(rawInput);

        if (char !== ' ' && !settings.mute) {
            k.play('code_sound');
        }
    });

    k.onKeyPress('backspace', () => {
        if (!rawInput) return;
        rawInput = rawInput.slice(0, -1);
        name.text = escapeBackslashes(rawInput);
        handleInputUpdate(rawInput);
    });

    k.onKeyPress("space", () => {
        previousInput = rawInput;
        rawInput += " ";
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
});
