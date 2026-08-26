const requiredApple = [
  "APPLE_PASS_TYPE_ID",
  "APPLE_TEAM_ID",
  "APPLE_CERTIFICATE_P12_BASE64",
];
const requiredGoogle = [
  "GOOGLE_WALLET_ISSUER_ID",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON",
];

const configured = (keys) => keys.every((key) => Boolean(process.env[key]?.trim()));

function validAppleCertificate() {
  const base64 = process.env.APPLE_CERTIFICATE_P12_BASE64?.trim();
  if (!base64) return false;
  try {
    return Buffer.from(base64, "base64").length > 128;
  } catch {
    return false;
  }
}

function validGoogleServiceAccount() {
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return false;
  try {
    const account = JSON.parse(raw);
    return Boolean(account.client_email && account.private_key && account.project_id);
  } catch {
    return false;
  }
}

function googleKeyFormat() {
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return "missing";
  try {
    const account = JSON.parse(raw);
    const key = String(account.private_key ?? "").replace(/\\n/g, "\n");
    if (key.includes("-----BEGIN PRIVATE KEY-----")) return "pkcs8_pem";
    if (key.includes("-----BEGIN RSA PRIVATE KEY-----")) return "rsa_pem";
    if (key.length) return "unrecognized";
    return "missing";
  } catch {
    return "invalid_json";
  }
}

const result = {
  apple: {
    configured: configured(requiredApple),
    certificateFormatValid: validAppleCertificate(),
    passwordProvided: Boolean(process.env.APPLE_CERTIFICATE_PASSWORD),
  },
  google: {
    configured: configured(requiredGoogle),
    serviceAccountFormatValid: validGoogleServiceAccount(),
    privateKeyFormat: googleKeyFormat(),
  },
};

console.log(JSON.stringify(result));
