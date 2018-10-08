// TODO: refactor to use a linked list to be more efficient?

export class Queue<T> {
  private queue: T[];
  constructor() {
    this.queue = [];
  }

  push(val: T) {
    this.queue.push(val);
  }

  pop(): T | undefined {
    return this.queue.shift();
  }

  peek(): T | undefined {
    return this.queue[0];
  }

  size(): number {
    return this.queue.length;
  }

  asArray(): T[] {
    return this.queue.slice();
  }
}