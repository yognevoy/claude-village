export class SubagentRegistry {
  private readonly lastEventAt = new Map<string, number>();

  public touch(agentId: string, timestamp: number): void {
    this.lastEventAt.set(agentId, timestamp);
  }

  public stop(agentId: string): void {
    this.lastEventAt.delete(agentId);
  }

  public pruneIdle(now: number, idleSec: number): boolean {
    const idleMs = idleSec * 1000;
    let pruned = false;

    for (const [agentId, lastEventAt] of this.lastEventAt) {
      if (now - lastEventAt >= idleMs) {
        this.lastEventAt.delete(agentId);
        pruned = true;
      }
    }

    return pruned;
  }

  public count(): number {
    return this.lastEventAt.size;
  }
}
