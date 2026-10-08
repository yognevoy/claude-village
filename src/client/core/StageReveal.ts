export class StageReveal {
  public constructor(private readonly stageEl: HTMLElement) {}

  public waitFor(...ready: ReadonlyArray<Promise<unknown>>): void {
    Promise.all(ready).then(() => {
      this.stageEl.classList.add("ready");
    });
  }
}
