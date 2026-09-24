export enum ClaudeEvent {
  SessionStart = "SessionStart",
  UserPromptSubmit = "UserPromptSubmit",
  PreToolUse = "PreToolUse",
  PermissionRequest = "PermissionRequest",
  PostToolUse = "PostToolUse",
  Notification = "Notification",
  Stop = "Stop",
  SubagentStart = "SubagentStart",
  SubagentStop = "SubagentStop",
  SessionEnd = "SessionEnd",
}

export const isClaudeEvent = (value: unknown): value is ClaudeEvent => {
  return Object.values(ClaudeEvent).includes(value as ClaudeEvent);
};
