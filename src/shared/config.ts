export interface SpotSlotsConfig {
  mine: number;
  forest: number;
  river: number;
}

export interface IdleThresholdsConfig {
  restAfterSec: number;
  leaveAfterSec: number;
}

export interface SubagentsConfig {
  maxVisible: number;
  idleSec: number;
}

export interface EventsConfig {
  maxFileBytes: number;
}

export interface Config {
  port: number;
  spots: SpotSlotsConfig;
  idle: IdleThresholdsConfig;
  subagents: SubagentsConfig;
  events: EventsConfig;
}

export const DEFAULT_CONFIG: Config = {
  port: 4791,
  spots: {
    mine: 2,
    forest: 2,
    river: 2,
  },
  idle: {
    restAfterSec: 300,
    leaveAfterSec: 600,
  },
  subagents: {
    maxVisible: 6,
    idleSec: 30,
  },
  events: {
    maxFileBytes: 5242880,
  },
};

export const DEFAULT_HOST = "127.0.0.1";
