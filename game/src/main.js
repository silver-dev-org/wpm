import kaplay from "kaplay";
import "kaplay/global";
import dialogs from "./dialog.json"; 

kaplay({
    background: [255, 209, 253],
});

const COLOR_TEXT_DEFAULT = Color.fromArray([0, 0, 255]);
const COLOR_TEXT_RIVAL = Color.fromArray([128, 128, 255]);
const COLOR_TEXT_CORRECT = Color.GREEN;
const COLOR_TEXT_INCORRECT = Color.RED;
const COLOR_TIMER = Color.fromArray([255, 215, 0]);

let completedBlocks = 0;
let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let totalCorrectLines = 0;
let accumulatedCorrectChars = 0;
let accumulatedIncorrectChars = 0;
let accumulatedCorrectLines = 0;
let accumulatedMissingChars = 0;
const goalBlocks = 2;
let timeLeft = 60;
const maxMistakes = 2;
let currentMistakes = 0;

const jsonData = dialogs;

scene("game", () => {
    let currentBlockIndex = 0;
    let currentGroupIndex = 0;
    const maxLines = 8;
    let txtCharacters = [];
    let cursorPos = 0;

    const textbox = add([
        rect(width() - 100, 640, { radius: 32 }),
        anchor("center"),
        pos(center().x, height() / 2),
        outline(4),
    ]);

    const timerLabel = add([
        text(`[yellow]${timeLeft}[/yellow]`, {
            size: 32,
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
        anchor("center"),
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
            console.log(`Miss characters: ${accumulatedMissingChars}`);

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
        let verticalOffset = height() / 2 - (lineHeight * currentGroup.length) / 2;

        for (let line of currentGroup) {
            for (let i = 0; i < line.length; i++) {
                const char = line[i] === "\n" ? " " : line[i];
                const charText = add([
                    text(char, { size: 32 }),
                    pos(center().x - (line.length * charSpacing) / 2 + (i * charSpacing), verticalOffset),
                    anchor("center"),
                    color(COLOR_TEXT_DEFAULT),
                    { originalChar: line[i], originalColor: COLOR_TEXT_DEFAULT, isModified: false },
                ]);

                txtCharacters.push(charText);
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
                
                console.log(`Missin Characters: ${accumulatedMissingChars}`);
                
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
            debug.log(totalCorrectChars,totalIncorrectChars,totalCorrectLines)
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
                    debug.log(totalCorrectChars,totalIncorrectChars,totalCorrectLines)
                    updateCursorPosition();
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
                debug.log(totalCorrectChars,totalIncorrectChars,totalCorrectLines)
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
