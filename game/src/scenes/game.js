// @ts-check
import "../types.js";
import {
    gameState,
    dialogsData,
    lineHeight,
    MAX_TIME,
    EASY_RIVAL_SPEED,
    JUMP_AFTER,
} from "../constants.js";
import { k } from "../kaplay.js";
import { themes } from "../data/themes.js";
import { resizablePos } from "../components/resizablePos.js";
import { resizableRect } from "../components/resizableRect.js";

const titles = dialogsData.map((item) => item.title);

let COLOR_TEXT_DEFAULT = k.Color.fromHex("#544c4c");
let COLOR_TEXT_RIVAL = k.Color.fromHex("#bebf7a");
let COLOR_TEXT_INCORRECT = k.Color.RED;

let barTimeValue = 60;
let completedBlocks = 0;
export let userName = "";
export let totalCorrectChars = 0;
export let totalIcorrectCorrectChars = 0;
export let totalTypedCharacters = 0;
export let totalCorrectlines = 0;
let fontSize = 24;
let fontWidth = 12;
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
    const BG_SPEED_X = 0.1;
    const BG_SPEED_Y = 0.3;
    const userName = params.userName;
    let jumpCount = 0;
    let theme = themes[0];
    let offsetX = 0;
    let offsetY = 0;
    let currentBlockIndex = -1;
    let rivalSpeed = params.rivalSpeed ?? EASY_RIVAL_SPEED;
    let curBlockData = {
        lineCount: 0,
    };

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

    animateBackground();

    /**
     * @param {number} i
     */
    const matchColorToken = (i, ch) => {
        const themeTokens = theme.tokens;
        const themeAssociations = theme.associations;

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
            return charColor.darken(80);
        }

        return charColor;
    };

    function animateBackground() {
        offsetX += BG_SPEED_X;
        offsetY += BG_SPEED_Y;
        document.body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

        requestAnimationFrame(animateBackground);
    }

    // background
    // Files & Folders
    const filesFoldersSize = () => {
        if (k.width() > 1080) {
            return k.vec2(323, k.height());
        } else {
            return k.vec2(k.width() * 0.3, k.height());
        }
    };
    const filesFoldersPos = () => k.vec2(0, 0);

    k.add([
        //resizableRect(filesFoldersSize),
        resizablePos(filesFoldersPos),
        k.sprite("bg"),
        k.anchor("topleft"),
        //k.color(k.RED),
        k.opacity(1),
    ]);

    k.add([
        k.sprite("icon_01"),
        resizablePos(() => k.vec2(k.width() * 0.01, k.height() * 0.04)),
        k.opacity(1),
    ]);
    k.add([
        k.sprite("icon_02"),
        resizablePos(() => k.vec2(k.width() * 0.02, k.height() * 0.2)),
        k.opacity(1),
    ]);
    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.3)),
        k.opacity(1),
    ]);
    k.add([
        k.text("isUnique", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.32)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);
    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.4)),
        k.opacity(1),
    ]);
    k.add([
        k.text("removeDups", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.42)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);
    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.5)),
        k.opacity(1),
    ]);

    k.add([
        k.text("routeBetweenNodes", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.52)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);

    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.6)),
        k.opacity(1),
    ]);

    k.add([
        k.text("insertion", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.62)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);
    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.7)),
        k.opacity(1),
    ]);

    k.add([
        k.text("getPermutations", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.72)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);
    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.8)),
        k.opacity(1),
    ]);

    k.add([
        k.text("sortedMerge", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.82)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);
    k.add([
        k.sprite("icon_03"),
        resizablePos(() => k.vec2(k.width() * 0.001, k.height() * 0.9)),
        k.opacity(1),
    ]);

    k.add([
        k.text("rotateMatrix", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.04, k.height() * 0.92)),
        k.color(k.YELLOW),
        k.opacity(1),
        k.outline(4),
    ]);

    const textboxSize = () => k.vec2(k.width(), k.height());
    const textboxPos = () => {
        if (k.width() > 1080) {
            return k.vec2(323, 0);
        }

        return k.vec2(k.width() * 0.3, 0);
    };
    const textPadding = k.vec2(48, 48);

    k.volume(0.5);
    //  const music = k.play("WPM_OP1", {
    //    loop: true,
    //   paused: false,
    // });
  
    const textbox = k.add([
        // resizableRect(textboxSize),
        resizablePos(textboxPos),
        k.sprite("bg2"),
        k.anchor("topleft"),
        // k.color(23, 9, 39),
        k.opacity(1),
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
        return k.vec2(textPadding).sub(0, lineHeight * jumpCount);
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

    // const timerLabel = k.add([
    //     k.text(String(gameState.timeLeft), {
    //       size: 48,
    //      font: "monogram",
    //  }),
    // resizablePos(() => k.vec2(k.width(), k.height())),

    //   k.pos(k.width() * 0.01, k.height() * 0.02),
    //  k.anchor("botleft"),
    // ]);

    const timeprogressBar = k.add([
        k.rect(150, 20),
        k.anchor("topleft"),
        resizablePos(() => k.vec2(k.width() * 0.05, k.height() * 0.08)),
        k.color(k.YELLOW),
        k.anchor("left"),
        k.outline(2),
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
        k.text("_", { size: 24 }),
        resizablePos(() => cursorPos()),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.z(10),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 24 }),
        resizablePos(() => cursorPos(true)),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

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
        gameState.timeLeft = MAX_TIME;

        currentBlockIndex++;
        completedBlocks++;
        playerState.reset();
        rivalState.reset();

        gameState.timeLeft = MAX_TIME;
        jumpCount = 0;
        textboxText.updatePos();
        const currentDialog = getCurrentDialog();

        // theme
        theme = themes[0];

        // the sentences
        const currentBlocks = currentDialog.blocks;
        curBlockData.lineCount = currentBlocks.length;

        // we replace [] characters with \[ and \] to avoid them being interpreted as tags
        // also ▯ is replaced with a space
        originalText = currentBlocks.join("");

        const fixedGroup = currentBlocks
            .join("")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/▯/g, " ");

        fixedText = currentBlocks.join("").replace(/▯/g, " ");
        renderedText = fixedGroup;
        textboxText.text = renderedText;
        playerState.line = fixedText.split("\n")[0];
        rivalState.line = fixedText.split("\n")[0];
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

    function updateProgressBar() {
        const targetWidth = (gameState.timeLeft / MAX_TIME) * 100;
        barTimeValue = k.lerp(barTimeValue, targetWidth, 0.2);
        timeprogressBar.width = barTimeValue;
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
        k.shake(5);
    }

    function nextLine(isRival = false) {
        const player = isRival ? rivalState : playerState;
        if (!player.cursorPointer) return;

        player.curLineCount++;

        // line movement (jump)
        if (player.curLineCount / JUMP_AFTER > jumpCount) {
            jumpCount++;
            textboxText.updatePos();
        }

        const line = fixedText.split("\n")[player.curLineCount];
        if (!line) return;
        const lineIdent = line.match(/^\s+/)?.[0].length || 0;

        player.line = line;
        player.cursorPos += lineIdent;
        player.curIdentSize = lineIdent;
        player.curCharInLine = lineIdent;

        player.cursorPointer.pos = cursorPos(isRival);
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

    function startTimer() {
        k.loop(1, () => {
            gameState.timeLeft--;
            updateProgressBar();
            //console.log(gameState.timeLeft);
            //  timerLabel.text = String(gameState.timeLeft);
            if (gameState.timeLeft <= 0) {
                k.go("endgame");
            }
        });

        k.loop(rivalSpeed, () => {
            rivalWrite();
        });
    }

    k.onKeyPress((keyPressed) => {
        totalTypedCharacters++;
        k.play("code_sound", {
            volume: 1,
            speed: 1,
        });
        const correctChar = fixedText[playerState.cursorPos];
        const shifting = k.isKeyDown("shift");
        let key = keyPressed;
        let errorKey = key;
        let isCorrect = false;

        if (key == "enter" || key == "backspace") {
            return;
        }

        if (errorCharsIndexes.length > 1) {
            return preventError();
        }

        // Setting key
        if (key.length == 1) {
            key = shifting ? key.toUpperCase() : key;
        } else if (key == "space") {
            key = " ";
            errorKey = "_";
        } else {
            return;
        }

        isCorrect = key === correctChar;

        if (isCorrect) {
            totalCorrectChars++;
           // gameState.timeLeft += 0.2;
            nextChar();
        } else {
            k.play("wrong_typing", {
                volume: 1,
                speed: 1,
            });
            errorCharsIndexes.push(playerState.cursorPos);
            errorCharsReplaces[playerState.cursorPos] = errorKey;
            updateDialogErrors();
            nextChar();
            gameState.timeLeft -= 0.5;
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

        totalCorrectlines++;
        nextChar();
        nextLine();
    });

    k.onKeyPressRepeat("backspace", () => {
        if (playerState.cursorPos <= 0) return; // prevent negative index

        if (
            playerState.curCharInLine === playerState.curIdentSize &&
            playerState.curLineCount > 0
        ) {
            return k.shake(5);
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

    startTimer();
    updateDialog();
};

k.scene("game", gameScene);


