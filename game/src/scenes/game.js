// @ts-check

import {
    data,
    jsonData,
    lineHeight,
    marginvisiblebox,
    maxtime,
} from "../constants.js";
import { k } from "../kaplay.js";
import { themes } from "../data/themes.js";
import { resizablePos } from "../components/resizablePos.js";
import { resizableRect } from "../components/resizableRect.js";
let COLOR_TEXT_DEFAULT = k.Color.fromHex("#553d4d");
let COLOR_TEXT_RIVAL = k.Color.fromHex("#718703");
let COLOR_TEXT_CORRECT = k.Color.WHITE;
let COLOR_TEXT_INCORRECT = k.Color.RED;
let completedBlocks = 0;
export let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let totalCorrectLines = 0;
let timeLeft = maxtime;
let currentMistakes = 0;
let fontSize = 24;
let fontWidth = 12;
let errorCharsIndexes = [];
let errorCharsReplaces = {};
// this is the text taken from the json file
let originalText = "";
// this is the rendered text
let renderedText = "";
// this is the text without any special character (for compare with user input)
let fixedText = "";

// allocating all resizable objects in one
const theme = themes[0];
const themeTokens = theme.tokens;
const themeAssociations = theme.associations;

k.scene("game", () => {
    const BG_SPEED_X = 0.1;
    const BG_SPEED_Y = 0.3;
    let currentBlockIndex = 0;

    // #region PLAYER  & RIVAL VARIABLES
    /**
     * @typedef {Object} PlayerState
     * @property {number} cursorPos
     * @property {string} line
     * @property {number} curLineCount
     * @property {number} curCharInLine
     * @property {number} curIdentSize
     * @property {import("kaplay").GameObj | null} cursorPointer
     */

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
    };

    // #endregion

    let offsetX = 0;
    let offsetY = 0;
    animateBackground();

    /**
     * @param {number} i
     */
    const matchColorToken = (i, ch) => {
        if (ch === " ") return COLOR_TEXT_DEFAULT;
        if (playerState.cursorPos - 1 < i) {
            if (rivalState.cursorPos + 1 > i) {
                return COLOR_TEXT_RIVAL;
            }
            return COLOR_TEXT_DEFAULT;
        }

        const words = originalText.split(" ");
        let wordCharsIndex = 0;
        const word =
            words.find((w) => {
                const found = w.length + wordCharsIndex >= i;
                wordCharsIndex += w.length + 1;
                return found;
            }) || "";

        if (errorCharsIndexes.includes(i)) {
            return COLOR_TEXT_INCORRECT;
        }

        if (ch.match(themeAssociations.brackets)) {
            return k.Color.fromHex(themeTokens.brackets);
        }

        if (word.match(themeAssociations.classes)) {
            return k.CYAN;
        } else if (word.match(themeAssociations.functions)) {
            return k.Color.fromHex(themeTokens.functions);
        } else if (word.match(themeAssociations.keywords)) {
            return k.Color.fromHex(themeTokens.keywords);
        } else {
            return new k.Color(255, 255, 255);
        }
    };

    function animateBackground() {
        offsetX += BG_SPEED_X;
        offsetY += BG_SPEED_Y;
        document.body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

        requestAnimationFrame(animateBackground);
    }

    // fondo
    const textboxSize = () => k.vec2(k.width() * 0.7, k.height());
    const textPadding = k.vec2(12, 12);

    const textbox = k.add([
        resizableRect(textboxSize),
        resizablePos(() => k.vec2(0 + textboxSize().x / 2, 0)),
        k.anchor("topleft"),
        k.color(23, 9, 39),
        k.opacity(0.5),
    ]);

    const textboxBackParent = k.add([
        resizableRect(textboxSize),
        resizablePos(() => k.vec2(0 + textboxSize().x / 2, 0)),
        k.anchor("topleft"),
        k.color(),
        k.rotate(0),
        k.scale(1),
        k.z(10),
        k.opacity(0),
    ]);

    const textboxText = textboxBackParent.add([
        k.text("", {
            size: fontSize,
            transform: (idx, ch) => ({
                color: matchColorToken(idx, ch),
            }),
        }),
        resizablePos(() => k.vec2(textPadding)),
    ]);

    const timerLabel = k.add([
        k.text(String(timeLeft), {
            size: 48,
            font: "monogram",
        }),
        resizablePos(() => k.vec2(k.width(), k.height())),
        k.anchor("botright"),
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
        k.text("_", { size: 16 }),
        resizablePos(() => cursorPos()),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.z(10),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 16 }),
        resizablePos(() => cursorPos(true)),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

    playerState.cursorPointer = cursorPointer;
    rivalState.cursorPointer = rivalPointer;

    function selectCurrentBlock() {
        if (jsonData.blocks && jsonData.blocks[currentBlockIndex]) {
            return jsonData.blocks[currentBlockIndex];
        } else {
            console.error("jsonData.blocks is undefined or out of range");
            return [];
        }
    }

    function getCurrentGroup() {
        const currentBlock = selectCurrentBlock();
        const visibleLines = Math.floor(textbox.height / lineHeight);

        return currentBlock.slice(0, visibleLines);
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
        completedBlocks++;
        playerState.cursorPos = 0;
        currentMistakes = 0;
        timeLeft = maxtime;

        // the sentences
        const currentGroup = getCurrentGroup();

        // we replace [] characters with \[ and \] to avoid them being interpreted as tags
        // also ▯ is replaced with a space

        originalText = currentGroup.join("");

        const fixedGroup = currentGroup
            .join("")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/▯/g, " ");

        fixedText = currentGroup.join("").replace(/▯/g, " ");
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
        player.cursorPointer.pos = cursorPos();
        logGroupWithColor(fixedText);
    }

    function nextLine(rival = false) {
        const player = rival ? rivalState : playerState;
        if (!player.cursorPointer) return;

        player.curLineCount++;

        const line = fixedText.split("\n")[player.curLineCount];
        if (!line) return;
        const lineIdent = line.match(/^\s+/)?.[0].length || 0;

        player.line = line;
        player.cursorPos += lineIdent;
        player.curIdentSize = lineIdent;
        player.curCharInLine = lineIdent;

        player.cursorPointer.pos = cursorPos(rival);
    }

    function rivalWrite() {
        const isFinalLine =
            rivalState.curLineCount === fixedText.split("\n").length - 1;
        const isFinalLineChar =
            rivalState.curCharInLine === rivalState.line.length;

        if (isFinalLineChar) {
            if (isFinalLine) {
                return k.go("endgame");
            }

            nextLine(true);
        } else {
            nextChar(true);
        }
    }

    function startTimer() {
        k.loop(1, () => {
            timeLeft--;
            timerLabel.text = String(timeLeft);
            if (timeLeft <= 0) {
                k.go("endgame");
            }
        });

        k.loop(0.2, () => {
            rivalWrite();
        });
    }

    k.onKeyPress((key) => {
        // only letters on this hanadler
        let isCorrect = false;
        let isNextLine = false;
        const correctChar = fixedText[playerState.cursorPos];

        if (errorCharsIndexes.length > 1) {
            return k.shake(5);
        }

        if (correctChar === "\n" && errorCharsIndexes.length > 0) {
            return k.shake(5);
        }

        if (key.length == 1) {
            if (k.isKeyDown("shift")) {
                key = key.toUpperCase();
                isCorrect = key === correctChar;
            } else {
                isCorrect = key === correctChar;
            }
        } else if (key === "space") {
            isCorrect = " " === correctChar;
        } else if (key === "enter") {
            isCorrect = correctChar === "\n";
            if (isCorrect) isNextLine = true;
        } else if (key.length > 1) {
            return;
        }

        if (isCorrect && isNextLine) {
            totalCorrectChars++;
            nextChar();
            nextLine();
        } else if (isCorrect) {
            totalCorrectChars++;
            nextChar();
        } else {
            errorCharsIndexes.push(playerState.cursorPos);
            errorCharsReplaces[playerState.cursorPos] =
                key === "space" ? "_" : key;
            updateDialogErrors();
            nextChar();
        }
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
        for (const obj of data.resizableObjects) {
            if (obj.is("resizablePos")) obj.updatePos();
            if (obj.is("resizableRect")) obj.updateRectSize();
        }
    });

    startTimer();
    updateDialog();
});
