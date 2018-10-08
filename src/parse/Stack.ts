export class Stack<T> {
  private stack: T[];
  constructor() {
    this.stack = [];
  }

  push(val: T) {
    this.stack.push(val);
  }

  pop(): T | undefined {
    return this.stack.pop();
  }

  peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }

  size(): number {
    return this.stack.length;
  }

  isNext(): boolean {
    return this.size() !== 0;
  }

  asArray(): T[] {
    return this.stack.slice();
  }
}