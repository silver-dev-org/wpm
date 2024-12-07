// @ts-check

import {
    jsonData,
    lineHeight,
    marginvisiblebox,
    maxtime,
} from "../constants.js";
import { k } from "../kaplay.js";
import { themes } from "../data/themes.js";
import { resizableObjects, resizablePos } from "../components/resizablePos.js";

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
const theme = themes[0];
const themeTokens = theme.tokens;
const themeAssociations = theme.associations;

k.scene("game", () => {
    const speedX = 0.1;
    const speedY = 0.3;
    const maxLines = 20;
    let currentBlockIndex = 0;
    let currentGroupIndex = 0;
    // #region PLAYER variables
    let cursorPos = 0;
    let curLine = 0;
    let curIdentSize = 0;
    let txtCharacters = [];
    // #endregion
    // #region RIVAL variables
    let rivalCursorPos = 0;
    let curRivalLine = 0;
    let rivalTxtCharacters = [];
    // #endregion

    let offsetX = 0;
    let offsetY = 0;
    animateBackground();

    /**
     * @param {number} i
     */
    const matchColorToken = (i, ch) => {
        if (ch === " ") return COLOR_TEXT_DEFAULT;
        if (cursorPos - 1 < i) {
            if (rivalCursorPos + 1 > i) {
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
        offsetX += speedX;
        offsetY += speedY;
        document.body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

        requestAnimationFrame(animateBackground);
    }

    const textbox = k.add([
        k.rect(k.width() * 0.7, k.height() * 0.5),
        k.anchor("center"),
        k.pos(k.center().x, k.height() - k.height() * 0.5),
        k.color(23, 9, 39),
        k.opacity(0),
    ]);

    const textboxBackParent = k.add([
        k.rect(k.width() * 0.7, k.height() * 0.5),
        k.pos(0),
        k.anchor("center"),
        k.color(),
        k.rotate(0),
        k.scale(1),
        k.z(10),
        k.mask("intersect"),
        resizablePos(() => k.vec2(k.width() / 2, k.height() / 2).add(0, 4)),
    ]);

    const textboxBack = k.add([
        k.sprite("bg2"),
        k.pos(k.center()),
        k.anchor("center"),
        k.color(),
        k.rotate(0),
        k.opacity(0.7),
        k.scale(1),
    ]);

    const textboxBorder = k.add([
        k.sprite("bgpng"),
        k.pos(k.center()),
        k.anchor("center"),
        k.color(),
        k.rotate(0),
        k.scale(1),
    ]);

    const textboxText = textboxBackParent.add([
        k.text("", {
            size: fontSize,
            transform: (idx, ch) => ({
                color: matchColorToken(idx, ch),
            }),
        }),
        k.pos(-textbox.width / 4, -textbox.height / 2 + 10),
    ]);

    const timerLabel = k.add([
        k.text(String(timeLeft), {
            size: 48,
            font: "monogram",
        }),
        k.pos(k.width() * 0.8, k.height() * 0.25),
        k.anchor("topright"),
    ]);

    const cursorPointer = k.add([
        k.text("_", { size: 16 }),
        k.pos(textboxBackParent.pos.add(textboxText.pos).add(0, fontSize)),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.z(10),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 16 }),
        k.pos(textboxBackParent.pos.add(textboxText.pos).add(0, fontSize)),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

    textboxBackParent.onUpdate(() => {
        const scaleFactorX = k.width() / 1920;
        const scaleFactorY = k.height() / 1080;
        const scaleFactor = Math.min(scaleFactorX, scaleFactorY);

        textboxBack.scale = k.vec2(scaleFactor);
        textboxBack.pos = k.vec2(k.width() / 2, k.height() / 2);
        textboxBackParent.width = textboxBack.width * scaleFactor - 20;
        textboxBackParent.height = textboxBack.height * scaleFactor - 36;
    });

    textboxBorder.onUpdate(() => {
        const scaleFactorX = k.width() / 1920;
        const scaleFactorY = k.height() / 1080;
        const scaleFactor = Math.min(scaleFactorX, scaleFactorY);

        textboxBorder.scale = k.vec2(scaleFactor);
        textboxBorder.pos = k.vec2(k.width() / 2, k.height() / 2);
    });

    //    updateLineVisibility();

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

        const curChar = group[cursorPos];
        const groupFrom = group.substring(0, cursorPos);
        const groupTo = group.substring(cursorPos + 1);

        console.log(
            `%c${groupFrom}%c${curChar}%c${groupTo}`,
            "color: inherit;",
            "color: #f00;",
            "color: inherit;",
        );
    };

    function updateDialog() {
        completedBlocks++;
        currentGroupIndex = 0;
        cursorPos = 0;
        currentMistakes = 0;
        txtCharacters.forEach((char) => char.destroy());
        txtCharacters.length = 0;
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
    }

    function updateDialogErrors() {
        renderedText = fixedText
            .split("")
            .map((char, index) => {
                if (errorCharsIndexes.includes(index)) {
                    console.log(char, index);
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

    function prevChar(rival = false) {
        if (rival) {
            rivalCursorPos--;
            rivalPointer.pos = k.vec2(rivalPointer.pos).sub(fontWidth, 0);
            logGroupWithColor(fixedText);
        } else {
            cursorPos--;
            cursorPointer.pos = k.vec2(cursorPointer.pos).sub(fontWidth, 0);
            logGroupWithColor(fixedText);
        }
    }

    function nextChar(rival = false) {
        if (rival) {
            rivalCursorPos++;
            rivalPointer.pos = k.vec2(rivalPointer.pos).add(fontWidth, 0);
            logGroupWithColor(fixedText);

            if (fixedText[rivalCursorPos] === "\n") {
                nextLine(true);
            }
        } else {
            cursorPos++;
            cursorPointer.pos = k.vec2(cursorPointer.pos).add(fontWidth, 0);
            logGroupWithColor(fixedText);
        }
    }

    function nextLine(rival = false) {
        if (rival) {
            curRivalLine++;
            const line = fixedText.split("\n")[curRivalLine];
            const lineIdent = line.match(/^\s+/)?.[0].length || 0;
            rivalCursorPos += lineIdent;

            rivalPointer.pos = k.vec2(
                textboxBackParent.pos.add(textboxText.pos).x +
                    lineIdent * fontWidth,
                rivalPointer.pos.y + lineHeight,
            );
        } else {
            curLine++;
            const line = fixedText.split("\n")[curLine];
            const lineIdent = line.match(/^\s+/)?.[0].length || 0;
            cursorPos += lineIdent;
            curIdentSize = lineIdent;

            cursorPointer.pos = k.vec2(
                textboxBackParent.pos.add(textboxText.pos).x +
                    lineIdent * fontWidth,
                cursorPointer.pos.y + lineHeight,
            );
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

        k.loop(0.3, () => {
            nextChar(true);
        });
    }

    // function updateLineVisibility() {
    //     const textboxTop = textbox.pos.y - textbox.height / 2;
    //     const textboxBottom = textbox.pos.y + textbox.height / 2;
    //     const adjustedTextboxTop = textboxTop - marginvisiblebox;
    //     const adjustedTextboxBottom = textboxBottom + marginvisiblebox;

    //     for (let char of txtCharacters) {
    //         if (!char || !char.pos) {
    //             console.warn("Invalid character:", char);
    //             continue;
    //         }
    //         const isVisible =
    //             char.pos.y >= adjustedTextboxTop &&
    //             char.pos.y <= adjustedTextboxBottom;
    //         char.opacity = isVisible ? 1 : 0;
    //     }
    // }

    // function shiftLines(direction) {
    //     const shiftAmount = direction === "up" ? -lineHeight : lineHeight;
    //     for (let char of txtCharacters) {
    //         char.pos.y += shiftAmount;
    //         rivalPointer.pos = k.vec2(char.pos.x, char.pos.y * 1.02);
    //     }

    //     updateLineVisibility();
    // }

    k.onKeyPress((key) => {
        // only letters on this hanadler
        let isCorrect = false;
        let isNextLine = false;
        const correctChar = fixedText[cursorPos];

        if (errorCharsIndexes.length > 1) {
            return k.shake(5);
        }

        if(correctChar === "\n" && errorCharsIndexes.length > 0) {
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
            errorCharsIndexes.push(cursorPos);
            errorCharsReplaces[cursorPos] = key === "space" ? "_" : key;
            updateDialogErrors();
            nextChar();
        }
    });

    k.onKeyPressRepeat("backspace", () => {
        if (cursorPos <= 0) return; // prevent negative index

        prevChar();

        if (errorCharsIndexes.includes(cursorPos)) {
            errorCharsIndexes = errorCharsIndexes.filter(
                (index) => index !== cursorPos,
            );
        }

        updateDialogErrors();
    });

    k.onResize(() => {
        resizableObjects.forEach((obj) => obj.updatePos());
    });

    // window.addEventListener("keydown", (event) => {
    //     const key = event.key;

    //     if (key === "Backspace" && cursorPos > 0) {
    //         const currentChar = txtCharacters[cursorPos - 1];
    //         const nextChar =
    //             cursorPos < txtCharacters.length
    //                 ? txtCharacters[cursorPos]
    //                 : null;

    //         if (
    //             cursorPos === 1 &&
    //             tagPositions.hasOwnProperty(currentChar.originalChar)
    //         ) {
    //             cursorPos--;
    //             updateCursorPosition();
    //             return;
    //         }

    //         if (currentChar.text !== currentChar.originalChar) {
    //             currentChar.text = currentChar.originalChar;
    //         }

    //         if (currentChar.originalChar === "\n") {
    //             totalCorrectLines--;
    //             currentline--;
    //             if (currentline >= startmoveline - 1) {
    //                 shiftLines("down");
    //             }
    //         }

    //         if (currentChar.color.eq(COLOR_TEXT_INCORRECT)) {
    //             currentMistakes--;
    //         }

    //         if (nextChar && nextChar.color.eq(COLOR_TEXT_RIVAL)) {
    //             currentChar.color = COLOR_TEXT_RIVAL;
    //         } else {
    //             currentChar.color = currentChar.originalColor;
    //         }
    //         currentChar.isModified = false;
    //         cursorPos--;
    //         updateCursorPosition();
    //         applyTagColor();
    //         return;
    //     }

    //     if (currentMistakes >= maxMistakes) {
    //         return;
    //     }

    //     if (cursorPos < text.text.length) {
    //         const currentChar = txtCharacters[cursorPos];
    //         applyTagColor();

    //         if (isTag(currentChar.originalChar)) {
    //             cursorPos++;
    //             totalCorrectChars++;
    //             updateCursorPosition();
    //             return;
    //         }

    //         if (currentChar.originalChar === "\n") {
    //             if (key === "Enter" && currentMistakes == 0) {
    //                 currentChar.color = COLOR_TEXT_CORRECT;
    //                 totalCorrectChars++;
    //                 totalCorrectLines++;
    //                 cursorPos++;
    //                 currentline++;
    //                 updateCursorPosition();

    //                 if (currentline >= startmoveline) {
    //                     shiftLines("up");
    //                 }
    //                 updateCursorPosition();

    //                 if (cursorPos >= txtCharacters.length) {
    //                     const noInvalidColors = txtCharacters.every(
    //                         (char) =>
    //                             !char.color.eq(COLOR_TEXT_INCORRECT) &&
    //                             !char.color.eq(COLOR_TEXT_RIVAL) &&
    //                             !char.color.eq(COLOR_TEXT_DEFAULT),
    //                     );
    //                     if (noInvalidColors) {
    //                         currentGroupIndex++;
    //                         if (
    //                             currentGroupIndex >=
    //                             selectCurrentBlock().length / maxLines
    //                         ) {
    //                             if (completedBlocks >= goalBlocks) {
    //                                 k.go("endgame");
    //                                 return;
    //                             }
    //                             currentBlockIndex++;
    //                             if (
    //                                 currentBlockIndex >= jsonData.blocks.length
    //                             ) {
    //                                 currentBlockIndex = 0;
    //                             }
    //                             updateDialog();
    //                         } else {
    //                             updateDialog();
    //                         }
    //                     }
    //                 }
    //             }
    //             return;
    //         }

    //         if (key.length === 1 || key === " ") {
    //             const isCorrect = currentChar.text === key;

    //             if (isCorrect) {
    //                 currentChar.color = COLOR_TEXT_CORRECT;
    //                 totalCorrectChars++;
    //             } else {
    //                 currentChar.color = COLOR_TEXT_INCORRECT;
    //                 currentChar.text = key;

    //                 if (currentChar.text === " ") {
    //                     currentChar.text = "_";
    //                 }

    //                 totalIncorrectChars++;
    //                 currentMistakes++;

    //                 if (currentChar.originalChar === " ") {
    //                     currentChar.text = key;
    //                     spacePositions.push(cursorPos);
    //                 }
    //             }
    //             cursorPos++;
    //             updateCursorPosition();
    //         }
    //     }
    // });

    startTimer();
    updateDialog();
});
