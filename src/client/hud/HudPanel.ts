import type { BackgroundMusic } from "../audio/BackgroundMusic.js";
import type { AlertNotifier } from "../notifications/AlertNotifier.js";
import { texts } from "../../shared/texts.js";
import { AlertToggle } from "./AlertToggle.js";
import { ResourceCounters } from "./ResourceCounters.js";
import { SoundToggle } from "./SoundToggle.js";

export class HudPanel {
  private readonly _counters: ResourceCounters;
  private readonly soundToggle: SoundToggle;
  private readonly alertToggle: AlertToggle;

  public constructor(
    titleEl: HTMLElement,
    stoneCounterEl: HTMLElement,
    woodCounterEl: HTMLElement,
    fishCounterEl: HTMLElement,
    soundButtonEl: HTMLButtonElement,
    soundLabelEl: HTMLElement,
    music: BackgroundMusic,
    notifyButtonEl: HTMLButtonElement,
    notifyLabelEl: HTMLElement,
    notifier: AlertNotifier,
  ) {
    titleEl.textContent = texts.client.title;

    this._counters = new ResourceCounters(stoneCounterEl, woodCounterEl, fishCounterEl);
    this._counters.setTotals({ mine: 0, forest: 0, river: 0 });

    this.soundToggle = new SoundToggle(soundButtonEl, soundLabelEl, music);
    this.alertToggle = new AlertToggle(notifyButtonEl, notifyLabelEl, notifier);
  }

  public get counters(): ResourceCounters {
    return this._counters;
  }
}
