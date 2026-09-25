import { basename } from "node:path";
import { z } from "zod";
import { ClaudeEvent } from "./ClaudeEvent.js";

const EventRecordSchema = z.object({
  ts: z.number(),
  event: z.enum(ClaudeEvent),
  sessionId: z.string(),
  cwd: z.string(),
  toolName: z.string().nullable().optional(),
  agentId: z.string().nullable().optional(),
  notificationType: z.string().nullable().optional(),
});

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
    const parsed = EventRecordSchema.safeParse(raw);
    if (!parsed.success) {
      return null;
    }

    return new EventRecord(
      parsed.data.ts,
      parsed.data.event,
      parsed.data.sessionId,
      basename(parsed.data.cwd),
      parsed.data.toolName ?? null,
      parsed.data.agentId ?? null,
      parsed.data.notificationType ?? null,
    );
  }
}
