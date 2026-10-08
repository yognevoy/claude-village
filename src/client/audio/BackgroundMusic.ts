const MUSIC_VOLUME = 0.4;

export class BackgroundMusic {
  private readonly audio: HTMLAudioElement;
  private on = false;
  private resumeListenerAdded = false;

  public constructor(
    trackUrl: string,
    initialOn: boolean,
    private readonly onWaitingChange: (waiting: boolean) => void,
  ) {
    this.audio = new Audio(trackUrl);
    this.audio.loop = true;
    this.audio.volume = MUSIC_VOLUME;

    if (initialOn) {
      this.on = true;
      this.play();
    }
  }

  public get isOn(): boolean {
    return this.on;
  }

  public toggle(): void {
    this.on = !this.on;

    if (this.on) {
      this.play();
      return;
    }

    this.audio.pause();
  }

  private play(): void {
    this.audio.play().then(
      () => this.onWaitingChange(false),
      () => this.waitForUserGesture(),
    );
  }

  private waitForUserGesture(): void {
    if (this.resumeListenerAdded) {
      return;
    }

    this.resumeListenerAdded = true;
    this.onWaitingChange(true);

    const resume = (): void => {
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
      this.resumeListenerAdded = false;
      this.onWaitingChange(false);

      if (this.on) {
        this.play();
      }
    };

    document.addEventListener("pointerdown", resume, { once: true });
    document.addEventListener("keydown", resume, { once: true });
  }
}
