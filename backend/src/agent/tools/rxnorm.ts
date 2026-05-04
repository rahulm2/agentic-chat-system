const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

interface RxNormDrugGroup {
  name: string;
  conceptGroup?: {
    tty: string;
    conceptProperties?: {
      rxcui: string;
      name: string;
      tty: string;
    }[];
  }[];
}

interface RxNormResponse {
  drugGroup: RxNormDrugGroup;
}

export interface RxNormResult {
  drugName: string;
  rxcuis: { rxcui: string; name: string; tty: string }[];
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) return res;
      if (res.status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      throw new Error(`RxNorm API error: ${res.status} ${res.statusText}`);
    } catch (err) {
      if (attempt < retries && (err as Error).name === "AbortError") {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      if ((err as Error).name === "AbortError") {
        throw new Error("RxNorm API request timed out");
      }
      throw err;
    }
  }
  throw new Error("RxNorm API: max retries exceeded");
}

export async function rxnormLookup(args: { drugName: string }): Promise<RxNormResult> {
  const url = `${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(args.drugName)}`;
  const res = await fetchWithRetry(url);
  const data = (await res.json()) as RxNormResponse;

  const rxcuis: RxNormResult["rxcuis"] = [];
  if (data.drugGroup?.conceptGroup) {
    for (const group of data.drugGroup.conceptGroup) {
      if (group.conceptProperties) {
        for (const prop of group.conceptProperties) {
          rxcuis.push({
            rxcui: prop.rxcui,
            name: prop.name,
            tty: prop.tty,
          });
        }
      }
    }
  }

  if (rxcuis.length === 0) {
    throw new Error(`No drugs found for "${args.drugName}"`);
  }

  return { drugName: args.drugName, rxcuis };
}
