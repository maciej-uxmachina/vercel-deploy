export class UndoManager {
  private stack: Float32Array[] = [];
  private readonly maxDepth = 30;

  push(positions: Float32Array) {
    this.stack.push(positions.slice());
    if (this.stack.length > this.maxDepth) this.stack.shift();
  }

  pop(): Float32Array | null {
    return this.stack.pop() ?? null;
  }

  clear() {
    this.stack = [];
  }

  get size() {
    return this.stack.length;
  }
}
