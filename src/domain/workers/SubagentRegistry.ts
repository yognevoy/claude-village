export class SubagentRegistry {
  private readonly lastEventAt = new Map<string, number>();

  public touch(agentId: string, timestamp: number): void {
    this.lastEventAt.set(agentId, timestamp);
  }

  public stop(agentId: string): void {
    this.lastEventAt.delete(agentId);
  }

  public pruneIdle(now: number, idleSec: number): void {
    const idleMs = idleSec * 1000;

    for (const [agentId, lastEventAt] of this.lastEventAt) {
      if (now - lastEventAt >= idleMs) {
        this.lastEventAt.delete(agentId);
      }
    }
  }

  public count(): number {
    return this.lastEventAt.size;
  }
}
