import Phaser from 'phaser';
import { inputBus, type InputEvent } from './inputBus';

/**
 * Bind input-bus events to a scene with proper lifecycle management:
 * listeners attach on create, detach when the scene is paused or put to
 * sleep, and re-attach on resume/wake. They are fully removed on shutdown.
 *
 * This prevents a paused scene (e.g. WorldScene during a battle) from
 * still reacting to taps meant for the overlay scene above it.
 */
export function bindSceneInput(
  scene: Phaser.Scene,
  bindings: Partial<Record<InputEvent, () => void>>,
): void {
  const entries = Object.entries(bindings) as [InputEvent, () => void][];

  const attach = () => {
    for (const [event, fn] of entries) inputBus.on(event, fn);
  };
  const detach = () => {
    for (const [event, fn] of entries) inputBus.off(event, fn);
  };

  attach();

  scene.events.on(Phaser.Scenes.Events.PAUSE, detach);
  scene.events.on(Phaser.Scenes.Events.RESUME, attach);
  scene.events.on(Phaser.Scenes.Events.SLEEP, detach);
  scene.events.on(Phaser.Scenes.Events.WAKE, attach);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    detach();
    scene.events.off(Phaser.Scenes.Events.PAUSE, detach);
    scene.events.off(Phaser.Scenes.Events.RESUME, attach);
    scene.events.off(Phaser.Scenes.Events.SLEEP, detach);
    scene.events.off(Phaser.Scenes.Events.WAKE, attach);
  });
}
