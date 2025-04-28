// @ts-check

/**
 * @typedef {Object} PlaySave
 * @property {number} wpm
 * @property {number} lpm
 * @property {number} acc
 * @property {number} bestWpm
 * @property {string} blockNames
 * @property {string} loadDate
 * @property {boolean} mute
 */
/**
 * @param {{ wpm: number, lpm: number, acc: number, bestWpm: number, blockNames: string, mute: boolean }} stats
 */
export const savePlay = ({ wpm, lpm, acc, bestWpm, blockNames, mute }) => {
  const payload = {
    wpm,
    lpm,
    acc,
    bestWpm,
    blockNames,
    loadDate: new Date().toISOString(),
    mute,
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const maxAge  = 60 * 60 * 24 * 30;

  document.cookie =
    `playerData=${encoded}; ` +
    `path=/; ` +
    `max-age=${maxAge}; ` +
    `SameSite=Lax`;
};

/**
 * @returns {PlaySave | null}
 */
export const getPlay = () => {
  const prefix = 'playerData=';
  const entry = document.cookie
    .split('; ')
    .find(c => c.startsWith(prefix));
  if (!entry) return null;

  try {
    const raw = entry.substring(prefix.length);
    return /** @type {PlaySave} */ (
      JSON.parse(decodeURIComponent(raw))
    );
  } catch (e) {
    console.error('Error parsing playerData cookie:', e);
    return null;
  }
};

/**
 * @param {boolean} mute
 */
export const saveMute = (mute) => {
  const current = getPlay() || {
    wpm: 0, lpm: 0, acc: 0, bestWpm: 0, blockNames: '', loadDate: new Date().toISOString()
  };
  savePlay({ 
    ...current, 
    mute 
  });
};

/**
 * @returns {boolean}
 */
export const getMute = () => {
  const play = getPlay();
  return play ? play.mute : false;
};
