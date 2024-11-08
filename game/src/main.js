import kaplay from "kaplay";
import "kaplay/global";
import dialogs from "./dialog.json";

kaplay({
    background: [10, 10, 27, 0],
});

loadFont("monogram", "/public/fonts/monogram.ttf");

function getCSSColor(colorReturn) {
    return getComputedStyle(document.documentElement).getPropertyValue(colorReturn).trim();
}

const COLOR_TEXT_DEFAULT = Color.fromHex(getCSSColor('--color-text-default'));
const COLOR_TEXT_RIVAL = Color.fromHex(getCSSColor('--color-text-rival'));
const COLOR_TEXT_CORRECT = Color.fromHex(getCSSColor('--color-text-correct'));
const COLOR_TEXT_INCORRECT = Color.fromHex(getCSSColor('--color-text-incorrect'));
const COLOR_TIMER = Color.fromHex(getCSSColor('--color-timer'));

const goalBlocks = 2;
let completedBlocks = 0;
let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let totalCorrectLines = 0;
let accumulatedCorrectChars = 0;
let accumulatedIncorrectChars = 0;
let accumulatedCorrectLines = 0;
let accumulatedMissingChars = 0;
let timeLeft = 160;
const maxMistakes = 2;
let currentMistakes = 0;
let font_size = 32;
const jsonData = dialogs;

scene("game", () => {
    let currentBlockIndex = 0;
    let currentGroupIndex = 0;
    const maxLines = 16;
    let txtCharacters = [];
    let cursorPos = 0;

    const timerLabel = add([
        text(`[yellow]${timeLeft}[/yellow]`, {
            size: 32,
            font: "monogram",
            styles: {
                "yellow": { color: COLOR_TIMER },
            },
        }),
        pos(center().x - 40, height() / 2 - 250),
        anchor("top"),
    ]);

    const cursorPointer = add([
        text("_", { size: 32, color: COLOR_TEXT_INCORRECT }),
        pos(0, 0),
        anchor("left"),
    ]);

    function selectCurrentBlock() {
        return jsonData.blocks[currentBlockIndex];
    }

    function getCurrentGroup() {
        const currentBlock = selectCurrentBlock();
        const startIndex = currentGroupIndex * maxLines;
        return currentBlock.slice(startIndex, startIndex + maxLines);
    }

    function applyRivalColor() {
        let rivalIndex = 0;
        loop(0.3, () => {
            if (rivalIndex < txtCharacters.length) {
                const char = txtCharacters[rivalIndex];
                if (char.color.eq(COLOR_TEXT_DEFAULT)) {
                    char.color = COLOR_TEXT_RIVAL;
                }
                rivalIndex++;
            }
        });
    }

    function updateDialog() {
        const currentGroup = getCurrentGroup();
        if (currentGroup.length === 0) {
            accumulatedCorrectChars = totalCorrectChars;
            accumulatedIncorrectChars = totalIncorrectChars;
            accumulatedCorrectLines = totalCorrectLines;
            currentGroupIndex = 0;
            completedBlocks++;

            const expectedChars = selectCurrentBlock().join('').length;
            const totalCharsTyped = totalCorrectChars + totalIncorrectChars;
            accumulatedMissingChars += Math.max(0, expectedChars - totalCharsTyped);

            if (completedBlocks >= goalBlocks) {
                go("endgame");
                return;
            }

            currentBlockIndex++;
            if (currentBlockIndex >= jsonData.blocks.length) {
                currentBlockIndex = 0;
            }
            updateDialog();
            return;
        }

        txtCharacters.forEach(character => character.destroy());
        txtCharacters.length = 0;
        cursorPos = 0;
        currentMistakes = 0;
        const lineHeight = 30;
        const charSpacing = 17;
        let intialposX = 250;
        let verticalOffset = height() / 2 - (lineHeight * currentGroup.length) / 2;

        for (let line of currentGroup) {
            let i = 0;
            while (i < line.length) {

                if (line.startsWith("/EMPTY", i)) {
                    i += 6;
                    continue;
                }

                const char = line[i];
                const charText = add([
                    text(char === "\n" ? " " : char, { size: font_size, font: "monogram" }),
                    pos(intialposX + (i * charSpacing), verticalOffset),
                    anchor("left"),
                    color(COLOR_TEXT_DEFAULT),
                    { originalChar: char, originalColor: COLOR_TEXT_DEFAULT, isModified: false },
                ]);

                txtCharacters.push(charText);
                i++;
            }
            verticalOffset += lineHeight;
        }

        updateCursorPosition();
        applyRivalColor();
    }


    function updateCursorPosition() {
        if (cursorPos < txtCharacters.length) {
            const currentChar = txtCharacters[cursorPos];
            cursorPointer.pos = vec2(currentChar.pos.x, currentChar.pos.y);
        }
    }

    function startTimer() {
        loop(1, () => {
            timeLeft--;
            timerLabel.text = `[yellow]${timeLeft}[/yellow]`;

            if (timeLeft <= 0) {
                timerLabel.text = "[yellow]0[/yellow]";

                const expectedChars = selectCurrentBlock().join('').length;
                const totalCharsTyped = totalCorrectChars + totalIncorrectChars;
                accumulatedMissingChars += Math.max(0, expectedChars - totalCharsTyped);

                go("endgame");
            }
        });
    }

    window.addEventListener("keydown", (event) => {
        const key = event.key;

        if (key === "Backspace" && cursorPos > 0) {
            const currentChar = txtCharacters[cursorPos - 1];
            const nextChar = cursorPos < txtCharacters.length ? txtCharacters[cursorPos] : null;

            if (currentChar.originalChar === "\n") {
                totalCorrectLines--;
            }

            if (currentChar.color.eq(COLOR_TEXT_CORRECT)) {
                totalCorrectChars--;
            } else if (currentChar.color.eq(COLOR_TEXT_INCORRECT)) {
                totalIncorrectChars--;
            }

            if (currentChar.color.eq(COLOR_TEXT_INCORRECT)) {
                currentMistakes--;
            }

            if (nextChar && nextChar.color.eq(COLOR_TEXT_RIVAL)) {
                currentChar.color = COLOR_TEXT_RIVAL;
            } else {
                currentChar.color = currentChar.originalColor;
            }
            currentChar.isModified = false;
            cursorPos--;
            accumulatedCorrectChars = totalCorrectChars;
            accumulatedIncorrectChars = totalIncorrectChars;
            accumulatedCorrectLines = totalCorrectLines;
            updateCursorPosition();
            return;
        }

        if (currentMistakes >= maxMistakes) {
            return;
        }

        if (cursorPos < txtCharacters.length) {
            const currentChar = txtCharacters[cursorPos];

            if (currentChar.originalChar === "\n") {
                if (key === "Enter") {
                    currentChar.color = COLOR_TEXT_CORRECT;
                    totalCorrectChars++;
                    totalCorrectLines++;
                    cursorPos++;
                    accumulatedCorrectChars = totalCorrectChars;
                    accumulatedIncorrectChars = totalIncorrectChars;
                    accumulatedCorrectLines = totalCorrectLines;
                    updateCursorPosition();

                    if (cursorPos >= txtCharacters.length) {
                        const allCorrect = txtCharacters.every(char => char.color.eq(COLOR_TEXT_CORRECT));
                        if (allCorrect) {
                            currentGroupIndex++;
                            updateDialog();
                        }
                    }
                }
                return;
            }

            if (key.length === 1 || key === " ") {
                const isCorrect = currentChar.text === key;

                if (isCorrect) {
                    currentChar.color = COLOR_TEXT_CORRECT;
                    totalCorrectChars++;
                } else {
                    currentChar.color = COLOR_TEXT_INCORRECT;
                    totalIncorrectChars++;
                    currentMistakes++;
                }
                accumulatedCorrectChars = totalCorrectChars;
                accumulatedIncorrectChars = totalIncorrectChars;
                accumulatedCorrectLines = totalCorrectLines;
                cursorPos++;
                updateCursorPosition();
            }


            if (cursorPos >= txtCharacters.length) {
                const allCorrect = txtCharacters.every(char => char.color.eq(COLOR_TEXT_CORRECT));
                if (allCorrect) {
                    currentGroupIndex++;
                    updateDialog();
                }
            }
        }
    });


    startTimer();
    updateDialog();
});

scene("endgame", () => {
    const endgameLabel = add([
        text("Analytics", { size: 48 }),
        pos(center().x, center().y - 100),
        anchor("center"),
    ]);

    const totalCharsTyped = accumulatedCorrectChars + accumulatedIncorrectChars + accumulatedMissingChars;
    const accuracy = totalCharsTyped > 0 ? (accumulatedCorrectChars / totalCharsTyped) * 100 : 0;

    const timeElapsed = 60 - timeLeft;
    const wpm = (accumulatedCorrectChars / 5) / (timeElapsed / 60);
    const loc = (accumulatedCorrectLines / timeElapsed) * 60;

    const statsLabel = add([
        text(`Accuracy: ${accuracy.toFixed(2)}%`, { size: 32 }),
        pos(center().x, center().y),
        anchor("center"),
    ]);

    const wpmLabel = add([
        text(`WPM: ${wpm.toFixed(2)}`, { size: 32 }),
        pos(center().x, center().y + 40),
        anchor("center"),
    ]);

    const locLabel = add([
        text(`LOC: ${loc.toFixed(2)}`, { size: 32 }),
        pos(center().x, center().y + 80),
        anchor("center"),
    ]);

    const missingCharsLabel = add([
        text(`Missing Characters: ${accumulatedMissingChars}`, { size: 32 }),
        pos(center().x, center().y + 120),
        anchor("center"),
    ]);
});

go("game");

