// @ts-check
import "../types.js";
import {
    gameState,
    dialogsData,
    lineHeight,
    EASY_RIVAL_SPEED,
    JUMP_AFTER,
    TEXT_START_Y,
    SPACING,
    MAX_BLOCKS,
    goalBlocks,
    maxMistakes,
    ICON_START_Y
} from "../constants.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { k } from "../kaplay.js";
import { themes } from "../data/themes.js";
import { resizablePos } from "../components/resizablePos.js";
import { resizableRect } from "../components/resizableRect.js";
import { settings } from "./selectionScene.js";
let titles = dialogsData.map((item) => item.title);

let COLOR_TEXT_DEFAULT = k.Color.fromHex("#707478");
let COLOR_TEXT_RIVAL = k.YELLOW;
let COLOR_TEXT_INCORRECT = k.Color.RED;
let actual_rivalSpeed = EASY_RIVAL_SPEED;
let completedBlocks = -1;
export let actual_wpm = 0;
export let actual_lpm = 0;
export let actual_acc = 0;
export let actual_awpm = 0;
export let totalCorrectChars = 0;
export let totalIcorrectCorrectChars = 0;
export let totalTypedCharacters = 0;
export let totalCorrectlines = 0;
export let goal_wpm = actual_wpm;
export let goal_awpm = actual_awpm;
export let goal_lpm = actual_lpm;
export let goal_acc = actual_acc;
export let goalCompletedBlocks = completedBlocks;
export let lastChallenge = "";
let fontSize = 30;
let fontWidth = 17;
let errorCharsIndexes = [];
let errorCharsReplaces = {};

/**
 * Text taken from the dialogs.json file
 */
let originalText = "";
/**
 * The rendered and escaped text
 */
let renderedText = "";
/**
 * Text for comparison with user input
 */
let fixedText = "";

/**
 * @param {GameParams} params
 */
const gameScene = (params) => {

    k.loadMusic("endgame", "/sounds/endgame.mp3");
    k.loadSprite("SilverDevs", "/sprites/SilverDev_logo.png");
    k.loadSprite("arrow_yellow", "/sprites/arrow_yellow.png");
    k.loadSprite("BG_analitycs7", "/sprites/BG_WPM_IN_GAME.png");
    k.loadSprite("BG_analitycs8", "/sprites/BG_TIME_IN_GAME.png");
    let startTime = 0;
    let jumpCount = 0;
    let theme = themes[0];
    let currentBlockIndex = -1;
    let rivalSpeed = params.rivalSpeed ?? actual_rivalSpeed;
    let curBlockData = {
        lineCount: 0,
    };

    // Music
    const music = k.play("videogame");
    let musicRate = 0.95;
    music.loop = true;
    music.volume = 0;
    const maxVolume = 0.3;
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

    titles = shuffle(dialogsData);

    // #region PLAYER  & RIVAL VARIABLES

    /**
     * @type {PlayerState}
     */
    const playerState = {

        cursorPos: 0,
        line: "",
        curLineCount: 0,
        curCharInLine: 0,
        curIdentSize: 0,
        cursorPointer: null,
        reset: () => {
            playerState.cursorPos = 0;
            playerState.line = "";
            playerState.curLineCount = 0;
            playerState.curCharInLine = 0;
            playerState.curIdentSize = 0;
            if (playerState.cursorPointer) {
                playerState.cursorPointer.pos = cursorPos();
            }
        },
    };

    /**
     * @type {PlayerState}
     */
    const rivalState = {
        cursorPos: 0,
        line: "",
        curLineCount: 0,
        curCharInLine: 0,
        curIdentSize: 0,
        cursorPointer: null,
        reset: () => {
            rivalState.cursorPos = 0;
            rivalState.line = "";
            rivalState.curLineCount = 0;
            rivalState.curCharInLine = 0;
            rivalState.curIdentSize = 0;
            if (rivalState.cursorPointer) {
                rivalState.cursorPointer.pos = cursorPos(true);
            }
        },
    };

    // #endregion

    /**
     * @param {number} i
     */
    /**
     * @param {number} i
     */
    const matchColorToken = (i, ch) => {
        const themeTokens = theme.tokens;
        const themeAssociations = theme.associations;

        if (i === rivalState.cursorPos) {
            return COLOR_TEXT_RIVAL;
        }

        if (ch === " ") return COLOR_TEXT_DEFAULT;
        if (playerState.cursorPos - 1 < i) {
            if (rivalState.cursorPos + 1 > i) {
                return COLOR_TEXT_RIVAL;
            }
            return COLOR_TEXT_DEFAULT;
        }

        let charColor = COLOR_TEXT_DEFAULT;

        const words = originalText.split(" ");
        let wordCharsIndex = 0;
        const word =
            words.find((w) => {
                const found = w.length + wordCharsIndex >= i;
                wordCharsIndex += w.length + 1;
                return found;
            }) || "";

        if (errorCharsIndexes.includes(i)) {
            charColor = COLOR_TEXT_INCORRECT;
        } else if (ch.match(themeAssociations.brackets)) {
            charColor = k.Color.fromHex(themeTokens.brackets);
        } else if (ch.match(themeAssociations.punctuation)) {
            charColor = k.Color.fromHex(themeTokens.punctuation);
        } else if (word.match(themeAssociations.classes)) {
            charColor = k.Color.fromHex(themeTokens.classes);
        } else if (word.match(themeAssociations.functions)) {
            charColor = k.Color.fromHex(themeTokens.functions);
        } else if (word.match(themeAssociations.keywords)) {
            charColor = k.Color.fromHex(themeTokens.keywords);
        } else if (word.match(themeAssociations.strings)) {
            charColor = k.Color.fromHex(themeTokens.strings);
        } else {
            charColor = k.Color.fromHex(themeTokens.text);
        }

        if (
            rivalState.cursorPos < playerState.cursorPos &&
            rivalState.cursorPos > i
        ) {
            return charColor
        }

        return charColor;
    };

    let rivalTimer = 0;

    k.onUpdate(() => {
        startTime += k.dt();
        analitycs_calculate();

        rivalTimer += k.dt();
        if (rivalTimer >= rivalSpeed) {
            rivalTimer -= rivalSpeed;
            if (rivalState.curLineCount < curBlockData.lineCount - 1) {
                rivalWrite();
            } else {
                music.stop();
                k.go("endgame", { rivalSpeed: actual_rivalSpeed });
                StatsforAnalitics();
                resetGameStats();
            }
        }

        const totalEventsLast60 = eventBuffer.reduce((sum, count) => sum + count, 0);
        const awpm = totalEventsLast60 / 5;
        actual_awpm = awpm;
    });

    function StatsforAnalitics() {
        goal_wpm = actual_wpm;
        goal_awpm = actual_awpm;
        goal_lpm = actual_lpm;
        goal_acc = actual_acc;
        goalCompletedBlocks = completedBlocks;
    }

    function resetGameStats() {
        completedBlocks = -1;
        actual_wpm = 0;
        actual_awpm = 0;
        actual_lpm = 0;
        actual_acc = 0;
        totalCorrectChars = 0;
        totalIcorrectCorrectChars = 0;
        totalTypedCharacters = 0;
        totalCorrectlines = 0;
        actual_rivalSpeed = EASY_RIVAL_SPEED;
        errorCharsIndexes = [];
        errorCharsReplaces = {};
    }

    // background
    // Files & Folders
    const filesFoldersSize = () => {
        if (k.width() > 1080) {
            return k.vec2(328, k.height());
        } else {
            return k.vec2(k.width() * 0.3, k.height());
        }
    };
    const filesFoldersPos = () => k.vec2(0, 0);

    const wmp_text = k.add([
        k.anchor("center"),
        k.pos(k.width() * 0.4, k.height() * 0.02),
        k.text("0", {
            size: 32,
        }),
        k.color(k.YELLOW),
        k.z(50),
    ]);
    const time_text = k.add([
        k.anchor("center"),
        k.pos(k.width() * 0.6, k.height() * 0.02),
        k.text("time: ", {
            size: 32,
        }),
        k.color(k.YELLOW),
        k.z(50),
    ]);
    k.add([
        k.sprite("BG_analitycs7"),
        k.pos(k.width() * 0.3, k.height() * 0.023),
        k.anchor("center"),
        k.z(51),
    ]);
    k.add([
        k.sprite("BG_analitycs8"),
        k.pos(k.width() * 0.5, k.height() * 0.023),
        k.anchor("center"),
        k.z(51),
    ]);
    k.add([
        resizablePos(filesFoldersPos),
        k.sprite("bg"),
        k.anchor("topleft"),
        k.opacity(1),
    ]);
    k.add([
        k.pos(k.width() * 0.01, k.height() * 0.01),
        k.sprite("SilverDevs"),
        k.anchor("topleft"),
        k.opacity(1),
        k.z(51),
    ]);
    const textboxBack = k.add([
        k.pos(1000, 0),
        k.sprite("bg2", {
            tiled: true,
            width: 2000,
            height: 54,
        }),
        k.anchor("top"),
        k.z(10),
    ]);
    const text_challenge = k.add([
        k.text("Challenges", {
            size: 28,
            font: "thaleahFat",
        }),
        resizablePos(() => k.vec2(k.width() * 0.05, k.height() * 0.1)),
        k.color(k.WHITE),
        k.opacity(1),
    ]);
    const rest_text = k.add([
        k.text("ESC to reset", {
            size: 28,
            font: "thaleahFat",
        }),
        resizablePos(() => k.vec2(k.width() * 0.06, k.height() * 0.9)),
        k.color(k.YELLOW),
        k.opacity(1),
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
    const languageIconMap = {
        js: "icon_02",
        ts: "icon_01",
        default: "icon_02",
    };

    const texts = dialogsData.map(item => ({
        title: item.title,
        language: item.language || "default",
    }));

    texts.slice(0, MAX_BLOCKS).forEach(({ title, language }, index) => {
        const spriteKey = languageIconMap[language] ?? languageIconMap.default;

        const spriteAsset = k.getSprite(spriteKey);
        let scaleFactor = 1;
        const desiredWidth = k.width() * 0.025;

        if (spriteAsset?.data?.width) {
            scaleFactor = desiredWidth / spriteAsset.data.width;
        } else {
            console.warn(`Sprite "${spriteKey}" undefined assets`);
        }

        k.add([
            k.sprite(spriteKey),
            k.scale(scaleFactor),
            resizablePos(() =>
                k.vec2(
                    k.width() * 0.02,
                    k.height() * (ICON_START_Y + SPACING * index)
                )
            ),
            k.opacity(1),
            k.z(55),
            "challengeIcon",
        ]);

        k.add([
            k.text(title, { size: 30 }),
            resizablePos(() =>
                k.vec2(
                    k.width() * 0.05,
                    k.height() * (TEXT_START_Y + SPACING * index)
                )
            ),
            k.color(k.WHITE),
            k.opacity(1),
            "menuItem",
            { menuIndex: index },
        ]);
    });

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

    k.onKeyPress(["escape"], () => {
        music.stop();
        resetGameStats();
        k.go("game", {
            rivalSpeed: actual_rivalSpeed,
        });
    });

    k.onKeyPress(["up"], () => {
        StatsforAnalitics();
        resetGameStats();
        music.stop();
        k.go("endgame", {
            rivalSpeed: actual_rivalSpeed,
        });
    });

    const arrow = k.add([
        k.sprite("arrow_yellow"),
        k.pos(k.width() * 0.1, k.height() * (TEXT_START_Y - SPACING * 0.5)),
        k.opacity(1),
        k.animate(),
    ]);

    let currentIndex = -1;
    let arrow_ypos = arrow.pos.y;

    function moveArrow() {
        const newY = k.height() * (TEXT_START_Y + SPACING * currentIndex);
        arrow.pos = k.vec2(arrow.pos.x, newY);
        arrow.animate("pos", [k.vec2(10, newY), k.vec2(20, newY)], {
            duration: 0.5,
            direction: "ping-pong",
        });

        k.get("menuItem").forEach((item) => {
            if (item.menuIndex === currentIndex) {
                item.color = k.YELLOW;
            } else {
                item.color = k.WHITE;
            }
        });
    }

    const textboxSize = () => k.vec2(k.width(), k.height());
    const textboxPos = () => {
        if (k.width() > 1080) {
            return k.vec2(460, 0);
        }

        return k.vec2(k.width() * 0.3, 0);
    };

    const textPadding = k.vec2(50, 103);

    k.volume(0.5);

    const textbox = k.add([
        k.rect(1920, 1080, { radius: 8 }),
        k.color(k.rgb(47, 47, 59)),
        resizablePos(textboxPos),
        k.anchor("topleft"),
        k.opacity(0.3),
        k.z(0),
    ]);
    const textboxBackParent = k.add([
        resizableRect(textboxSize),
        resizablePos(textboxPos),
        k.anchor("topleft"),
        k.color(),
        k.rotate(0),
        k.scale(1),
        k.z(10),
        k.opacity(0),
    ]);

    const textboxTextPos = () => {
        return k.vec2(textPadding).sub(0, lineHeight * (JUMP_AFTER * jumpCount));
    }

    const textboxText = textboxBackParent.add([
        k.text("", {
            size: fontSize,
            transform: (idx, ch) => ({
                color: matchColorToken(idx, ch),
            }),
        }),
        k.pos(0, 0),
        resizablePos(textboxTextPos),
    ]);

    const cursorPos = (rival = false) => {
        const player = rival ? rivalState : playerState;

        return k.vec2(
            textboxBackParent.pos
                .add(textboxText.pos)
                .add(
                    player.curCharInLine * fontWidth,
                    (player.curLineCount + 1) * lineHeight,
                ),
        );
    };

    const cursorPointer = k.add([
        k.text("_", { size: 30 }),
        resizablePos(() => cursorPos()),
        k.opacity(1),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.z(10),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 30 }),
        resizablePos(() => cursorPos(true)),
        k.opacity(1),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

    makeBlink(cursorPointer);
    makeBlink(rivalPointer);

    function makeBlink(entity) {
        k.loop(0.5, () => {
            entity.opacity = entity.opacity === 0 ? 0.8 : 0;
        });
    }
    playerState.cursorPointer = cursorPointer;
    rivalState.cursorPointer = rivalPointer;

    function getCurrentDialog() {
        if (dialogsData && dialogsData[currentBlockIndex]) {
            return dialogsData[currentBlockIndex];
        } else {
            console.error("dialogs.json is undefined or out of range");
            return dialogsData[0];
        }
    }

    /**
     * @param {string} group
     */
    const logGroupWithColor = (group) => {
        if (k.debug.inspect !== true) return;

        const curChar = group[playerState.cursorPos];
        const groupFrom = group.substring(0, playerState.cursorPos);
        const groupTo = group.substring(playerState.cursorPos + 1);

        console.log(
            `%c${groupFrom}%c${curChar}%c${groupTo}`,
            "color: inherit;",
            "color: #f00;",
            "color: inherit;",
        );
    };

    function updateDialog() {
        currentBlockIndex++;
        completedBlocks++;
        if (completedBlocks > 0 && completedBlocks <= 2) {
            actual_rivalSpeed -= 0.05;
        } else if (completedBlocks > 2) {
            actual_rivalSpeed -= 0.06;
        }
        musicRate += 0.05;
        updateMusic();
        if (completedBlocks === goalBlocks) {
            completedBlocks = goalBlocks;
            StatsforAnalitics();
            resetGameStats();
            music.stop();
            k.go("endgame", { rivalSpeed: actual_rivalSpeed });
            return;
        }

        rivalSpeed -= 0.02;
        playerState.reset();
        rivalState.reset();
        arrow.pos = k.vec2(arrow.pos.x, arrow_ypos);

        if (currentIndex < Math.min(texts.length, MAX_BLOCKS) - 1) {
            currentIndex++;
            moveArrow();
        }
        jumpCount = 0;
        textboxText.updatePos();

        const currentDialog = getCurrentDialog();

        const lang = currentDialog.language ?? "default";
        theme = themes.find(t => t.name === lang) || themes[0];
        const currentBlocks = currentDialog.blocks;
        curBlockData.lineCount = currentBlocks.length;

        originalText = currentBlocks.join("");
        const fixedGroup = originalText
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/▯/g, " ");
        fixedText = originalText.replace(/▯/g, " ");
        renderedText = fixedGroup;
        textboxText.text = renderedText;

        playerState.line = fixedText.split("\n")[0];
        rivalState.line = playerState.line;
            
        lastChallenge = currentDialog.title;
        cursorPointer.updatePos();
        rivalPointer.updatePos();
    }

    function updateMusic() {
        music.speed = musicRate;
    }
    function updateDialogErrors() {
        renderedText = fixedText
            .split("")
            .map((char, index) => {
                if (errorCharsIndexes.includes(index)) {
                    if (char === "\n") return `${errorCharsReplaces[index]}\n`;
                    return errorCharsReplaces[index];
                } else {
                    return char;
                }
            })
            .join("")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]");

        textboxText.text = renderedText;
    }

    function nextChar(rival = false) {
        const player = rival ? rivalState : playerState;
        if (!player.cursorPointer) return;

        player.cursorPos++;
        player.curCharInLine++;
        player.cursorPointer.pos = cursorPos(rival);
        logGroupWithColor(fixedText);
    }

    function prevChar(rival = false) {
        const player = rival ? rivalState : playerState;
        if (!player.cursorPointer) return;

        player.cursorPos--;
        player.curCharInLine--;
        player.cursorPointer.pos = cursorPos(rival);
        logGroupWithColor(fixedText);
    }

    function preventError() {
        k.shake(2);
        if (!settings.mute) {
            k.play("wrong_typing");
        }
    }

    function nextLine(isRival = false) {
        const player = isRival ? rivalState : playerState;
        if (!player.cursorPointer) return;
        player.curLineCount++;
        if (JUMP_AFTER == 1) {
            jumpCount++;
        }
        else if (playerState.curLineCount >= JUMP_AFTER * (jumpCount + 1)) {
            jumpCount++;
        }
        if (!isRival) {
            totalCorrectlines++;
        }
        const line = fixedText.split("\n")[player.curLineCount];
        if (!line) return;
        const lineIdent = line.match(/^\s+/)?.[0].length || 0;

        player.line = line;
        player.cursorPos += lineIdent;
        player.curIdentSize = lineIdent;
        player.curCharInLine = lineIdent;

        textboxText.updatePos();
        player.cursorPointer.pos = cursorPos(isRival);
        cursorPointer.updatePos();
        rivalPointer.updatePos();
    }

    function rivalWrite() {
        const curChar = fixedText[rivalState.cursorPos];

        if (curChar === "\n") {
            nextChar(true);
            nextLine(true);
        } else {
            nextChar(true);
        }
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function analitycs_calculate() {
        time_text.text = startTime.toFixed(1);
        if (startTime > 0 && totalCorrectChars > 5) {
            actual_wpm = (totalCorrectChars && startTime > 1) ? (totalCorrectChars / 5) / (startTime / 60) : 0;
            actual_lpm = (totalCorrectlines && startTime > 1) ? (totalCorrectlines) / (startTime / 60) : 0;
            actual_acc = totalTypedCharacters > 0 ? (totalCorrectChars / totalTypedCharacters) * 100 : 100;

            if (isNaN(actual_acc)) {
                actual_acc = 100;
            }

            wmp_text.text = Math.round(actual_wpm || 0).toString();
        }

    }

    const BUFFER_SIZE = 60;
    let eventBuffer = new Array(BUFFER_SIZE).fill(0);
    let lastSecond = Math.floor(k.time());

    function addCorrectEvent() {
        let currentSec = Math.floor(k.time());
        if (currentSec !== lastSecond) {
            for (let sec = lastSecond + 1; sec <= currentSec; sec++) {
                let index = sec % BUFFER_SIZE;
                eventBuffer[index] = 0;
            }
            lastSecond = currentSec;
        }
        let idx = currentSec % BUFFER_SIZE;
        eventBuffer[idx]++;
    }

    k.onKeyPress((keyPressed) => {
        const curChar = fixedText[playerState.cursorPos];
        const prevChar = playerState.cursorPos > 0 ? fixedText[playerState.cursorPos] : '';

        if (prevChar === "\n") return;

        const correctChar = fixedText[playerState.cursorPos];
        const shifting = k.isKeyDown("shift");
        let key = keyPressed;
        let errorKey = key;
        let isCorrect = false;

        if (key === "backspace" || key === "enter" || key === "shift") return;

        if (key.length === 1) {
            key = shifting ? key.toUpperCase() : key;
        } else if (key === "space") {
            key = " ";
            errorKey = "_";
        } else {
            return;
        }
        totalTypedCharacters++;
        isCorrect = key === correctChar;

        if (isCorrect) {
            if (!settings.mute) k.play("code_sound");
            totalCorrectChars++;
            addCorrectEvent();
            nextChar();
        } else {
            if (errorCharsIndexes.length > maxMistakes) return preventError();

            errorCharsIndexes.push(playerState.cursorPos);
            errorCharsReplaces[playerState.cursorPos] = errorKey;
            updateDialogErrors();
            nextChar();
            if (!settings.mute) k.play("wrong_typing");
            totalIcorrectCorrectChars++;
        }
    });
    // Line jump
    k.onKeyPress("enter", () => {
        const correctChar = fixedText[playerState.cursorPos];
        const isCorrect = "\n" === correctChar;

        if (errorCharsIndexes.length > 0 || !isCorrect) {
            return preventError();
        }

        if (playerState.curLineCount >= curBlockData.lineCount - 1) {
            return updateDialog();
        }

        nextChar();
        nextLine();
    });

    k.onKeyPressRepeat("backspace", () => {
        if (playerState.cursorPos <= 0) return; // prevent negative index

        if (
            playerState.curCharInLine === playerState.curIdentSize &&
            playerState.curLineCount > 0
        ) {
            return k.shake(2);
        } else {
            prevChar();
        }

        if (errorCharsIndexes.includes(playerState.cursorPos)) {
            errorCharsIndexes = errorCharsIndexes.filter(
                (index) => index !== playerState.cursorPos,
            );
        }

        updateDialogErrors();
    });

    k.onResize(() => {
        for (const obj of gameState.resizableObjects) {
            if (obj.is("resizablePos")) obj.updatePos();
            if (obj.is("resizableRect")) obj.updateRectSize();
        }
    });

    updateDialog();
};

k.scene("game", gameScene);