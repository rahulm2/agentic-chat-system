import { rxnormLookup } from "./rxnorm.ts";
import { openfdaAdverseEvents } from "./openfda.ts";

export interface ToolResult {
  result: unknown;
  isError: boolean;
  durationMs: number;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

const toolHandlers: Record<string, ToolHandler> = {
  rxnorm_lookup: (args) => rxnormLookup(args as { drugName: string }),
  openfda_adverse_events: (args) =>
    openfdaAdverseEvents(args as { rxcui: string; limit?: number }),
};

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  const handler = toolHandlers[toolName];
  if (!handler) {
    return {
      result: { error: `Unknown tool: ${toolName}` },
      isError: true,
      durationMs: 0,
    };
  }

  const start = performance.now();
  try {
    const result = await handler(args);
    return {
      result,
      isError: false,
      durationMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      result: { error: (err as Error).message },
      isError: true,
      durationMs: Math.round(performance.now() - start),
    };
  }
}
