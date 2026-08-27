import { randomBytes } from "node:crypto";

// Tests must never depend on deployment secrets. This ephemeral value exists
// only inside the Vitest process; production still validates its own secret at startup.
if (!process.env.CREDENTIAL_HMAC_SECRET || process.env.CREDENTIAL_HMAC_SECRET.length < 32) {
  process.env.CREDENTIAL_HMAC_SECRET = randomBytes(48).toString("base64url");
}
