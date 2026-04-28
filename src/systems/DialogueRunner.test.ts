import { describe, it, expect } from 'vitest';
import { DialogueRunner } from './DialogueRunner';
import type { DialogueTree } from '../types';

const TREE: DialogueTree = {
  start: 'a',
  nodes: {
    a: {
      id: 'a',
      speaker: 'X',
      text: 'hi',
      choices: [
        { text: 'ask', next: 'b' },
        { text: 'gift', next: 'c', giveItem: 'potion', setFlag: 'met' },
      ],
    },
    b: { id: 'b', speaker: 'X', text: 'because', next: 'd' },
    c: { id: 'c', speaker: 'X', text: 'thanks', next: 'd' },
    d: { id: 'd', speaker: 'X', text: 'bye' },
  },
};

describe('DialogueRunner', () => {
  it('walks straight branches via advance()', () => {
    const items: string[] = [];
    const flags: string[] = [];
    const r = new DialogueRunner(TREE, {
      giveItem: (id) => items.push(id),
      setFlag: (f) => flags.push(f),
    });
    r.choose(0); // a -> b
    expect(r.current().id).toBe('b');
    r.advance(); // b -> d
    expect(r.current().id).toBe('d');
    expect(r.isFinished()).toBe(true);
    expect(items).toEqual([]);
    expect(flags).toEqual([]);
  });

  it('applies giveItem and setFlag from a choice', () => {
    const items: string[] = [];
    const flags: string[] = [];
    const r = new DialogueRunner(TREE, {
      giveItem: (id) => items.push(id),
      setFlag: (f) => flags.push(f),
    });
    r.choose(1);
    expect(items).toEqual(['potion']);
    expect(flags).toEqual(['met']);
    expect(r.current().id).toBe('c');
  });

  it('applies node-level giveItems on entry', () => {
    const tree: DialogueTree = {
      start: 'gift',
      nodes: {
        gift: {
          id: 'gift',
          speaker: 'X',
          text: 'take these',
          giveItems: ['potion', 'hi_potion'],
          setFlag: 'rewarded',
        },
      },
    };
    const items: string[] = [];
    const flags: string[] = [];
    new DialogueRunner(tree, {
      giveItem: (id) => items.push(id),
      setFlag: (f) => flags.push(f),
    });
    expect(items).toEqual(['potion', 'hi_potion']);
    expect(flags).toEqual(['rewarded']);
  });
});
