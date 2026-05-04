import { ToolError } from "@/common/errors.ts";
import { fetchWithRetry } from "./fetch-with-retry.ts";
import { TOOL_CONSTANTS } from "./constants.ts";

interface OpenFDAEvent {
  patient?: {
    reaction?: { reactionmeddrapt: string }[];
    drug?: { medicinalproduct: string; drugindication?: string }[];
  };
  serious?: number;
  seriousnessdeath?: number;
  seriousnesshospitalization?: number;
}

interface OpenFDAResponse {
  meta?: { results?: { total: number } };
  results?: OpenFDAEvent[];
  error?: { code: string; message: string };
}

export interface AdverseEventResult {
  rxcui: string;
  totalResults: number;
  events: {
    reactions: string[];
    serious: boolean;
    death: boolean;
    hospitalization: boolean;
    drugs: string[];
  }[];
}

export async function openfdaAdverseEvents(args: {
  rxcui: string;
  limit?: number;
}): Promise<AdverseEventResult> {
  const limit = args.limit ?? TOOL_CONSTANTS.DEFAULT_ADVERSE_EVENT_LIMIT;
  let url = `${TOOL_CONSTANTS.OPENFDA_BASE_URL}?search=openfda.rxcui:${encodeURIComponent(args.rxcui)}&limit=${limit}`;

  const apiKey = process.env.OPENFDA_API_KEY;
  if (apiKey) {
    url += `&api_key=${apiKey}`;
  }

  const res = await fetchWithRetry(url, {
    toolName: "openfda_adverse_events",
    allowedStatuses: [404],
  });

  if (res.status === 404) {
    return { rxcui: args.rxcui, totalResults: 0, events: [] };
  }

  const data = (await res.json()) as OpenFDAResponse;

  if (data.error) {
    throw new ToolError(
      `openFDA API: ${data.error.message}`,
      "openfda_adverse_events",
    );
  }

  const events = (data.results ?? []).map((event) => ({
    reactions: event.patient?.reaction?.map((r) => r.reactionmeddrapt) ?? [],
    serious: event.serious === 1,
    death: event.seriousnessdeath === 1,
    hospitalization: event.seriousnesshospitalization === 1,
    drugs: event.patient?.drug?.map((d) => d.medicinalproduct) ?? [],
  }));

  return {
    rxcui: args.rxcui,
    totalResults: data.meta?.results?.total ?? events.length,
    events,
  };
}
