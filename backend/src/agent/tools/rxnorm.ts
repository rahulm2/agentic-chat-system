import { ToolNotFoundError } from "@/common/errors.ts";
import { fetchWithRetry } from "./fetch-with-retry.ts";
import { TOOL_CONSTANTS } from "./constants.ts";

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

export async function rxnormLookup(args: { drugName: string }): Promise<RxNormResult> {
  const url = `${TOOL_CONSTANTS.RXNORM_BASE_URL}/drugs.json?name=${encodeURIComponent(args.drugName)}`;
  const res = await fetchWithRetry(url, { toolName: "rxnorm_lookup" });
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
    throw new ToolNotFoundError(args.drugName);
  }

  return { drugName: args.drugName, rxcuis };
}
