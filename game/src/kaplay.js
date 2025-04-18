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
    pixelDensity: 5,
    crisp: true,
    texFilter: "nearest",
});
k.onLoading((progress) => {
});
window.addEventListener('keydown', (e) => {
    if (e.key === '/' || e.key === '?') {
      e.preventDefault();
    }
  });