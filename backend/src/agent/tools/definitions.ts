import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const TOOL_DEFINITIONS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "rxnorm_lookup",
      description:
        "Look up a drug by name using the RxNorm API. Returns RxCUI identifiers, drug concepts, and available dosage forms.",
      parameters: {
        type: "object",
        properties: {
          drugName: {
            type: "string",
            description:
              "The name of the drug to look up (e.g. 'aspirin', 'metformin')",
          },
        },
        required: ["drugName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "openfda_adverse_events",
      description:
        "Look up adverse event reports for a drug using its RxCUI identifier from the openFDA API. Returns reactions, severity, and outcomes.",
      parameters: {
        type: "object",
        properties: {
          rxcui: {
            type: "string",
            description:
              "The RxCUI identifier for the drug (obtained from rxnorm_lookup)",
          },
          limit: {
            type: "number",
            description:
              "Maximum number of adverse event reports to return (default 5, max 10)",
          },
        },
        required: ["rxcui"],
      },
    },
  },
];
