import type { SpotType } from "../spots/SpotType.js";
import { WorkerPhase } from "./WorkerPhase.js";

export class Worker {
  private _projectName: string;
  private _phase: WorkerPhase;
  private _isWorking = false;
  private _hasAlert = false;
  private _hasQuestion = false;
  private _lastEventAt: number;

  public constructor(
    public readonly sessionId: string,
    projectName: string,
    public readonly spotType: SpotType,
    occupiesSlot: boolean,
    createdAt: number,
  ) {
    this._projectName = projectName;
    this._phase = occupiesSlot ? WorkerPhase.AtSpot : WorkerPhase.Queued;
    this._lastEventAt = createdAt;
  }

  public get projectName(): string {
    return this._projectName;
  }

  public get phase(): WorkerPhase {
    return this._phase;
  }

  public get isWorking(): boolean {
    return this._isWorking;
  }

  public get hasAlert(): boolean {
    return this._hasAlert;
  }

  public get hasQuestion(): boolean {
    return this._hasQuestion;
  }

  public get lastEventAt(): number {
    return this._lastEventAt;
  }

  public setPhase(phase: WorkerPhase): void {
    this._phase = phase;
  }

  public isAtSpot(): boolean {
    return this._phase === WorkerPhase.AtSpot;
  }

  public isQueued(): boolean {
    return this._phase === WorkerPhase.Queued;
  }

  public onSessionStart(projectName: string, timestamp: number): void {
    this._projectName = projectName;
    this.touch(timestamp);
  }

  public onPromptSubmit(timestamp: number): void {
    this._hasQuestion = false;
    this.touch(timestamp);
  }

  public onPreTool(timestamp: number): void {
    this._isWorking = true;
    this.touch(timestamp);
  }

  public onPostTool(timestamp: number): void {
    this._isWorking = true;
    this._hasAlert = false;
    this.touch(timestamp);
  }

  public onAlertTriggered(timestamp: number): void {
    this._hasAlert = true;
    this.touch(timestamp);
  }

  public onStop(timestamp: number): void {
    this._hasQuestion = true;
    this._hasAlert = false;
    this._isWorking = false;
    this.touch(timestamp);
  }

  private touch(timestamp: number): void {
    this._lastEventAt = timestamp;
  }
}
