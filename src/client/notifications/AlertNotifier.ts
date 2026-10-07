import type { WorkerState } from "../../domain/workers/WorkerState.js";
import { texts } from "../../shared/texts.js";

type AlertWorker = Pick<WorkerState, "projectName">;

export class AlertNotifier {
  private enabled = false;

  public get isOn(): boolean {
    return this.enabled;
  }

  public get isSupported(): boolean {
    return typeof Notification !== "undefined";
  }

  public async toggle(): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    if (this.enabled) {
      this.enabled = false;
      return;
    }

    this.enabled = (await this.requestPermission()) === "granted";
  }

  public notify(worker: AlertWorker): void {
    if (!this.enabled || !this.isSupported || !document.hidden) {
      return;
    }

    new Notification(texts.client.notificationTitle, {
      body: texts.client.notificationBody(worker.projectName),
    });
  }

  private requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission !== "default") {
      return Promise.resolve(Notification.permission);
    }

    return Notification.requestPermission();
  }
}
