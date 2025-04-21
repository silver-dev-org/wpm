import { k } from "../kaplay.js";
import { getMute, saveMute, getPlay } from "../systems/saves.js";
import { resizablePos } from "../components/resizablePos.js";

export const settings = { 
    mute: false, 
    rivalSpeed: 0.3 
};
k.scene("selection", () => {
    //testing options
    k.onKeyPress("up", () => {
        settings.rivalSpeed = Math.min(2, settings.rivalSpeed + 0.01);
        k.debug.log(` ${settings.rivalSpeed.toFixed(2)}`);
    });

    k.onKeyPress("down", () => {
        settings.rivalSpeed = Math.max(0, settings.rivalSpeed - 0.01);
        k.debug.log(` ${settings.rivalSpeed.toFixed(2)}`);
    });
    //
    k.loadSprite("icon_02", "/sprites/icon_02.png");
    k.loadSprite("icon_01", "/sprites/icon_01.png");
    k.loadMusic("videogame", "/sounds/videogame.mp3");
    const commands = ["about", "github", "start with sound", "start muted"];
    let fontsize = 18;

    function calcNewTarget(input) {
        if (input === "") return "Start with sound";
        const found = commands.find(cmd => cmd.startsWith(input.toLowerCase()));
        return found ? found : "Start with sound";
    }
    const playData = getPlay();
    if (playData) {
        console.log("Data:", playData.wpm, playData.acc);
    }
    settings.mute = getMute();
    k.volume(settings.mute ? 0 : 0.5);

    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const outsideBox = k.add([
        k.rect(800, 260, { radius: 2 }),
        k.pos(k.width() * 0.30 - 10, k.height() * 0.50),
        k.color(k.rgb(52, 53, 54)),
        k.z(20),
        k.opacity(0.3),
    ]);

    const outerBox = k.add([
        k.rect(790, 230, { radius: 1 }),
        k.pos(k.width() * 0.30 - 5, k.height() * 0.52),
        k.color(0, 0, 0),
        k.z(20),
        k.opacity(1),
    ]);
    const StartText = k.add([
        k.anchor("left"),
        k.text("Start with sound", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.35 - 40, k.height() * 0.55 + 20)),
        k.opacity(1),
        k.z(21),
    ]);
    const muteText = k.add([
        k.anchor("left"),
        k.text("Start muted", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.35 - 40, k.height() * 0.6 + 10)),
        k.opacity(1),
        k.z(21),
    ]);
    const gitText = k.add([
        k.anchor("left"),
        k.text("Github", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.6 - 40, k.height() * 0.55 + 20)),
        k.opacity(1),
        k.z(21),
    ]);
    const aboutText = k.add([
        k.anchor("left"),
        k.text("About", { size: fontsize }),
        resizablePos(() => k.vec2(k.width() * 0.6 - 40, k.height() * 0.6 + 10)),
        k.opacity(1),
        k.z(21),
    ]);
    const arrowStart = k.add([
        k.text("←", { size: fontsize }),
        resizablePos(() => k.vec2(StartText.pos.x + StartText.text.length * 14 + 10, StartText.pos.y)),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.opacity(0),
        k.z(22),
    ]);

    const arrowMute = k.add([
        k.text("←", { size: fontsize }),
        resizablePos(() => k.vec2(muteText.pos.x + muteText.text.length * 14 + 10, muteText.pos.y)),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.opacity(0),
        k.z(22),
    ]);
    k.add([
        k.anchor("center"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.85)),
        k.text("Get faster and better at technical interviewing ", {
            size: 22,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    k.add([
        k.anchor("center"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.90)),
        k.text("by practicing typing code.", {
            size: 22,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);

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
    const commandArrow = k.add([
        k.text("←", { size: 22 }),
        resizablePos(() => k.vec2(0, 0)),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.opacity(1),
        k.z(22),
        k.animate(),
    ]);

    function moveArrow(targetObj) {
        const newY = targetObj.pos.y;
        const newX = targetObj.pos.x + targetObj.text.length * 16;

        commandArrow.pos = k.vec2(newX, newY);

        commandArrow.animate("pos", [k.vec2(newX, newY), k.vec2(newX + 10, newY)], {
            duration: 0.5,
            loop: true,
            direction: "ping-pong",
        });
    }

    let targetText = "start with sound";
    let maxLength = targetText.length;
    const letterSpacing = 14;
    const fixedStartX = k.width() / 2.5 - ((maxLength - 1) * letterSpacing) / 2;
    let letterObjects = [];
    let underscoreObjects = [];

    function createLetterObjects() {
        letterObjects.forEach(obj => k.destroy(obj));
        underscoreObjects.forEach(obj => k.destroy(obj));
        letterObjects = [];
        underscoreObjects = [];
        for (let i = 0; i < maxLength; i++) {
            const letter = k.add([
                k.text(targetText[i], { size: fontsize }),
                k.pos(fixedStartX + i * letterSpacing, k.height() / 1.48),
                k.anchor("center"),
                k.color(k.rgb(128, 128, 128)),
                k.z(22),
                k.animate(),
            ]);
            letterObjects.push(letter);

            const underscore = k.add([
                k.text("_", { size: fontsize + 4 }),
                k.pos(fixedStartX + i * letterSpacing, k.height() / 1.45),
                k.anchor("center"),
                k.color(k.WHITE),
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
    k.volume(settings.mute ? 0 : 0.5);
    
    button_muteON.opacity = settings.mute ? 0 : 1;
    button_muteOFF.opacity = settings.mute ? 1 : 0;

    const name = k.add([
        k.text("", { size: fontsize }),
        k.textInput(true, 20),
        k.pos(fixedStartX, k.height() / 1.48),
        k.anchor("left"),
        k.color(k.YELLOW),
        k.opacity(0),
        k.z(21),
    ]);
    const slashChar = k.add([
        k.text("$-", { size: fontsize }),
        k.pos(name.pos.x - 40, name.pos.y),
        k.anchor("left"),
        k.color(k.rgb(3, 255, 87)),
        k.z(21),
    ]);
    let previousInput = "";
    let lastErrorCount = 0;

    name.onUpdate(() => {
        if (k.isKeyDown("escape")) {
            name.text = "";
            previousInput = "";
            return;
        }
        const input = name.text;

        if (input.length === maxLength) {
            let anyError = false;
            for (let i = 0; i < maxLength; i++) {
                if (input[i].toLowerCase() !== targetText[i]?.toLowerCase()) {
                    anyError = true;
                    break;
                }
            }
            if (anyError) {
                name.text = input.substring(0, maxLength - 1);
                preventError();
                return;
            }
        }

        const candidate = calcNewTarget(input);
        if (input === "" || candidate.toLowerCase().startsWith(input.toLowerCase())) {
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
        if (localErrorCount > lastErrorCount) {
            preventError();
        }
        lastErrorCount = localErrorCount;
        if (input.length > previousInput.length && localErrorCount >= 3) {
            name.text = previousInput;
            preventError();
            return;
        }
        if (localErrorCount >= 2 && input.length > lastErrorIndex + 1) {
            name.text = input.slice(0, lastErrorIndex + 1);
            preventError();
            return;
        }

        previousInput = name.text;

        letterObjects.forEach((letterObj, i) => {
            const correct = targetText[i];
            const char = input[i];
            let displayChar;
            if (!char) {
                displayChar = correct;
            } else if (char === " " && correct !== " ") {
                displayChar = "_";
            } else {
                displayChar = char;
            }
            let color;
            if (!char) {
                color = k.rgb(128, 128, 128);
            } else if (char.toLowerCase() !== correct.toLowerCase() || (char === " " && correct !== " ")) {
                color = k.rgb(255, 0, 0);
            } else {
                color = k.rgb(3, 255, 87);
            }
            letterObj.text = displayChar;
            letterObj.color = color;
        });

        underscoreObjects.forEach((uObj, i) => {
            if (i === input.length) {
                uObj.color = k.rgb(3, 255, 87);
                const blink = Math.abs(Math.sin(k.time() * 5));
                uObj.opacity = blink;
            } else {
                uObj.opacity = 0;
            }
        });

        switch (input.toLowerCase()) {
            case "github":
                window.open("https://github.com/conanbatt/wpm", "_blank");
                name.text = "";
                break;
            case "about":
                name.text = "";
                break;
            case "start with sound":
                settings.mute = false;
                k.volume(0.5);
                button_muteON.opacity = 1;
                button_muteOFF.opacity = 0;
                saveMute(false);
                name.text = "";
                k.go("game");
                break;
            case "start muted":
                settings.mute = true;
                k.volume(0);
                button_muteON.opacity = 0;
                button_muteOFF.opacity = 1;
                saveMute(true);
                name.text = "";
                k.go("game");
                break;
        }

        updateTextColors();
    });

    button_muteON.opacity = settings.mute ? 0 : 1;
    button_muteOFF.opacity = settings.mute ? 1 : 0;

    let isPreventingError = false;
    function preventError() {
        if (isPreventingError) return;
        isPreventingError = true;
        k.shake(2);
        if (!settings.mute) {
            k.play("wrong_typing");
        }
        k.wait(0.3, () => {
            isPreventingError = false;
        });
    }

    k.onKeyPress((keyPressed) => {
        if (keyPressed !== "backspace") {
            if (!settings.mute) {
                k.play("code_sound");
            }
        }
    });
});