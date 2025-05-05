// @ts-check

import kaplay from "kaplay";

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  .test(navigator.userAgent);
}

const width = isMobile() ? 640 : 1920;
const height = isMobile() ? 480 : 1080;

export const k = kaplay({
  loadingScreen: false,
  background: [0, 0, 0, 0],
  font: "jetbrains",
  maxFPS: 120,
  backgroundAudio: false,
  width,
  height,
  letterbox: true,
  pixelDensity: 1,
  crisp: false,
  texFilter: "linear",
});

k.onLoading((progress) => {});

window.addEventListener("keydown", (e) => {
  if (e.key === "/" || e.key === "?") {
    e.preventDefault();
  }
});