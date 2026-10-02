import { ClaudeEvent } from "../events/ClaudeEvent.js";
import type { EventRecord } from "../events/EventRecord.js";
import type { ResourceCounters } from "../resources/ResourceCounters.js";
import type { Worker } from "./Worker.js";
import { EventResult } from "./EventResult.js";

export interface WorkerLifecycle {
  spawn(record: EventRecord): Worker;
  wake(worker: Worker): void;
  remove(worker: Worker): Worker | null;
}

export class WorkerEventDispatcher {
  public constructor(
    private readonly registry: WorkerLifecycle,
    private readonly resources: ResourceCounters,
  ) {}

  public apply(record: EventRecord): EventResult {
    switch (record.event) {
      case ClaudeEvent.SessionStart:
        this.handleSessionStart(record);
        return EventResult.empty();

      case ClaudeEvent.UserPromptSubmit:
        this.handleUserPromptSubmit(record);
        return EventResult.empty();

      case ClaudeEvent.PreToolUse:
        this.handlePreToolUse(record);
        return EventResult.empty();

      case ClaudeEvent.PermissionRequest:
        this.handlePermissionRequest(record);
        return EventResult.empty();

      case ClaudeEvent.PostToolUse:
        this.handlePostToolUse(record);
        return EventResult.empty();

      case ClaudeEvent.Notification:
        this.handleNotification(record);
        return EventResult.empty();

      case ClaudeEvent.Stop:
        this.handleStop(record);
        return EventResult.empty();

      case ClaudeEvent.SubagentStart:
        this.handleSubagentStart(record);
        return EventResult.empty();

      case ClaudeEvent.SubagentStop:
        this.handleSubagentStop(record);
        return EventResult.empty();

      case ClaudeEvent.SessionEnd:
        return this.handleSessionEnd(record);
    }
  }

  private handleSessionStart(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    worker.onSessionStart(record.projectName, record.ts);
  }

  private handleUserPromptSubmit(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    worker.onPromptSubmit(record.ts);
    this.registry.wake(worker);
  }

  private handlePreToolUse(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    if (record.agentId !== null) {
      worker.onSubagentActivity(record.agentId, record.ts);
    }

    worker.onPreTool(record.ts);
    this.registry.wake(worker);
  }

  private handlePermissionRequest(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    if (record.agentId !== null) {
      worker.onSubagentActivity(record.agentId, record.ts);
    }

    worker.onAlertTriggered(record.ts);
    this.registry.wake(worker);
  }

  private handlePostToolUse(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    if (record.agentId !== null) {
      worker.onSubagentActivity(record.agentId, record.ts);
    }

    worker.onPostTool(record.ts);
    this.registry.wake(worker);
    this.resources.increment(worker.spotType);
  }

  private handleNotification(record: EventRecord): void {
    if (record.notificationType === "idle_prompt") {
      this.registry.spawn(record);
      return;
    }

    const worker = this.registry.spawn(record);

    worker.onAlertTriggered(record.ts);
    this.registry.wake(worker);
  }

  private handleStop(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    worker.onStop(record.ts);
    this.registry.wake(worker);
  }

  private handleSessionEnd(record: EventRecord): EventResult {
    const worker = this.registry.spawn(record);
    const promoted = this.registry.remove(worker);

    if (promoted === null) {
      return EventResult.empty();
    }

    return new EventResult(promoted);
  }

  private handleSubagentStart(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    if (record.agentId === null) {
      return;
    }

    worker.onSubagentActivity(record.agentId, record.ts);
    this.registry.wake(worker);
  }

  private handleSubagentStop(record: EventRecord): void {
    const worker = this.registry.spawn(record);

    if (record.agentId === null) {
      return;
    }

    worker.onSubagentStop(record.agentId);
    this.registry.wake(worker);
  }
}
