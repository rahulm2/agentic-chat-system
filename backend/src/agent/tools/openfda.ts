export async function openfdaAdverseEvents(
  rxcui: string,
  limit: number,
  apiKey?: string,
): Promise<Record<string, unknown>> {
  try {
    const keyParam = apiKey ? `&api_key=${apiKey}` : "";
    const clampedLimit = Math.min(limit, 10);
    const url = `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.rxcui:${encodeURIComponent(rxcui)}&limit=${clampedLimit}${keyParam}`;
    const res = await fetch(url);
    if (res.status === 404) {
      return {
        message: "No adverse event reports found for this RxCUI.",
        results: [],
      };
    }
    if (!res.ok) {
      return { error: `openFDA API returned ${res.status}` };
    }
    const data = (await res.json()) as {
      meta?: { results?: { total?: number } };
      results?: Array<{
        serious?: number;
        seriousnessdeath?: string;
        seriousnesshospitalization?: string;
        receivedate?: string;
        patient?: {
          patientsex?: string;
          reaction?: Array<{
            reactionmeddrapt?: string;
            reactionoutcome?: string;
          }>;
          drug?: Array<{
            medicinalproduct?: string;
            drugindication?: string;
          }>;
        };
      }>;
    };

    // Extract only relevant fields — full response can be 200KB+ per result
    const reports = (data.results ?? []).map((r) => ({
      serious: r.serious === 1,
      seriousnessDeath: r.seriousnessdeath === "1",
      seriousnessHospitalization: r.seriousnesshospitalization === "1",
      date: r.receivedate,
      patientSex: r.patient?.patientsex,
      reactions: (r.patient?.reaction ?? []).map((rx) => ({
        name: rx.reactionmeddrapt,
        outcome: rx.reactionoutcome,
      })),
      drugs: (r.patient?.drug ?? []).slice(0, 3).map((d) => ({
        name: d.medicinalproduct,
        indication: d.drugindication,
      })),
    }));

    return {
      totalReports: data.meta?.results?.total ?? 0,
      reports,
    };
  } catch (err) {
    return {
      error: `openFDA lookup failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
