import { RectOccupancy } from "../RectOccupancy.js";
import { MapObject } from "./MapObject.js";

export interface FeatureGenerator {
  generate(occupancy: RectOccupancy): MapObject[];
}
