import { TRPCError } from "@trpc/server";
import { getCredentialById } from "./openStayDb";
import { credentialAccessState } from "./credentialService";
import { getPreviewStay } from "./previewStay";

export async function resolvePublicCredential(token: string, scope: "arrival" | "handoff") {
  const previewStay = getPreviewStay(token);
  if (previewStay && scope === "arrival") return previewStay.credential;

  const encodedPayload = token.split(".")[0];
  if (!encodedPayload) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential link is invalid or expired." });
  }

  let credentialId: string;
  try {
    credentialId = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")).credentialId;
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential link is invalid or expired." });
  }

  const credential = await getCredentialById(credentialId);
  if (!credential) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential is no longer valid." });
  }

  const state = credentialAccessState({
    token,
    expectedScope: scope,
    storedTokenHash: credential.tokenHash,
    status: credential.status,
    expiresAt: credential.expiresAt,
  });

  if (state === "revoked") {
    throw new TRPCError({ code: "FORBIDDEN", message: "This credential has been revoked by the operator." });
  }
  if (state === "expired") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential has expired." });
  }
  if (state !== "active") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential link is invalid or expired." });
  }

  return credential;
}
