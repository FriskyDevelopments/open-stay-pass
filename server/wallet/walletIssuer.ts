import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import forge from "node-forge";
import { PKPass } from "passkit-generator";
import type { Locale } from "../../shared/openStay";

type IssuedFoliosPass = {
  title: string;
  invoiceNumber: string;
  invoiceStatus: "issued";
  ownerName: string;
  handoffUrl: string;
  serial: string;
  updatedAt?: Date | null;
};

function requireEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required Wallet configuration: ${key}`);
  return value;
}

export function walletReadiness(platform: "apple" | "google") {
  if (platform === "apple") {
    try {
      if (!process.env.APPLE_PASS_TYPE_ID?.trim() || !process.env.APPLE_TEAM_ID?.trim()) return false;
      decodeAppleSigner();
      return true;
    } catch {
      return false;
    }
  }

  try {
    const account = JSON.parse(requireEnv("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON"));
    if (!process.env.GOOGLE_WALLET_ISSUER_ID?.trim() || !account.client_email || !account.private_key) return false;
    createGoogleJwt({ iss: account.client_email, iat: 0 }, String(account.private_key).replace(/\\n/g, "\n"));
    return true;
  } catch {
    return false;
  }
}

function decodeAppleSigner() {
  const p12Der = forge.util.decode64(requireEnv("APPLE_CERTIFICATE_P12_BASE64"));
  const asn1 = forge.asn1.fromDer(p12Der);
  const configuredPassword = process.env.APPLE_CERTIFICATE_PASSWORD ?? "";
  const candidates = Array.from(new Set([configuredPassword, configuredPassword.trim(), ""])) as string[];
  let p12: forge.pkcs12.Pkcs12Pfx | undefined;
  for (const password of candidates) {
    try {
      p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
      break;
    } catch {
      // Try the explicitly empty-password form before reporting an invalid signing bundle.
    }
  }
  if (!p12) {
    throw new Error("Apple Wallet P12 bundle could not be opened. Verify the certificate password and bundle format.");
  }
  const certificateBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? [];
  const privateKeyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] ?? [];
  const certificate = certificateBags.find((bag) => bag.cert)?.cert;
  const privateKey = privateKeyBags.find((bag) => bag.key)?.key;

  if (!certificate || !privateKey) {
    throw new Error("Apple Wallet P12 bundle does not contain a signing certificate and private key.");
  }

  return {
    signerCert: Buffer.from(forge.pki.certificateToPem(certificate)),
    signerKey: Buffer.from(forge.pki.privateKeyToPem(privateKey)),
  };
}

export async function createAppleFoliosPass(passData: IssuedFoliosPass, locale: Locale) {
  if (!walletReadiness("apple")) {
    throw new Error("Apple Wallet is not fully configured.");
  }

  const signer = decodeAppleSigner();
  const wwdr = await readFile(fileURLToPath(new URL("./apple-wwdr-g4.pem", import.meta.url)));
  const icon = await readFile(fileURLToPath(new URL("./folios-icon.png", import.meta.url)));
  const pass = new PKPass(
    { "icon.png": icon, "icon@2x.png": icon },
    { wwdr, ...signer },
    {
      formatVersion: 1,
      passTypeIdentifier: requireEnv("APPLE_PASS_TYPE_ID"),
      teamIdentifier: requireEnv("APPLE_TEAM_ID"),
      organizationName: "Folios",
      description: locale === "es" ? "Registro fiscal Folios" : "Folios fiscal record",
      serialNumber: passData.serial,
      backgroundColor: "rgb(245,242,236)",
      foregroundColor: "rgb(17,26,28)",
      labelColor: "rgb(91,103,106)",
      logoText: "FOLIOS",
      webServiceURL: process.env.WALLET_UPDATE_BASE_URL || undefined,
      authenticationToken: process.env.WALLET_AUTH_TOKEN || undefined,
    },
  );

  pass.type = "generic";
  pass.primaryFields.push({ key: "invoice", label: locale === "es" ? "FACTURA EMITIDA" : "INVOICE ISSUED", value: passData.invoiceNumber });
  pass.secondaryFields.push({ key: "record", label: locale === "es" ? "REGISTRO" : "RECORD", value: passData.title });
  pass.auxiliaryFields.push({ key: "owner", label: locale === "es" ? "RESPONSABLE" : "OWNER", value: passData.ownerName });
  pass.backFields.push({ key: "verify", label: locale === "es" ? "VERIFICAR EN FOLIOS" : "VERIFY IN FOLIOS", value: passData.handoffUrl });
  pass.backFields.push({ key: "continuity", label: locale === "es" ? "LINK DINÁMICO" : "DYNAMIC LINK", value: locale === "es" ? "Este pase se actualiza desde el mismo enlace seguro de Folios." : "This pass is updated from the same secure Folios link." });
  pass.setBarcodes(passData.handoffUrl);
  if (passData.updatedAt) pass.setRelevantDate(passData.updatedAt);

  return pass.getAsBuffer();
}

function createGoogleJwt(payload: Record<string, unknown>, privateKey: string) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const input = `${header}.${body}`;
  const signer = createSign("RSA-SHA256");
  signer.update(input);
  signer.end();
  return `${input}.${signer.sign(privateKey).toString("base64url")}`;
}

export function createGoogleFoliosSaveUrl(passData: IssuedFoliosPass, locale: Locale) {
  if (!walletReadiness("google")) {
    throw new Error("Google Wallet is not fully configured.");
  }

  const serviceAccount = JSON.parse(requireEnv("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON"));
  const issuerId = requireEnv("GOOGLE_WALLET_ISSUER_ID");
  const objectId = `${issuerId}.${passData.serial.replace(/[^A-Za-z0-9._-]/g, "-")}`;
  const now = Math.floor(Date.now() / 1000);
  const jwt = createGoogleJwt({
    iss: serviceAccount.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: now,
    origins: [],
    payload: {
      genericObjects: [{
        id: objectId,
        classId: `${issuerId}.folios_cfdi`,
        state: "ACTIVE",
        cardTitle: { defaultValue: { language: "es", value: "FOLIOS · CFDI" } },
        header: { defaultValue: { language: locale, value: passData.invoiceNumber } },
        subheader: { defaultValue: { language: locale, value: locale === "es" ? "Factura emitida" : "Invoice issued" } },
        heroImage: undefined,
        barcode: { type: "QR_CODE", value: passData.handoffUrl },
        textModulesData: [
          { id: "record", header: locale === "es" ? "Registro" : "Record", body: passData.title },
          { id: "owner", header: locale === "es" ? "Responsable" : "Owner", body: passData.ownerName },
        ],
        linksModuleData: { uris: [{ id: "folios-verify", uri: passData.handoffUrl, description: locale === "es" ? "Verificar en Folios" : "Verify in Folios" }] },
      }],
    },
  }, String(serviceAccount.private_key).replace(/\\n/g, "\n"));

  return `https://pay.google.com/gp/v/save/${jwt}`;
}

export async function verifyGoogleWalletCredentials() {
  const serviceAccount = JSON.parse(requireEnv("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON"));
  const now = Math.floor(Date.now() / 1000);
  const assertion = createGoogleJwt({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 300,
  }, String(serviceAccount.private_key).replace(/\\n/g, "\n"));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google Wallet service account authorization failed with status ${response.status}.`);
  const result = await response.json() as { access_token?: string };
  if (!result.access_token) throw new Error("Google Wallet service account authorization did not return an access token.");
  return true;
}
