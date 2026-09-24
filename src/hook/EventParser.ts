export interface EventLineRecord {
  ts: number;
  event: string;
  sessionId: string;
  cwd: string;
  toolName: string | null;
  agentId: string | null;
  notificationType?: string | null;
}

export class EventParser {
  private static readonly KNOWN_EVENTS = new Set([
    "SessionStart",
    "UserPromptSubmit",
    "PreToolUse",
    "PermissionRequest",
    "PostToolUse",
    "Notification",
    "Stop",
    "SubagentStart",
    "SubagentStop",
    "SessionEnd",
  ]);

  public parse(rawPayload: unknown, timestamp: number): EventLineRecord | null {
    if (!this.isObject(rawPayload)) {
      return null;
    }

    const event = this.readString(rawPayload, "hook_event_name");
    const sessionId = this.readString(rawPayload, "session_id");
    const cwd = this.readString(rawPayload, "cwd");

    if (!event || !sessionId || !cwd || !EventParser.KNOWN_EVENTS.has(event)) {
      return null;
    }

    const record: EventLineRecord = {
      ts: timestamp,
      event,
      sessionId,
      cwd,
      toolName: this.readString(rawPayload, "tool_name"),
      agentId: this.readString(rawPayload, "agent_id"),
    };

    if (event === "Notification") {
      record.notificationType = this.readString(rawPayload, "notification_type");
    }

    return record;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private readString(payload: Record<string, unknown>, key: string): string | null {
    const value = payload[key];
    return typeof value === "string" ? value : null;
  }
}
