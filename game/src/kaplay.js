// @ts-check

import kaplay from "kaplay";

export const k = kaplay({
    background: [10, 10, 27, 0],
    font: "monogram",
    maxFPS: 120,
    backgroundAudio: false,
    width: 1920,
    height: 1080,
    letterbox: true,
    pixelDensity: 3,
    crisp: false,
    texFilter: "linear",
});
