import type { DialogueTree } from '../../types';

export const INTRO_DIALOGUE: DialogueTree = {
  start: 'greet',
  nodes: {
    greet: {
      id: 'greet',
      speaker: 'Elder Maren',
      text: 'Ah, a traveler. The forest grows restless of late.',
      choices: [
        { text: 'What is happening?', next: 'explain' },
        { text: 'I can help.', next: 'gift' },
        { text: 'Goodbye.', next: 'bye' },
      ],
    },
    explain: {
      id: 'explain',
      speaker: 'Elder Maren',
      text: 'Slimes have crept from the western glade. Most are weak, but they multiply.',
      next: 'gift',
    },
    gift: {
      id: 'gift',
      speaker: 'Elder Maren',
      text: 'Take this potion, and this old key. The key may yet find its lock.',
      giveItems: ['potion', 'ancient_key'],
      setFlag: 'met_elder',
      next: 'bye',
    },
    bye: {
      id: 'bye',
      speaker: 'Elder Maren',
      text: 'Walk softly, traveler.',
    },
  },
};
