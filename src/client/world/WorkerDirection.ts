export class WorkerDirection {
  private flipped = false;

  public get isFlipped(): boolean {
    return this.flipped;
  }

  public turnToward(fromX: number, toX: number): void {
    if (toX < fromX) {
      this.flipped = true;
      return;
    }

    if (toX > fromX) {
      this.flipped = false;
    }
  }
}
