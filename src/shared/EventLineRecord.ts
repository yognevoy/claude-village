export interface EventLineRecord {
  ts: number;
  event: string;
  sessionId: string;
  cwd: string;
  toolName: string | null;
  agentId: string | null;
  notificationType?: string | null;
}
