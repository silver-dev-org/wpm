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
  