export class Spot {
  private readonly occupied = new Set<string>();
  private readonly queue: string[] = [];

  public constructor(public readonly capacity: number) {}

  public freeCount(): number {
    return Math.max(0, this.capacity - this.occupied.size);
  }

  public loadCount(): number {
    return this.occupied.size + this.queue.length;
  }

  public enter(sessionId: string): boolean {
    if (this.freeCount() <= 0) {
      this.queue.push(sessionId);
      return false;
    }

    this.occupied.add(sessionId);
    return true;
  }

  public leave(sessionId: string): string | null {
    this.occupied.delete(sessionId);

    const next = this.queue.shift();

    if (next === undefined) {
      return null;
    }

    this.occupied.add(next);
    return next;
  }

  public cancel(sessionId: string): void {
    const index = this.queue.indexOf(sessionId);

    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }
}
