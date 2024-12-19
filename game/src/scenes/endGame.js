import { totalCorrectChars } from "./game.js";
import { totalCorrectlines } from "./game.js";
import { totalIcorrectCorrectChars } from "./game.js";
import { totalTypedCharacters } from "./game.js";

scene("endgame", () => {
    let wpm_totalChars = (totalCorrectChars / 5);
    let wpm = (wpm_totalChars / 60);
    let wpm_totalLines = (totalCorrectlines / 5);
    let lpm = (wpm_totalLines / 60);
    let acc = (totalCorrectChars / totalTypedCharacters) * 100;
    wpm = parseFloat(wpm.toFixed(2));
    lpm = parseFloat(lpm.toFixed(2));
    acc = parseFloat(acc.toFixed(2));

    //const accuracy = (totalCorrectCharacters / totalTypedCharacters) * 100;

    const endgameLabel = add([
        text("Analytics", { size: 48 }),
        pos(center().x, center().y - 100),
        anchor("center"),
    ]);

    const WPMLabel = add([
        text("WPM", { size: 48 }),
        pos(center().x - 200, center().y + 50),
        anchor("center"),
    ]);

    const LOClabel = add([
        text("LOC", { size: 48 }),
        pos(center().x, center().y + 50),
        anchor("center"),
    ]);

    const ACClabel = add([
        text("ACC", { size: 48 }),
        pos(center().x + 200, center().y + 50),
        anchor("center"),
    ]);

    const WPMNumber = add([
        text(wpm, { size: 48 }),
        pos(center().x - 200, center().y + 120),
        anchor("center"),
    ]);

    const LOCNumber = add([
        text(lpm, { size: 48 }),
        pos(center().x, center().y + 120),
        anchor("center"),
    ]);

    const ACCNumber = add([
        text(acc, { size: 48 }),
        pos(center().x + 200, center().y + 120),
        anchor("center"),
    ]);

    console.log(acc);
});


