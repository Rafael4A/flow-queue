import * as fs from "node:fs";
import * as path from "node:path";
import type { QueueState } from "shared-code";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadState, saveState } from "./jsonStorage";

function createTempState(): QueueState {
  return {
    priorityCounter: 5,
    sequences: { CONVENTIONAL: 10, PRIORITY: 7 },
    tickets: [
      {
        id: "PRI-001",
        type: "PRIORITY",
        status: "CALLED",
        deskId: "Desk 1",
        callCount: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        calledAt: new Date("2026-01-01T01:00:00Z"),
      },
      {
        id: "CON-002",
        type: "CONVENTIONAL",
        status: "ISSUED",
        callCount: 0,
        createdAt: new Date("2026-01-02T00:00:00Z"),
      },
    ],
  };
}

const filePath = path.join(__dirname, "../../data/state.json");
const backupPath = path.join(__dirname, "../../data/state.backup.json");
describe("jsonStorage", () => {
  beforeAll(() => {
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
      fs.unlinkSync(filePath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
    }
  });

  it("B1.7.1 - should save and load state with round trip", () => {
    const state = createTempState();
    saveState(state);

    const loaded = loadState();

    expect(loaded.priorityCounter).toBe(5);
    expect(loaded.sequences.CONVENTIONAL).toBe(10);
    expect(loaded.sequences.PRIORITY).toBe(7);
    expect(loaded.tickets).toHaveLength(2);
    expect(loaded.tickets[0]!.id).toBe("PRI-001");
    expect(loaded.tickets[0]!.status).toBe("CALLED");
    expect(loaded.tickets[0]!.calledAt).toBeInstanceOf(Date);
    expect(loaded.tickets[0]!.calledAt!.toISOString()).toBe(
      "2026-01-01T01:00:00.000Z",
    );
    expect(loaded.tickets[1]!.createdAt).toBeInstanceOf(Date);
  });

  it("B1.7.2 - should return default state when file does not exist", () => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const loaded = loadState();

    expect(loaded.priorityCounter).toBe(0);
    expect(loaded.sequences.CONVENTIONAL).toBe(0);
    expect(loaded.sequences.PRIORITY).toBe(0);
    expect(loaded.tickets).toEqual([]);
  });

  it("B1.7.3 - should rename temp file after save (atomic write)", () => {
    const state = createTempState();
    const tempPath = path.join(__dirname, "../../data/state.temp.json");
    saveState(state);

    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.existsSync(tempPath)).toBe(false);
  });

  it("B1.7.4 - should parse ISO dates with various formats", () => {
    const dir = path.join(__dirname, "../../data");
    const statePath = path.join(dir, "state.json");

    const json = JSON.stringify({
      priorityCounter: 0,
      sequences: { CONVENTIONAL: 0, PRIORITY: 0 },
      tickets: [
        {
          id: "T1",
          type: "PRIORITY",
          status: "ISSUED",
          callCount: 0,
          createdAt: new Date("2026-01-01T00:00:00Z"),
        },
        {
          id: "T2",
          type: "CONVENTIONAL",
          status: "ISSUED",
          callCount: 0,
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
        {
          id: "T3",
          type: "PRIORITY",
          status: "ISSUED",
          callCount: 0,
          createdAt: new Date("2026-01-03T00:00:00+00:00"),
        },
      ],
    });

    fs.writeFileSync(statePath, json, "utf-8");

    const loaded = loadState();

    expect(loaded.tickets[0]!.createdAt).toBeInstanceOf(Date);
    expect(loaded.tickets[1]!.createdAt).toBeInstanceOf(Date);
    expect(loaded.tickets[2]!.createdAt).toBeInstanceOf(Date);

    fs.unlinkSync(statePath);
  });
});
