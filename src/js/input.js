/**
 * Keyboard input manager supporting arrows, WASD, Space, Shift, R and Enter.
 * @typedef {'left' | 'right' | 'jump' | 'down' | 'fire' | 'restart' | 'start'} Action
 */
export class Input {
  constructor() {
    /** @type {Set<string>} */
    this._down = new Set();
    /** @type {Set<string>} */
    this._just = new Set();

    this._onKeyDown = (e) => {
      // Prevent scrolling on space / arrows in browser
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this._down.has(e.code)) {
        this._just.add(e.code);
      }
      this._down.add(e.code);
    };

    this._onKeyUp = (e) => {
      this._down.delete(e.code);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  endFrame() {
    this._just.clear();
  }

  /**
   * @param {Action} action
   * @returns {boolean}
   */
  isDown(action) {
    switch (action) {
      case 'left':
        return this._down.has('ArrowLeft') || this._down.has('KeyA');
      case 'right':
        return this._down.has('ArrowRight') || this._down.has('KeyD');
      case 'jump':
        return this._down.has('ArrowUp') || this._down.has('KeyW');
      case 'down':
        return this._down.has('ArrowDown') || this._down.has('KeyS');
      case 'fire':
        return this._down.has('Space') || this._down.has('ShiftLeft') || this._down.has('ShiftRight');
      case 'restart':
        return this._down.has('KeyR');
      case 'start':
        return this._down.has('Enter');
      default:
        return false;
    }
  }

  /**
   * @param {Action} action
   * @returns {boolean}
   */
  justPressed(action) {
    switch (action) {
      case 'left':
        return this._just.has('ArrowLeft') || this._just.has('KeyA');
      case 'right':
        return this._just.has('ArrowRight') || this._just.has('KeyD');
      case 'jump':
        return this._just.has('ArrowUp') || this._just.has('KeyW');
      case 'down':
        return this._just.has('ArrowDown') || this._just.has('KeyS');
      case 'fire':
        return this._just.has('Space') || this._just.has('ShiftLeft') || this._just.has('ShiftRight');
      case 'restart':
        return this._just.has('KeyR');
      case 'start':
        return this._just.has('Enter');
      default:
        return false;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
