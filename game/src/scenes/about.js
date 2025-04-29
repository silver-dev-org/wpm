import { k } from "../kaplay.js";
import { resizablePos } from "../components/resizablePos.js";
import { settings } from "./selectionScene.js";
k.scene("about", () => {
    const blockWidth = k.width() * 0.8;
    const startX = (k.width() - blockWidth) / 2;
    const startY = k.height() * 0.4 + 20;
    const fontSize = 18;
    const lineSpacing = 8;
    k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.25)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.text(
            `Typing is one of the most under-rated coding skills.\n\n` +
            `We type messages and code all day, and the speed at the which we do it increases our overall Actions Per Day, making us more productive.\n\n` +
            `It is also a key predictor of interview performance. Slow coding gets an “instant no” in any competitive interview process, and interviewers almost never tell candidates this is why, because it is embarrasing and even conflictive.\n\n` +
            `Many developers get publicly angry at the suggestion that typing speed is irrelevant. I say to you - do you want to be upset or do you want to pass interviews?\n\n` +
            `WPM is a diagnostic and practice tool to write realistic without editor or AI-assistance, helping you polish your typing skills for any interview environment.\n\n` +
            `To beat this game you will need to master touch-typing, and fix hand positioning and other bad habits that are preventing you from writing - and thinking - at your top speed.`,
            {
                size: fontSize,
                width: blockWidth,
                align: "left",
                lineSpacing: lineSpacing,
            }
        ),
        k.pos(startX, startY),
        k.anchor("topleft"),
        k.color(k.WHITE),
        k.z(30),
    ]);
    const url = "https://docs.silver.dev/interview-ready/library/guia-de-tipeo-para-devs#1-typingclub";
    const urlY = startY + 17.5 * (fontSize + lineSpacing) + 10;
    const link = k.add([
        k.text(url, {
            size: fontSize,
            width: blockWidth,
            align: "left",
        }),
        k.pos(startX, urlY),
        k.anchor("topleft"),
        k.color(k.YELLOW),
        k.area(),
        k.z(30),
    ]);

    link.onClick(() => window.open(url, "_blank"));
    link.onHover(
        () => document.body.style.cursor = "pointer",
        () => document.body.style.cursor = "default"
    );

    onKeyPress("escape", () => {
        k.go("selection");
    });
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
    if (settings.mute) {
        button_muteON.opacity = 0;
        button_muteOFF.opacity = 1;
    }
    else {
        button_muteON.opacity = 1;
        button_muteOFF.opacity = 0;
    }
    const rest_text = k.add([
        k.text("ESC to return", { size: 20 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.94)),
        k.anchor("center"),
        k.color(k.rgb(127, 134, 131)),
        k.animate(),
        k.z(19),
    ]);
    const atributions = k.add([
        k.text("Design by Leonel Orrut and Daniel Báez in KAPLAY ", { size: 16 }),
        resizablePos(() => k.vec2(k.width() * 0.8, k.height() * 0.98)),
        k.anchor("center"),
        k.color(k.rgb(127, 134, 131)),
        k.animate(),
        k.z(19),
    ]);
});