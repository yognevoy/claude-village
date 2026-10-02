import type { Worker } from "./Worker.js";

export class EventResult {
  public constructor(public readonly promoted: Worker | null) {}

  public static empty(): EventResult {
    return new EventResult(null);
  }
}
