// @ts-check

/**
 * @typedef {Object} PlaySave
 * @property {number} wpm
 * @property {number} lpm
 * @property {number} acc
 * @property {string} loadDate
 */
/**
 * @param {{ wpm: number, lpm: number, acc: number }} stats
 */
export const savePlay = ({ wpm, lpm, acc }) => {
    const payload = {
      wpm,
      lpm,
      acc,
      loadDate: new Date().toISOString(),
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
    const entry  = document.cookie
      .split('; ')
      .find(c => c.startsWith(prefix));
    if (!entry) return null;
  
    try {
      const raw  = entry.substring(prefix.length);
      return /** @type {PlaySave} */ (
        JSON.parse(decodeURIComponent(raw))
      );
    } catch (e) {
      console.error('Error parsing playerData cookie:', e);
      return null;
    }
  };
  
  /**
   * save mute preference in localStorage
   * @param {boolean} mute
   */
  export const saveMute = (mute) => {
    localStorage.setItem('playMute', JSON.stringify(mute));
  };
  
  /**
   * @returns {boolean}
   */
  export const getMute = () => {
    const item = localStorage.getItem('playMute');
    return item ? JSON.parse(item) : false;
  };
  