export interface SpotSlotsConfig {
  mine: number;
  forest: number;
  river: number;
}

export interface IdleThresholdsConfig {
  campfireAfterSec: number;
  tavernAfterSec: number;
  vanishAfterSec: number;
}

export interface SubagentsConfig {
  maxVisible: number;
  staleSec: number;
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
    mine: 4,
    forest: 4,
    river: 4,
  },
  idle: {
    campfireAfterSec: 120,
    tavernAfterSec: 900,
    vanishAfterSec: 10800,
  },
  subagents: {
    maxVisible: 6,
    staleSec: 30,
  },
  events: {
    maxFileBytes: 5242880,
  },
};

export const DEFAULT_HOST = "127.0.0.1";
