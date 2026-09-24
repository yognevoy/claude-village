#!/usr/bin/env node
import { EventParser } from "./EventParser.js";
import { EventRepository } from "./EventRepository.js";
import { EventCollector } from "./EventCollector.js";

const parser = new EventParser();
const repository = new EventRepository();
const collector = new EventCollector(parser, repository);

collector.collect();
