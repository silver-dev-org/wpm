// @ts-check

/**
 * @typedef {Object} PlaySave
 * @property {number} wpm
 * @property {number} lpm
 * @property {number} acc
 * @property {number} bestWpm
 * @property {string} blockNames
 * @property {string} loadDate
 */

/**
 * @param {{ wpm: number, lpm: number, acc: number, bestWpm: number, blockNames: string, bestLvl: number }} stats
 */
export const savePlay = ({ wpm, lpm, acc, bestWpm, blockNames, bestLvl }) => {
  const previousSave = getPlay();
  const payload = {
    wpm,
    lpm,
    acc,
    bestLvl,
    bestWpm: Math.max(bestWpm, previousSave?.bestWpm || 0),
    blockNames,
    loadDate: new Date().toISOString(),
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const maxAge = 60 * 60 * 24 * 30;

  document.cookie =
    `playerData=${encoded}; ` +
    `domain=silver.dev; ` +
    `path=/; ` +
    `max-age=${maxAge}; ` +
    `domain=.silver.dev; ` + 
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
