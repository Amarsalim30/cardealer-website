import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { isE2ETestRuntime } from "@/lib/env";
import { createDemoData } from "@/lib/data/demo-data";
import type {
  LeadRecord,
  LeadWorkflowStateRecord,
  Location,
  Review,
  TestDriveRequest,
  TradeInRequest,
  Vehicle,
} from "@/types/dealership";

type DemoState = {
  vehicles: Vehicle[];
  locations: Location[];
  reviews: Review[];
  leads: LeadRecord[];
  leadWorkflowStates: LeadWorkflowStateRecord[];
  testDriveRequests: TestDriveRequest[];
  tradeInRequests: TradeInRequest[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const E2E_DEMO_STATE_PATH = join(process.cwd(), ".next", "e2e-demo-state.json");

let demoState: DemoState = clone(createDemoData());

function writeE2EDemoState(state: DemoState) {
  mkdirSync(dirname(E2E_DEMO_STATE_PATH), { recursive: true });
  writeFileSync(E2E_DEMO_STATE_PATH, JSON.stringify(state), "utf8");
}

function readE2EDemoState() {
  if (!existsSync(E2E_DEMO_STATE_PATH)) {
    const initialState = clone(createDemoData());
    writeE2EDemoState(initialState);
    return initialState;
  }

  return JSON.parse(readFileSync(E2E_DEMO_STATE_PATH, "utf8")) as DemoState;
}

export function getDemoState() {
  if (isE2ETestRuntime) {
    demoState = readE2EDemoState();
  }

  return demoState;
}

export function mutateDemoState<T>(mutator: (state: DemoState) => T) {
  const state = getDemoState();
  const result = mutator(state);

  if (isE2ETestRuntime) {
    writeE2EDemoState(state);
  }

  demoState = state;
  return result;
}

export function resetDemoState() {
  demoState = clone(createDemoData());

  if (isE2ETestRuntime) {
    writeE2EDemoState(demoState);
  }
}
