// @ts-check
import "../types.js";
import {
    gameState,
    dialogsData,
    lineHeight,
    MAX_TIME,
    EASY_RIVAL_SPEED,
    HARD_RIVAL_SPEED,
    JUMP_AFTER,
    TEXT_START_Y,
    SPACING,
    MAX_BLOCKS,
    goalBlocks,
    maxMistakes,
    ICON_START_Y
} from "../constants.js";
import {
    preventError,
    shuffle,
    makeBlink
} from "../data/utilities.js";

import { k, loadGtag, onBlockReached, onGameStart, MEASUREMENT_ID } from "../kaplay.js";
import { themes } from "../data/themes.js";
import { resizablePos } from "../components/resizablePos.js";
import { resizableRect } from "../components/resizableRect.js";
import { settings } from "./selectionScene.js";

let COLOR_TEXT_DEFAULT = k.Color.fromHex("#6a717d");
let COLOR_TEXT_RIVAL = k.YELLOW;
let COLOR_TEXT_INCORRECT = k.Color.RED;
let completedBlocks = 0;
let fontSize = 18;
let fontWidth = 16.4;
let errorCharsIndexes = [];
let errorCharsReplaces = {};
let playerStartedTyping = false;

export let actual_wpm = 0;
export let actual_lpm = 0;
export let actual_acc = 0;
export let actual_awpm = 0;
export let totalCorrectChars = 0;
export let totalIcorrectCorrectChars = 0;
export let totalTypedCharacters = 0;
export let totalCorrectlines = 0;
export let startTime = 0;
export let goal_wpm = actual_wpm;
export let goal_awpm = actual_awpm;
export let goal_lpm = actual_lpm;
export let goal_acc = actual_acc;
export let goal_time = startTime;
export let goalCompletedBlocks = completedBlocks;
export let lastChallenge = "";
export let blockNamesString = [];

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
let cachedTokens = [];
/**
 * @param {GameParams} params
 */

const gameScene = (params) => {

    loadGtag(MEASUREMENT_ID, () => {
        onGameStart();
    });

    k.loadMusic("endgame", "/sounds/endgame.mp3");
    k.loadSprite("arrow_yellow", "/sprites/arrow_yellow.png");

    let jumpCount = 0;
    let theme = themes[0];
    let currentBlockIndex = -1;
    let rivalSpeed = settings.rivalSpeed;
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

    const filteredDialogs = dialogsData.filter(
        item => (item.language || "default") === settings.language
    );
    const shuffledDialogs = shuffle([...filteredDialogs]);

    //save for analiytics
    blockNamesString = shuffledDialogs.slice(0, MAX_BLOCKS).map(item => item.title);
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
    const matchColorToken = (i, ch) => {
        const { tokens: T, associations: A } = theme;
        const { cursorPos: pPos } = playerState;
        const { cursorPos: rPos } = rivalState;

        if (errorCharsIndexes.includes(i)) return COLOR_TEXT_INCORRECT;
        if (!settings.practiceMode && (i === rPos || (i > pPos - 1 && i < rPos + 1)))
            return COLOR_TEXT_RIVAL;
        if (ch === " " || i > pPos - 1) return COLOR_TEXT_DEFAULT;

        const singleCharRules = [
            { test: () => A.brackets.test(ch), color: T.brackets },
            { test: () => A.operators.test(ch), color: T.operators },
            { test: () => A.punctuation.test(ch), color: T.punctuation },
            { test: () => ch === '"' || ch === "'", color: T.strings },
        ];
        for (const { test, color } of singleCharRules) {
            if (test()) return k.Color.fromHex(color);
        }

        let token = "";
        for (const t of cachedTokens) {
            if (i >= t.start && i < t.end) {
                token = t.text;
                break;
            }
        }

        const tokenRules = [
            { test: t => A.tags.test(t), color: T.tags },
            { test: t => A.numbers.test(t), color: T.numbers },
            { test: t => A.classes.test(t), color: T.classes },
            { test: t => A.functions.test(t), color: T.functions },
            { test: t => A.keywords.test(t), color: T.keywords },
            { test: t => A.strings.test(t), color: T.strings },
            { test: t => /^[A-Za-z_$][\w$]*$/.test(t), color: T.variables },
        ];
        for (const { test, color } of tokenRules) {
            if (test(token)) return k.Color.fromHex(color);
        }
        return k.Color.fromHex(T.text);
    };

    let rivalTimer = 0;

    k.onUpdate(() => {
        analitycs_calculate();
        if (!playerStartedTyping) {
            updateAWPM();
            return;
        }
        startTime += k.dt();
        if (!settings.practiceMode) {
            rivalTimer += k.dt();
            if (rivalTimer < rivalSpeed) {
                updateAWPM();
                return;
            }
            rivalTimer %= rivalSpeed;
            if (rivalState.curLineCount < curBlockData.lineCount - 1) {
                rivalWrite();
            } else {
                music.stop();
                StatsforAnalitics();
                resetGameStats();
                onBlockReached(completedBlocks, lastChallenge);
                k.go("endgame");
                return;
            }
        }
        updateAWPM();
    });

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
    function updateAWPM() {
        const totalEventsLast60 = eventBuffer.reduce((sum, count) => sum + count, 0);
        actual_awpm = totalEventsLast60 / 5;
    }

    function escapeForRender(str) {

        return str
            .replace(/\\/g, "\\\\")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/\{/g, "\\{")
            .replace(/\}/g, "\\}")
            .replace(/'/g, "\\'");
    }

    function prepareTokenCache(text) {
        const tokenPattern = /[\w$]+|[^\s\w]/g;
        cachedTokens = [];
        for (const m of text.matchAll(tokenPattern)) {
            cachedTokens.push({
                text: m[0],
                start: m.index,
                end: m.index + m[0].length,
            });
        }
    }
    function StatsforAnalitics() {
        goal_wpm = actual_wpm;
        goal_awpm = actual_awpm;
        goal_lpm = actual_lpm;
        goal_acc = actual_acc;
        goal_time = startTime;
        goalCompletedBlocks = completedBlocks;
    }

    function resetGameStats() {
        errorCharsIndexes.length = 0;
        Object.keys(errorCharsReplaces).forEach(k => delete errorCharsReplaces[k]);
        playerStartedTyping = false;
        completedBlocks = 0;
        startTime = 0;
        actual_wpm = 0;
        actual_awpm = 0;
        actual_lpm = 0;
        actual_acc = 0;
        totalCorrectChars = 0;
        totalIcorrectCorrectChars = 0;
        totalTypedCharacters = 0;
        totalCorrectlines = 0;
        rivalSpeed = EASY_RIVAL_SPEED;
        currentBlockIndex = -1;
        window.removeEventListener("keydown", keydownHandler);
    }
    function updateTitleTexts() {
        const titleTexts = k.get("menuItem");
        for (let i = 0; i < titleTexts.length; i++) {
            const textObj = titleTexts[i];
            if (shuffledDialogs[currentBlockIndex + i]) {
                textObj.text = shuffledDialogs[currentBlockIndex + i].title;
                textObj.color = (currentBlockIndex + i) <= currentBlockIndex ? k.rgb(127, 134, 131) : k.WHITE;

            } else {
                textObj.text = "";
            }
        }
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
        k.anchor("left"),
        k.pos(k.width() * 0.25 + 90, k.height() * 0.025),
        k.text("0", {
            size: 18,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);
    const time_text = k.add([
        k.anchor("left"),
        k.pos(k.width() * 0.35 + 90, k.height() * 0.025),
        k.text("time: ", { size: 18 }),
        k.color(k.YELLOW),
        k.z(22),
        k.opacity(settings.practiceMode ? 0 : 1),
    ]);

    k.add([
        k.sprite("BG_WPM_IN_GAME"),
        k.pos(k.width() * 0.25, k.height() * 0.02 + 5),
        k.anchor("left"),
        k.z(20),
    ]);
    k.add([
        k.sprite("BG_TIME_IN_GAME"),
        k.pos(k.width() * 0.35, k.height() * 0.02 + 5),
        k.anchor("left"),
        k.z(20),
        k.opacity(settings.practiceMode ? 0 : 1),
    ]);
    k.add([
        resizablePos(filesFoldersPos),
        k.sprite("bg2"),
        k.anchor("topleft"),
        k.opacity(1),
    ]);
    k.add([
        k.pos(k.width() * 0.01 + 10, k.height() * 0.01 - 10),
        k.sprite("SilverDevs"),
        k.anchor("topleft"),
        k.opacity(1),
        k.z(51),
    ]);
    const textboxBack = k.add([
        k.rect(2000, 54, { radius: 0 }),
        k.pos(1000, 0),
        k.color(k.rgb(7, 7, 7)),
        k.outline(2),
        k.anchor("top"),
        k.z(10),
    ]);
    const text_challenge = k.add([
        k.text("Challenges", { size: 20 }),
        resizablePos(() => k.vec2(k.width() * 0.05, k.height() * 0.1)),
        k.color(k.WHITE),
        k.opacity(1),
    ]);
    const rest_text = k.add([
        k.text("ESC to retry", { size: 20 }),
        resizablePos(() => k.vec2(k.width() * 0.1 + 20, k.height() * 0.94)),
        k.anchor("center"),
        k.color(k.rgb(127, 134, 131)),
        k.animate(),
        k.z(19),
    ]);
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

    const languageIconMap = {
        javascript: "icon_02",
        ts: "icon_01",
        golang: "icon_03",
        react: "icon_04",
        python: "icon_05",
        default: "icon_02",
    };

    const texts = dialogsData
        .filter(item => (item.language || "default") === settings.language)
        .map(item => ({
            title: item.title,
            language: item.language || "default",
        }));

    const visibleTexts = texts.slice(0, MAX_BLOCKS);

    visibleTexts.forEach(({ title, language }, index) => {
        const spriteKey = languageIconMap[language] ?? languageIconMap.default;

        k.add([
            k.sprite(spriteKey),
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
            k.text(title, { size: 20 }),
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
        k.go("game");
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
            return k.vec2(450, 0);
        }

        return k.vec2(k.width() * 0.3, 0);
    };

    const textPadding = k.vec2(50, 103);

    k.setVolume(0.5);

    const textbox = k.add([
        k.rect(1920, 1080, { radius: 8 }),
        k.color(k.rgb(53, 53, 71)),
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
            lineSpacing: 12,
            letterSpacing: 2,
            transform: (idx, ch) => ({
                color: matchColorToken(idx, ch),
            }),
        }),
        k.pos(0, 0),
        resizablePos(textboxTextPos),
    ]);

    const lineSpacing = 12;
    const actualLineHeight = fontSize + lineSpacing;
    const cursorVerticalOffset = (actualLineHeight - fontSize) / 2;
    const CURSOR_EXTRA_OFFSET = 10;

    const cursorPos = (rival = false) => {
        const player = rival ? rivalState : playerState;
        const displayLine = player.curLineCount - jumpCount * JUMP_AFTER;
        const x = player.curCharInLine * fontWidth;
        const y = displayLine * actualLineHeight
            + cursorVerticalOffset
            + CURSOR_EXTRA_OFFSET;
        return textboxBackParent.pos
            .add(textboxText.pos)
            .add(x, y);
    };

    const cursorPointer = k.add([
        k.text("_", { size: 16 }),
        resizablePos(() => cursorPos()),
        k.opacity(1),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.z(10),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 16 }),
        resizablePos(() => cursorPos(true)),
        k.opacity(settings.practiceMode ? 0 : 1),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

    makeBlink(k, cursorPointer);

    if (!settings.practiceMode) {
        makeBlink(k, rivalPointer);
    }

    playerState.cursorPointer = cursorPointer;
    rivalState.cursorPointer = rivalPointer;

    function getCurrentDialog() {
        if (shuffledDialogs[currentBlockIndex]) {
            return shuffledDialogs[currentBlockIndex];
        } else {
            console.error("No dialogs found for the selected language");
            return shuffledDialogs[0];
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
        if (currentBlockIndex > 0) {
            completedBlocks++;
        }
        musicRate += 0.05;
        updateMusic();
        if (completedBlocks === goalBlocks) {
            completedBlocks = goalBlocks;
            StatsforAnalitics();
            resetGameStats();
            music.stop();
            k.go("endgame");
            return;
        }
        const startSpeed = EASY_RIVAL_SPEED;
        const endSpeed = HARD_RIVAL_SPEED;
        const steps = 4;

        if (completedBlocks > 0) {

            const t = Math.min(completedBlocks, steps) / steps;
            rivalSpeed = startSpeed * Math.pow(endSpeed / startSpeed, t);
        } else {
            rivalSpeed = startSpeed;
        }
        playerState.reset();
        rivalState.reset();
        arrow.pos = k.vec2(arrow.pos.x, arrow_ypos);

        if (currentIndex < Math.min(texts.length, MAX_BLOCKS) - 1) {
            currentIndex++;
            moveArrow();
        }

        gameState.timeLeft = MAX_TIME;
        jumpCount = 0;
        textboxText.updatePos();

        const currentDialog = getCurrentDialog();
        const lang = currentDialog.language ?? "default";
        theme = themes.find(t => t.name === lang) || themes[0];
        const currentBlocks = currentDialog.blocks;
        curBlockData.lineCount = currentBlocks.length;
        originalText = currentBlocks.join("");

        prepareTokenCache(originalText);

        const fixedGroup = escapeForRender(originalText);
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
        renderedText = escapeForRender(renderedText);
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

    const keydownHandler = (event) => {

        const keyPressed = event.key;
        const prevChar = playerState.cursorPos > 0 ? fixedText[playerState.cursorPos] : '';
        if (prevChar === "\n") return;

        const correctChar = fixedText[playerState.cursorPos];

        let key = keyPressed;
        let errorKey;
        let isCorrect = false;

        if (key === "Backspace" || key === "Enter" || key === "Shift") return;

        if (errorCharsIndexes.length > maxMistakes) {
            event.preventDefault();
            return preventError(k, settings);
        }

        if (key === " ") {
            key = " ";
            errorKey = "_";
        } else if (key.length === 1) {
            errorKey = key;
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
            if (errorCharsIndexes.length > maxMistakes) return preventError(k, settings);

            errorCharsIndexes.push(playerState.cursorPos);
            errorCharsReplaces[playerState.cursorPos] = errorKey;
            updateDialogErrors();
            nextChar();
            k.shake(2);
            if (!settings.mute) k.play("wrong_typing");
            totalIcorrectCorrectChars++;
        }

        if (!playerStartedTyping && (totalCorrectChars > 0 || totalIcorrectCorrectChars > 0)) {
            playerStartedTyping = true;
        }
    };
    window.addEventListener("keydown", keydownHandler);
    k.onDestroy(() => {
        window.removeEventListener("keydown", keydownHandler);
    });
    // Line jump
    k.onKeyPress("enter", () => {
        const correctChar = fixedText[playerState.cursorPos];
        const isCorrect = "\n" === correctChar;

        if (errorCharsIndexes.length > 0 || !isCorrect) {
            return preventError(k, settings);
        }

        if (playerState.curLineCount >= curBlockData.lineCount - 1) {
            return updateDialog();
        }
        // totalCorrectlines++;

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
    updateTitleTexts();
    moveArrow();
};

k.scene("game", gameScene);