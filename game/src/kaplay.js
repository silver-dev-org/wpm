// kaplay.js

import kaplay from 'kaplay';
export const MEASUREMENT_ID = 'G-6CCP4C6VS7';

/**
 * @param {string} measurementId
 * @param {Function} [callback]
 */
export function loadGtag(measurementId, callback) {
  if (window.gtag) {
    callback && callback();
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
    })
    callback && callback();
  };
  document.head.appendChild(script);
}

export function onGameStart() {
  if (window.gtag) {
    window.gtag('event', 'game_start', { event_category: 'game' });
  } 
}

export function onBlockReached(blockIndex, blockName) {
  if (window.gtag) {
    window.gtag('event', 'block_reached', {
      event_category: 'game',
      block_index: blockIndex,
      block_name: blockName,
    });
  }
}

export function onWpm(wpmValue) {
  if (window.gtag) {
    window.gtag('event', 'wpm', {
      event_category: 'game',
      value: wpmValue,
    });
  }
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const width = isMobile() ? 640 : 1920;
const height = isMobile() ? 480 : 1080;

export const k = kaplay({
  loadingScreen: false,
  background: [0, 0, 0, 0],
  font: 'jetbrains',
  maxFPS: 120,
  backgroundAudio: false,
  width,
  height,
  letterbox: true,
  pixelDensity: 1,
  crisp: false,
  texFilter: 'linear',
});

k.onLoading((progress) => {
});

// Avoid the default behavior of '/' and '?' in browser
window.addEventListener('keydown', (e) => {
  if (e.key === '/' || e.key === '?') {
    e.preventDefault();
  }
});