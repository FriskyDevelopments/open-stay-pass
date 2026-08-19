export type Locale = "es" | "en";

export type CredentialStatus = "active" | "revoked" | "expired";

export type WalletAdapterStatus = {
  platform: "apple" | "google";
  state: "configuration_required" | "ready";
  message: string;
  required: string[];
};

export type IntegrationPlan = {
  name: string;
  category: "Nango" | "Custom";
  state: "available" | "design_required";
  description: string;
};
