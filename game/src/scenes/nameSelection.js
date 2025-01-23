import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";
import { savePlay } from "../systems/saves.js";
import { resizablePos } from "../components/resizablePos.js";
export let actualname;

k.scene("name_selection", () => {

    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2 - 250, k.height() / 3),
        k.text("Typing", {
            size: 38,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);


    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2 - 130, k.height() / 3),
        k.text("Start", {
            size: 38,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);


    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2 + 150, k.height() / 3),
        k.text("to begin the speed test", {
            size: 38,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    k.add([
        k.anchor("top"),
        k.text("github", {
            size: 28,
        }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.89)),
        k.opacity(1),
        k.z(21),
    ]);

    k.add([
        k.anchor("top"),
        k.text("about", {
            size: 28,
        }),
        resizablePos(() => k.vec2(k.width() * 0.45, k.height() * 0.89)),
        k.opacity(1),
        k.z(21),
    ]);
    k.add([
        k.sprite("github_icon"),
        k.anchor("top"),
        resizablePos(() => k.vec2(k.width() * 0.60, k.height() * 0.9)),
        k.opacity(1),
        k.z(21),
    ]);
    k.add([
        k.sprite("about_icon"),
        k.anchor("top"),
        resizablePos(() => k.vec2(k.width() * 0.49, k.height() * 0.9)),
        k.opacity(1),
        k.z(21),
    ]);
    
    k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.04, k.height() * 0.04),
        k.opacity(1),
        k.animate(),
        k.z(21),
    ]);
    k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.02, k.height() * 0.01),
        k.opacity(0),
        k.animate(),
        k.z(17),
    ]);
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.15, k.height() * 0.15)),
        k.anchor("center"),
        k.z(18),
    ]);

    const name = k.add([
        k.text("", {
            size: 32,

        }),
        k.textInput(true, 20),
        k.pos(k.width() / 2, k.height() / 2.0),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(21),
    ]);

    const nameLines = k.add([
        k.text("_".repeat(5), {
            size: 32,
        }),
        k.pos(k.width() / 2, k.height() / 2.0 + 30),
        k.color(k.MAGENTA),
        k.anchor("center"),
        k.z(20),
    ]);

    name.onUpdate(() => {
        const lineLength = Math.min(20, Math.max(5, name.text.length));
        nameLines.text = "_".repeat(lineLength);

        if (name.text === "Start") {
            const playData = {
                userName: name.text,
            };

            savePlay(playData);
            k.go("game", {
                rivalSpeed: EASY_RIVAL_SPEED,
                userName: name.text,
            });
        }
    });

});
