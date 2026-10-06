const MUSIC_VOLUME = 0.4;

export class BackgroundMusic {
  private readonly audio: HTMLAudioElement;
  private on = false;

  public constructor(trackUrl: string) {
    this.audio = new Audio(trackUrl);
    this.audio.loop = true;
    this.audio.volume = MUSIC_VOLUME;
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
    this.audio.play().catch(() => undefined);
  }
}
