export const TOOL_CONSTANTS = {
  RXNORM_BASE_URL: "https://rxnav.nlm.nih.gov/REST",
  OPENFDA_BASE_URL: "https://api.fda.gov/drug/event.json",
  TIMEOUT_MS: 10_000,
  MAX_RETRIES: 2,
  RETRY_BASE_DELAY_MS: 1_000,
  DEFAULT_ADVERSE_EVENT_LIMIT: 5,
} as const;
