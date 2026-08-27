import { randomBytes } from "node:crypto";

// Tests must never depend on deployment secrets. This ephemeral value exists
// only inside the Vitest process; production still validates its own secret at startup.
for (const key of ["CREDENTIAL_HMAC_SECRET", "JWT_SECRET"]) {
  if (!process.env[key] || process.env[key]!.length < 32) {
    process.env[key] = randomBytes(48).toString("base64url");
  }
}
