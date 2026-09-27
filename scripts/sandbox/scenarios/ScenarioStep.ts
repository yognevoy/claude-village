import type { ClaudeEvent } from "../../../src/domain/events/ClaudeEvent.js";

export interface ScenarioStep {
  event: ClaudeEvent;
  delayMs: number;
  toolName?: string;
  agentId?: string;
  notificationType?: string;
}
