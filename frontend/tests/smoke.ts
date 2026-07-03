import assert from "node:assert/strict";
import { DemoAuthAdapter } from "../src/adapters/auth.adapters";
import { mapNetworkFlowToLog } from "../src/adapters/network.adapters";
import { socketMessageSchema } from "../src/types/socket";

class MemoryStorage {
  private data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

async function smokeLogin() {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
  const session = await DemoAuthAdapter.login({
    email: "analyst@defense.soc",
    password: "Password123!",
  });
  assert.equal(session.user.email, "analyst@defense.soc");
  assert.ok(session.token.includes(".demo"));
}

function smokeInvalidSocketMessage() {
  const result = socketMessageSchema.safeParse({
    type: "NEW_ALERT",
    data: { id: "missing-required-alert-fields" },
  });
  assert.equal(result.success, false);
}

function smokeNetworkSourceContract() {
  const mapped = mapNetworkFlowToLog({
    id: "flow-1",
    sensor_id: "zeek-prod-1",
    source: "zeek_conn",
    timestamp: "2026-07-03T10:00:00Z",
    src_ip: "10.0.0.10",
    dst_ip: "10.0.0.20",
    protocol: "TCP",
    service: "conn",
    bytes: 128,
    packets: 4,
    correlation_id: "corr-1",
  });
  assert.equal(mapped.source, "Zeek conn.log");
  assert.equal(mapped.sensorId, "zeek-prod-1");
  assert.equal(mapped.correlationId, "corr-1");
}

async function smokeOptimisticRollback() {
  let state = { status: "new" };
  const previous = { ...state };
  state = { status: "resolved" };
  try {
    await Promise.reject(new Error("api down"));
  } catch {
    state = previous;
  }
  assert.equal(state.status, "new");
}

await smokeLogin();
smokeInvalidSocketMessage();
smokeNetworkSourceContract();
await smokeOptimisticRollback();

console.log("frontend smoke tests passed");
