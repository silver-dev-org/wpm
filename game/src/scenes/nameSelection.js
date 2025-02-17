import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";
import { savePlay } from "../systems/saves.js";
import { resizablePos } from "../components/resizablePos.js";

export let actualname;

k.scene("name_selection", () => {
    const btn_githublink = add([
        rect(80, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.90)),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        k.z(21),
        k.opacity(0),
        k.onHover,
    ]);

    btn_githublink.onClick(() => {
        window.open("https://github.com/conanbatt/wpm", "_blank");

    });
    btn_githublink.onHover(() => {
        gitText.color = k.rgb(255, 215, 0);
    });
    btn_githublink.onHoverEnd(() => {
        gitText.color = k.rgb(255, 255, 255);;
        console.log("exit");
    });

    const btn_aboutlink = add([
        rect(80, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.45, k.height() * 0.90)),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        k.z(21),
        k.opacity(0),
        k.onHover,
    ]);

    btn_aboutlink.onHover(() => {
        aboutText.color = k.rgb(255, 215, 0);
    });
    btn_githublink.onHoverEnd(() => {
        aboutText.color = k.rgb(255, 255, 255);;
        console.log("exit");
    });

    /* const text_a = k.add([
         k.anchor("top"),
         k.pos(k.width() / 2 - 250, k.height() / 3),
         k.text("Typing", {
             size: 38,
         }),
         k.color(k.WHITE),
         k.animate(),
         k.z(21),
     ]);*/

    /*   const text_b = k.add([
           k.anchor("top"),
           k.pos(k.width() / 2 - 130, k.height() / 3.05),
           k.text("Start", {
               size: 38,
           }),
           k.color(k.YELLOW),
           k.animate(),
           k.z(21),
       ]);*/

    const gitText = k.add([
        k.anchor("top"),
        k.text("github", {
            size: 32,
        }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.85)),
        k.opacity(1),
        k.z(21),
    ]);
    const aboutText = add([
        k.anchor("top"),
        k.text("about", {
            size: 32,
        }),
        resizablePos(() => k.vec2(k.width() * 0.44, k.height() * 0.85)),
        k.opacity(1),
        k.z(21),
    ]);

    /* moveText();
 
     function moveText() {
         text_b.animate("pos", [k.vec2(text_b.pos.x, text_b.pos.y + 5), k.vec2(text_b.pos.x, text_b.pos.y - 5)], {
             duration: 0.5,
             direction: "ping-pong",
         });
     }*/


    k.add([
        k.anchor("top"),
        k.pos(k.width() / 1.9, k.height() / 2.5),
        k.text("Get faster and better at technical interviewing by practicing typing code.", {
            size: 28,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    k.add([
        k.sprite("github_icon"),
        k.anchor("top"),
        resizablePos(() => k.vec2(k.width() * 0.60, k.height() * 0.85)),
        k.opacity(1),
        k.z(21),
    ]);
    k.add([
        k.sprite("about_icon"),
        k.anchor("top"),
        resizablePos(() => k.vec2(k.width() * 0.49, k.height() * 0.85)),
        k.opacity(1),
        k.z(21),
    ]);

    const background = k.add([
        k.sprite("bg3"),
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
    const subTitle = k.add([
        k.sprite("SilverDev"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.1)),
        k.anchor("center"),
        k.z(18),
    ]);

    const targetText = "Start";
    const maxLength = targetText.length;

    const name = k.add([
        k.text("", {
            size: 32,

        }),
        k.textInput(true, 20),
        k.pos(k.width() / 2, k.height() / 1.7),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.opacity(0),
        k.z(21),
    ]);


    const letterSpacing = 22; 

    const startX = k.width() / 2 - ((maxLength - 1) * letterSpacing) / 2;
    const letterObjects = [];
    for (let i = 0; i < maxLength; i++) {
        const letter = k.add([
            k.text(targetText[i], { size: 32 }),
            k.pos(startX + i * letterSpacing, k.height() / 1.7),
            k.anchor("center"),
            k.color(k.rgb(128, 128, 128)), 
            k.z(22),
            k.animate(),
        ]);
        letterObjects.push(letter);
    }


    const underscoreObjects = [];
    for (let i = 0; i < maxLength; i++) {
        const underscore = k.add([
            k.text("_", { size: 32 }),
            k.pos(startX + i * letterSpacing, k.height() / 1.6),
            k.anchor("center"),
            k.color(k.MAGENTA),
            k.z(20),
        ]);
        underscoreObjects.push(underscore);
    }

    name.onUpdate(() => {
        const input = name.text; 
        for (let i = 0; i < maxLength; i++) {
            if (input[i]) {
                if (input[i].toLowerCase() === targetText[i].toLowerCase()) {
                    letterObjects[i].text = input[i];
                    letterObjects[i].color = k.rgb(255, 255, 0); 
                } else {
                    letterObjects[i].text = input[i];
                    letterObjects[i].color = k.rgb(255, 0, 0); 
                }
            } else {
         
                letterObjects[i].text = targetText[i];
                letterObjects[i].color = k.rgb(128, 128, 128);
            }
        }
    
        if (input.toLowerCase() === targetText.toLowerCase()) {
            const playData = { userName: input };
            savePlay(playData);
            k.go("game", { rivalSpeed: EASY_RIVAL_SPEED, userName: input });
        }
    });

    k.onKeyPress((keyPressed) => {

        if (keyPressed != "backspace") {
            k.play("code_sound");
        }

    });

});
