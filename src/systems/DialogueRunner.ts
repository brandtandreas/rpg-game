import type { DialogueNode, DialogueTree } from '../types';

export interface DialogueEffects {
  giveItem(itemId: string): void;
  setFlag(flag: string): void;
}

export class DialogueRunner {
  private currentId: string;

  constructor(private tree: DialogueTree, private effects: DialogueEffects) {
    this.currentId = tree.start;
    this.applyNodeEffects(this.current());
  }

  current(): DialogueNode {
    const node = this.tree.nodes[this.currentId];
    if (!node) throw new Error(`Missing dialogue node: ${this.currentId}`);
    return node;
  }

  /**
   * Advance through a `next` link. Returns null if there is nowhere to go
   * (end of branch with no choices).
   */
  advance(): DialogueNode | null {
    const node = this.current();
    if (!node.next) return null;
    this.currentId = node.next;
    this.applyNodeEffects(this.current());
    return this.current();
  }

  choose(index: number): DialogueNode | null {
    const node = this.current();
    const choice = node.choices?.[index];
    if (!choice) return null;
    if (choice.giveItem) this.effects.giveItem(choice.giveItem);
    if (choice.setFlag) this.effects.setFlag(choice.setFlag);
    if (!choice.next) return null;
    this.currentId = choice.next;
    this.applyNodeEffects(this.current());
    return this.current();
  }

  isFinished(): boolean {
    const node = this.current();
    return !node.next && (!node.choices || node.choices.length === 0);
  }

  private applyNodeEffects(node: DialogueNode): void {
    if (node.giveItems) {
      for (const id of node.giveItems) this.effects.giveItem(id);
    }
    if (node.setFlag) this.effects.setFlag(node.setFlag);
  }
}
