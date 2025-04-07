// @ts-check

import kaplay from "kaplay";

export const k = kaplay({
    loadingScreen: false,
    background: [0, 0, 0, 0],
    font: "monogram",
    maxFPS: 120,
    backgroundAudio: false,
    width: 1920,
    height: 1080,
    letterbox: true,
    pixelDensity: 3,
    crisp: false,
    texFilter: "nearest",
});
k.onLoading((progress) => {
});