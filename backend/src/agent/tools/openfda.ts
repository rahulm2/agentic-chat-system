const OPENFDA_BASE = "https://api.fda.gov/drug/event.json";
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

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

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) return res;

      // Rate limit - retry with backoff
      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      // 404 means no results
      if (res.status === 404) {
        return res;
      }
      if (res.status === 429) {
        throw new Error("openFDA API rate limit exceeded. Please try again later.");
      }
      throw new Error(`openFDA API error: ${res.status} ${res.statusText}`);
    } catch (err) {
      if (attempt < retries && (err as Error).name === "AbortError") {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      if ((err as Error).name === "AbortError") {
        throw new Error("openFDA API request timed out");
      }
      throw err;
    }
  }
  throw new Error("openFDA API: max retries exceeded");
}

export async function openfdaAdverseEvents(args: {
  rxcui: string;
  limit?: number;
}): Promise<AdverseEventResult> {
  const limit = args.limit ?? 5;
  let url = `${OPENFDA_BASE}?search=openfda.rxcui:${encodeURIComponent(args.rxcui)}&limit=${limit}`;

  const apiKey = process.env.OPENFDA_API_KEY;
  if (apiKey) {
    url += `&api_key=${apiKey}`;
  }

  const res = await fetchWithRetry(url);

  if (res.status === 404) {
    return { rxcui: args.rxcui, totalResults: 0, events: [] };
  }

  const data = (await res.json()) as OpenFDAResponse;

  if (data.error) {
    throw new Error(`openFDA API: ${data.error.message}`);
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
