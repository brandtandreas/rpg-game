import { SAVE_VERSION, type SaveData } from '../types';

const STORAGE_KEY = 'tilelands.save.v1';

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const browserStorage: Storage | null =
  typeof globalThis !== 'undefined' && 'localStorage' in globalThis
    ? (globalThis as unknown as { localStorage: Storage }).localStorage
    : null;

export class SaveService {
  constructor(private storage: Storage | null = browserStorage) {}

  hasSave(): boolean {
    return this.load() !== null;
  }

  save(data: Omit<SaveData, 'version' | 'savedAt'>): SaveData {
    const full: SaveData = {
      ...data,
      version: SAVE_VERSION,
      savedAt: Date.now(),
    };
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(full));
    return full;
  }

  load(): SaveData | null {
    const raw = this.storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.version !== SAVE_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  clear(): void {
    this.storage?.removeItem(STORAGE_KEY);
  }
}
