import { isClaudeEvent } from "../shared/ClaudeEvent.js";

export class EventPayload {
  private constructor(
    public readonly event: string,
    public readonly sessionId: string,
    public readonly cwd: string,
    public readonly toolName: string | null,
    public readonly agentId: string | null,
    public readonly notificationType: string | null,
  ) {}

  public static fromRaw(raw: unknown): EventPayload | null {
    if (typeof raw !== "object" || raw === null) {
      return null;
    }
    const p = raw as Record<string, unknown>;

    const event = p.hook_event_name;
    const sessionId = p.session_id;
    const cwd = p.cwd;

    if (!isClaudeEvent(event) || typeof sessionId !== "string" || typeof cwd !== "string") {
      return null;
    }

    return new EventPayload(
      event,
      sessionId,
      cwd,
      typeof p.tool_name === "string" ? p.tool_name : null,
      typeof p.agent_id === "string" ? p.agent_id : null,
      typeof p.notification_type === "string" ? p.notification_type : null,
    );
  }
}
