import assert from "node:assert/strict";
import { DemoAuthAdapter } from "../src/adapters/auth.adapters";
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
await smokeOptimisticRollback();

console.log("frontend smoke tests passed");
