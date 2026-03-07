import { createDemoData } from "@/lib/data/demo-data";
import type {
  LeadRecord,
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
  testDriveRequests: TestDriveRequest[];
  tradeInRequests: TradeInRequest[];
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let demoState: DemoState = clone(createDemoData());

export function getDemoState() {
  return demoState;
}

export function resetDemoState() {
  demoState = clone(createDemoData());
}
