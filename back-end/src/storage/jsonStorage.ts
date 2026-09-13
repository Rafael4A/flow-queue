import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { QueueState } from "shared-code";

const __dirname = dirname(fileURLToPath(import.meta.url));

const filePath = join(__dirname, "../../data/state.json");
const tempFilePath = join(__dirname, "../../data/state.temp.json");

export function loadState(): QueueState {
  const fileExists = existsSync(filePath);

  if (fileExists) {
    const fileContent = readFileSync(filePath, "utf-8");
    const isoDatePattern =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:Z|[+-]\d{2}:\d{2})$/;

    return JSON.parse(fileContent, (key, value) => {
      if (typeof value === "string" && isoDatePattern.test(value))
        return new Date(value);

      return value;
    }) as QueueState;
  }

  return {
    priorityCounter: 0,
    sequences: { CONVENTIONAL: 0, PRIORITY: 0 },
    tickets: [],
  };
}

export function saveState(state: QueueState): void {
  const fileContent = JSON.stringify(state, null, 2);

  writeFileSync(tempFilePath, fileContent, "utf-8");

  renameSync(tempFilePath, filePath);
}
