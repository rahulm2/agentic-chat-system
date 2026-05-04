import { ToolError } from "@/common/errors.ts";
import { rxnormLookup, type RxNormResult } from "./rxnorm.ts";
import { openfdaAdverseEvents, type AdverseEventResult } from "./openfda.ts";

export interface ToolResult {
  result: unknown;
  isError: boolean;
  durationMs: number;
}

interface ToolDefinition<TArgs, TResult> {
  handler: (args: TArgs) => Promise<TResult>;
}

interface ToolRegistry {
  rxnorm_lookup: ToolDefinition<{ drugName: string }, RxNormResult>;
  openfda_adverse_events: ToolDefinition<{ rxcui: string; limit?: number }, AdverseEventResult>;
}

export type ToolName = keyof ToolRegistry;

const toolRegistry: ToolRegistry = {
  rxnorm_lookup: { handler: rxnormLookup },
  openfda_adverse_events: { handler: openfdaAdverseEvents },
};

function isRegisteredTool(name: string): name is ToolName {
  return name in toolRegistry;
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  if (!isRegisteredTool(toolName)) {
    throw new ToolError(`Unknown tool: ${toolName}`, toolName);
  }

  const { handler } = toolRegistry[toolName];
  const start = performance.now();

  try {
    const result = await handler(args as never);
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
