const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const threshold = 0.2;
/**
 * Calculates the width of a character in pixels given a specific font size
 * @param {String} char The character to measure
 * @param {Number} textSize Font size in pixels
 * @returns {Number} The width of the character in pixels
 */
export function charWidthInPxl(char, textSize) {
  if (!char || typeof textSize !== 'number') {
    return 0;
  }
  
  // Set font with Arial as fallback
  context.font = `${textSize}px monospace, Arial, sans-serif`;
  const metrics = context.measureText(char);
  if(Math.ceil(metrics.width)==16){
    console.log(metrics.width, `biggest width ${char}`);
  }
  return metrics.width+threshold; // Round up to ensure no partial pixels
}