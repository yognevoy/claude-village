import { Command } from "commander";
import { EventRepository } from "../src/infrastructure/repository/EventRepository.js";
import { SandboxRunner } from "./sandbox/SandboxRunner.js";

const program = new Command();
program
  .name("sandbox")
  .description("Emit a synthetic claude-village event stream for local client development")
  .option("--sessions <count>", "number of parallel sandbox sessions", "8")
  .parse(process.argv);

const options = program.opts<{ sessions: string }>();
const sessionCount = Number.parseInt(options.sessions, 10);

if (!Number.isFinite(sessionCount) || sessionCount <= 0) {
  console.error(`Invalid --sessions value: ${options.sessions}`);
  process.exit(1);
}

const repository = new EventRepository();
const runner = new SandboxRunner(sessionCount, repository);

runner.start();

console.log(`claude-village sandbox: ${sessionCount} sessions running — Ctrl+C to stop`);

process.on("SIGINT", () => {
  runner.stop();
  process.exit(0);
});
