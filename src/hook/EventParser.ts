import { EventPayload } from "./EventPayload.js";
import type { EventLineRecord } from "./EventParser.types.js";

export class EventParser {
  public parse(rawPayload: unknown, timestamp: number): EventLineRecord | null {
    const payload = EventPayload.fromRaw(rawPayload);
    if (!payload) {
      return null;
    }

    return {
      ts: timestamp,
      event: payload.event,
      sessionId: payload.sessionId,
      cwd: payload.cwd,
      toolName: payload.toolName,
      agentId: payload.agentId,
      ...(payload.event === "Notification" && { notificationType: payload.notificationType }),
    };
  }
}
