import Phaser from 'phaser';

/**
 * Shared touch/keyboard input plumbing.
 *
 * - `virtualPad` mirrors the D-pad state and is polled each frame by the
 *   player for movement.
 * - `inputBus` carries one-shot events (button taps and pad presses) that
 *   menu scenes subscribe to via `bindSceneInput`.
 *
 * Keyboard handlers stay in each scene as-is; this layer is purely
 * additive so desktop play is unchanged.
 */
export const virtualPad = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export type InputEvent =
  | 'action'
  | 'cancel'
  | 'inventory'
  | 'save'
  | 'press-up'
  | 'press-down'
  | 'press-left'
  | 'press-right';

export const inputBus = new Phaser.Events.EventEmitter();

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  return 'ontouchstart' in window || (nav.maxTouchPoints ?? 0) > 0;
}
