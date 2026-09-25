import { basename } from "node:path";
import { ClaudeEvent, isClaudeEvent } from "./ClaudeEvent.js";

export class EventRecord {
  private constructor(
    public readonly ts: number,
    public readonly event: ClaudeEvent,
    public readonly sessionId: string,
    public readonly projectName: string,
    public readonly toolName: string | null,
    public readonly agentId: string | null,
    public readonly notificationType: string | null,
  ) {}

  public static fromRaw(raw: unknown): EventRecord | null {
    if (typeof raw !== "object" || raw === null) {
      return null;
    }
    const r = raw as Record<string, unknown>;

    const ts = r.ts;
    const event = r.event;
    const sessionId = r.sessionId;
    const cwd = r.cwd;

    if (
      typeof ts !== "number" ||
      !Number.isFinite(ts) ||
      !isClaudeEvent(event) ||
      typeof sessionId !== "string" ||
      typeof cwd !== "string"
    ) {
      return null;
    }

    return new EventRecord(
      ts,
      event,
      sessionId,
      basename(cwd),
      typeof r.toolName === "string" ? r.toolName : null,
      typeof r.agentId === "string" ? r.agentId : null,
      typeof r.notificationType === "string" ? r.notificationType : null,
    );
  }
}
