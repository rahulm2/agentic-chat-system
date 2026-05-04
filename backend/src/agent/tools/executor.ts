import { rxnormLookup } from "./rxnorm.ts";
import { openfdaAdverseEvents } from "./openfda.ts";

export interface ToolExecutorConfig {
  openfdaApiKey?: string;
}

export class ToolExecutor {
  constructor(private config: ToolExecutorConfig = {}) {}

  async execute(
    name: string,
    args: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (name) {
      case "rxnorm_lookup":
        return rxnormLookup(args.drugName as string);
      case "openfda_adverse_events":
        return openfdaAdverseEvents(
          args.rxcui as string,
          (args.limit as number) ?? 5,
          this.config.openfdaApiKey,
        );
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }
}
