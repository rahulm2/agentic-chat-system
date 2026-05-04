export async function rxnormLookup(
  drugName: string,
): Promise<Record<string, unknown>> {
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { error: `RxNorm API returned ${res.status}` };
    }
    const data = (await res.json()) as {
      drugGroup?: {
        name?: string;
        conceptGroup?: Array<{
          tty?: string;
          conceptProperties?: Array<{
            rxcui: string;
            name: string;
            tty: string;
          }>;
        }>;
      };
    };

    // Extract only the fields the LLM needs — full response can be 30KB+
    const concepts: Array<{ rxcui: string; name: string; tty: string }> = [];
    for (const group of data.drugGroup?.conceptGroup ?? []) {
      for (const prop of (group.conceptProperties ?? []).slice(0, 5)) {
        concepts.push({
          rxcui: prop.rxcui,
          name: prop.name,
          tty: prop.tty,
        });
      }
    }

    return {
      drugName: data.drugGroup?.name ?? drugName,
      concepts,
    };
  } catch (err) {
    return {
      error: `RxNorm lookup failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
