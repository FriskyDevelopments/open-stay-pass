export type ProductRail = "hostcasa" | "folios";

export type CredentialState = "active" | "revoked" | "expired";

export type CredentialPayload = {
  tenantId: string;
  propertyId: string;
  stayId: string;
  credentialId: string;
  product: ProductRail;
  expiresAt: number;
};

export type CredentialEnvelope = {
  href: string;
  token: string;
  state: CredentialState;
  product: ProductRail;
};

export type AdapterCapability = "ready" | "configuration_required" | "provider_owned";
