export enum SpriteId {
  WorkerStand = "workerStand",
  WorkerWalk = "workerWalk",
  WorkerWork = "workerWork",
  SignExclaim = "signExclaim",
  SignQuestion = "signQuestion",
  SignSleep = "signSleep",
  TownHall = "townHall",
  Campfire = "campfire",
  Tree = "tree",
  Grass = "grass",
  Stone = "stone",
  Water = "water",
  Ore = "ore",
}

export const SPRITE_IDS: readonly SpriteId[] = Object.values(SpriteId);
