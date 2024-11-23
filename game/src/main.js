import kaplay from "kaplay";
import "kaplay/global";
import dialogs from "./dialog.json";
import colorTags from "./colorTags.json";

kaplay({
    background: [10, 10, 27, 0],
});

loadFont("monogram", "/fonts/monogram.ttf", {
    outline: 4,
    filter: "linear",
});

const goalBlocks = 2;
const maxtime = 500;
const maxMistakes = 2;
const lineHeight = 24;
const charSpacing = 12;
const startmoveline = 5;
const marginvisiblebox = -40
let COLOR_TEXT_DEFAULT = Color.fromHex("#553d4d");
let COLOR_TEXT_RIVAL = Color.fromHex("#fbf236");
let COLOR_TEXT_CORRECT = Color.WHITE;
let COLOR_TEXT_INCORRECT = Color.RED;
let OmitedtagsLengths = { "▯": 0, };
let completedBlocks = 0;
let totalCorrectChars = 0;
let totalIncorrectChars = 0;
let totalCorrectLines = 0;
let timeLeft = maxtime;
let currentMistakes = 0;
let font_size = 28;
let currentline = 0;
const jsonData = dialogs;

scene("game", () => {
    const speedX = 0.1;
    const speedY = 0.3;
    const maxLines = 20;
    const body = document.querySelector("body");
    let currentBlockIndex = 0;
    let currentGroupIndex = 0;
    let txtCharacters = [];
    let cursorPos = 0;
    let offsetX = 0;
    let offsetY = 0;
    animateBackground();
    constructTransparentBackground();

    function animateBackground() {
        offsetX += speedX;
        offsetY += speedY;
        body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

        requestAnimationFrame(animateBackground);
    }

    function constructTransparentBackground() {
        const container = document.createElement('div');
        document.body.appendChild(container);
        container.classList.add('backtextbox');
        const innerRect = document.createElement('div');
        container.appendChild(innerRect);
        innerRect.classList.add('innerRect');

    }

    const textbox = add([
        rect(width() * 0.7, height() * 0.7, { radius: 2 }),
        anchor("center"),
        pos(center().x, height() - height() * 0.5),
        outline(8, CYAN),
        color(23, 9, 39),
        opacity(0.6),
    ]);

    const headertextbox = add([
        rect(width() * 0.7, height() * 0.05, { radius: 2 }),
        anchor("center"),
        pos(center().x, height() - height() * 0.85),
        outline(8, CYAN),
        color(CYAN),
        opacity(1),
    ]);

    const timerLabel = add([
        text({ timeLeft }, {
            size: 48,
            font: "monogram",

        }),
        pos(width() * 0.80, height() * 0.2),
        anchor("topright"),
    ]);

    const cursorPointer = add([
        text("_", { size: 16, color: COLOR_TEXT_INCORRECT }),
        pos(0, 0),
        opacity(0.6),
        anchor("left"),
        color(255, 255, 255),
    ]);

    const rivalPointer = add([
        text("_", { size: 16, color: COLOR_TEXT_RIVAL }),
        pos(0, 0),
        opacity(0.6),
        anchor("left"),
        color(COLOR_TEXT_RIVAL),
    ]);

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

    function applyRivalColor() {
        let rivalIndex = 0;
        const currentBlockId = currentBlockIndex;
        loop(0.3, () => {
            if (rivalIndex < txtCharacters.length && currentBlockIndex === currentBlockId) {
                const char = txtCharacters[rivalIndex];
                if (char.color.eq(COLOR_TEXT_DEFAULT)) {
                    char.color = COLOR_TEXT_RIVAL;
                }
                rivalPointer.pos = vec2(char.pos.x, char.pos.y * 1.02);
                rivalIndex++;
            }
        });
    }

    let tagPositions = {};

    function updateDialog() {
        completedBlocks++;
        currentGroupIndex = 0;
        cursorPos = 0;
        currentMistakes = 0;
        txtCharacters.forEach(char => char.destroy());
        txtCharacters.length = 0;
        timeLeft = maxtime;

        const currentGroup = getCurrentGroup();

        let totalTextWidth = currentGroup.reduce((width, line) => {
            return width + line.length * charSpacing;
        }, 0);

        let initialPosX = Math.max(0, (textbox.width - totalTextWidth) / 2.2) + textbox.pos.x - (textbox.width / 2.2);
        let verticalOffset = textbox.pos.y * 0.7;

        const textboxTop = textbox.pos.y - textbox.height / 2;
        const textboxBottom = textbox.pos.y + textbox.height / 2.5;

        for (let line of currentGroup) {
            let i = 0;
            while (i < line.length) {
                const char = line[i];
                let tagFound = false;
                for (let tag in OmitedtagsLengths) {
                    if (line.startsWith(tag, i)) {
                        totalCorrectChars++;
                        i += OmitedtagsLengths[tag];
                        tagFound = true;
                        break;
                    }
                }
                if (!tagFound) {
                    const charPosY = verticalOffset;
                    const isVisible = charPosY >= textboxTop && charPosY <= textboxBottom;

                    const charText = add([
                        text(char, { size: font_size, font: "monogram" }),
                        pos(initialPosX + (i * charSpacing), verticalOffset),
                        anchor("left"),
                        color(COLOR_TEXT_DEFAULT),
                        opacity(isVisible ? 1 : 0),
                        { originalChar: char, originalColor: COLOR_TEXT_DEFAULT, isModified: false },
                    ]);
                    txtCharacters.push(charText);
                }
                i++;
            }
            verticalOffset += lineHeight;
        }

        updateCursorPosition();
        applyRivalColor();
    }


    function updateCursorPosition() {
        if (cursorPos < txtCharacters.length && txtCharacters[cursorPos]) {
            const currentChar = txtCharacters[cursorPos];
            cursorPointer.pos = vec2(currentChar.pos.x, currentChar.pos.y * 1.02);
            // debug.log(cursorPos);
        } else {
            console.warn("undefined or exceeded range");
        }
    }

    function startTimer() {
        loop(1, () => {
            timeLeft--;
            timerLabel.text = timeLeft;
            // console.log(totalCorrectChars);
            // console.log(totalIncorrectChars);
            // console.log(totalCorrectLines);
            if (timeLeft <= 0) {
                go("endgame");
            }
        });
    }

    function updateLineVisibility() {
        const textboxTop = textbox.pos.y - textbox.height / 2;
        const textboxBottom = textbox.pos.y + textbox.height / 2;
        const adjustedTextboxTop = textboxTop - marginvisiblebox;
        const adjustedTextboxBottom = textboxBottom + marginvisiblebox;

        for (let char of txtCharacters) {
            if (!char || !char.pos) {
                console.warn("Carácter inválido detectado en txtCharacters:", char);
                continue;
            }
            const isVisible = char.pos.y >= adjustedTextboxTop && char.pos.y <= adjustedTextboxBottom;
            char.opacity = isVisible ? 1 : 0;
        }
    }

    function shiftLines(direction) {
        const shiftAmount = direction === "up" ? -lineHeight : lineHeight;
        for (let char of txtCharacters) {
            char.pos.y += shiftAmount;
            rivalPointer.pos = vec2(char.pos.x, char.pos.y * 1.02);

        }

        updateLineVisibility();
    }

    let spacePositions = [];

    window.addEventListener("keydown", (event) => {
        const key = event.key;

        if (key === "Backspace" && cursorPos > 0) {
            const currentChar = txtCharacters[cursorPos - 1];
            const nextChar = cursorPos < txtCharacters.length ? txtCharacters[cursorPos] : null;

            if (cursorPos === 1 && tagPositions.hasOwnProperty(currentChar.originalChar)) {
                cursorPos--;
                updateCursorPosition();
                return;
            }
            if (spacePositions.includes(cursorPos - 1)) {
                currentChar.text = " ";
                spacePositions = spacePositions.filter(pos => pos !== cursorPos - 1);
            }

            if (currentChar.originalChar === "\n") {

                totalCorrectLines--;
                currentline--;
                if (currentline >= startmoveline - 1) {
                    shiftLines("down");
                }
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
            updateCursorPosition();
            applyTagColor();
            return;
        }

        if (currentMistakes >= maxMistakes) {
            return;
        }

        if (cursorPos < txtCharacters.length) {
            const currentChar = txtCharacters[cursorPos];
            applyTagColor();

            if (isTag(currentChar.originalChar)) {
                cursorPos++;
                totalCorrectChars++;
                updateCursorPosition();
                return;
            }

            if (currentChar.originalChar === "\n") {
                if (key === "Enter") {
                    currentChar.color = COLOR_TEXT_CORRECT;
                    totalCorrectChars++;
                    totalCorrectLines++;
                    cursorPos++;
                    currentline++;
                    updateCursorPosition();

                    if (currentline >= startmoveline) {
                        shiftLines("up");
                    }
                    updateCursorPosition();

                    if (cursorPos >= txtCharacters.length) {
                        const noInvalidColors = txtCharacters.every(char =>
                            !char.color.eq(COLOR_TEXT_INCORRECT) &&
                            !char.color.eq(COLOR_TEXT_RIVAL) &&
                            !char.color.eq(COLOR_TEXT_DEFAULT)
                        );
                        if (noInvalidColors) {
                            currentGroupIndex++;
                            if (currentGroupIndex >= selectCurrentBlock().length / maxLines) {
                                if (completedBlocks >= goalBlocks) {
                                    go("endgame");
                                    return;
                                }
                                currentBlockIndex++;
                                if (currentBlockIndex >= jsonData.blocks.length) {
                                    currentBlockIndex = 0;
                                }
                                updateDialog();
                            } else {
                                updateDialog();
                            }
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

                    if (currentChar.originalChar === " ") {
                        currentChar.text = key;
                        spacePositions.push(cursorPos);
                    }
                }
                cursorPos++;
                updateCursorPosition();
            }
        }
    });

    function applyTagColor() {
        if (colorTags && currentBlockIndex !== undefined) {
            // debug.log(` ${cursorPos}`);
            const currentBlock = colorTags[currentBlockIndex];
            if (currentBlock) {
                for (const [tag, positions] of Object.entries(currentBlock)) {
                    //debug.log(`Checking tag ${tag} with positions ${positions}`);

                    if (positions.includes(cursorPos)) {
                        switch (tag) {
                            case "/C1":
                                COLOR_TEXT_CORRECT = Color.fromHex("#ff37b1");
                                //  debug.log("/C1");
                                break;
                            case "/C2":
                                COLOR_TEXT_CORRECT = Color.fromHex("#22fcff");
                                //    debug.log(" /C2");
                                break;
                            case "/C3":
                                COLOR_TEXT_CORRECT = Color.WHITE;
                                //   debug.log("/C3");
                                break;
                            case "/C4":
                                COLOR_TEXT_CORRECT = Color.WHITE;
                                //  debug.log("/C4");
                                break;
                            case "/C5":
                                COLOR_TEXT_CORRECT = Color.fromHex("#32ed67");
                                //   debug.log("/C5");
                                break;
                            default:
                                console.warn(`warn: ${tag}`);
                                break;
                        }
                        break;
                    }
                }
            }
        }
    }


    function isTag(character) {
        return tagPositions.hasOwnProperty(character);
    }

    startTimer();
    updateDialog();
});

scene("endgame", () => {
    const endgameLabel = add([
        text("Analytics", { size: 48 }),
        pos(center().x, center().y - 100),
        anchor("center"),
    ]);

});

go("game");

