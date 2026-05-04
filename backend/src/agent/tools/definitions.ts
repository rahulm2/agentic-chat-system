import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const rxnormTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "rxnorm_lookup",
    description:
      "Look up a drug by name using the RxNorm API. Returns RxCUI identifiers, drug concepts, and dosage forms. Use this when a user asks about a specific medication.",
    parameters: {
      type: "object",
      properties: {
        drugName: {
          type: "string",
          description: "The name of the drug to look up (e.g., 'aspirin', 'metformin')",
        },
      },
      required: ["drugName"],
    },
  },
};

export const openfdaTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "openfda_adverse_events",
    description:
      "Look up adverse event reports for a drug using its RxCUI identifier via the openFDA API. Returns reported reactions, severity, and patient outcomes. Use this after looking up a drug with rxnorm_lookup to find its RxCUI.",
    parameters: {
      type: "object",
      properties: {
        rxcui: {
          type: "string",
          description: "The RxCUI identifier of the drug (obtained from rxnorm_lookup)",
        },
        limit: {
          type: "number",
          description: "Maximum number of adverse event reports to return (default: 5, max: 100)",
        },
      },
      required: ["rxcui"],
    },
  },
};

export const toolDefinitions: ChatCompletionTool[] = [rxnormTool, openfdaTool];
