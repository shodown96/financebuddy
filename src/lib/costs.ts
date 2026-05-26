import { Message } from "@anthropic-ai/sdk/resources";

const HAIKU_45_PRICING = {
  inputPerMillion: 1.0,
  outputPerMillion: 5.0,
  cacheWritePerMillion: 1.25,   // 1.25x input price
  cacheReadPerMillion: 0.1,     // 0.1x input price (10%)
  batchDiscountMultiplier: 0.5, // 50% off with Batch API
} as const;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens?: number;
  cacheReadTokens?: number;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cacheWriteCost: number;
  cacheReadCost: number;
  totalCost: number;
  totalTokens: number;
  formattedTotal: string;
}

export function calculateCost(
  usage: TokenUsage,
  isBatch = false
): CostBreakdown {
  const multiplier = isBatch ? HAIKU_45_PRICING.batchDiscountMultiplier : 1;

  const inputCost =
    (usage.inputTokens / 1_000_000) *
    HAIKU_45_PRICING.inputPerMillion *
    multiplier;

  const outputCost =
    (usage.outputTokens / 1_000_000) *
    HAIKU_45_PRICING.outputPerMillion *
    multiplier;

  const cacheWriteCost =
    ((usage.cacheWriteTokens ?? 0) / 1_000_000) *
    HAIKU_45_PRICING.cacheWritePerMillion *
    multiplier;

  const cacheReadCost =
    ((usage.cacheReadTokens ?? 0) / 1_000_000) *
    HAIKU_45_PRICING.cacheReadPerMillion *
    multiplier;

  const totalCost = inputCost + outputCost + cacheWriteCost + cacheReadCost;
  const totalTokens =
    usage.inputTokens +
    usage.outputTokens +
    (usage.cacheWriteTokens ?? 0) +
    (usage.cacheReadTokens ?? 0);

  return {
    inputCost,
    outputCost,
    cacheWriteCost,
    cacheReadCost,
    totalCost,
    totalTokens,
    formattedTotal: `$${totalCost.toFixed(6)}`,
  };
}

// Extract usage directly from an Anthropic SDK response
export function costFromResponse(
  response: Message,
  isBatch = false
): CostBreakdown {
  return calculateCost(
    {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheWriteTokens: response.usage.cache_creation_input_tokens ?? 0,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    },
    isBatch
  );
}

// Accumulate cost across multiple loop iterations
export class CostTracker {
  private breakdown: CostBreakdown = {
    inputCost: 0,
    outputCost: 0,
    cacheWriteCost: 0,
    cacheReadCost: 0,
    totalCost: 0,
    totalTokens: 0,
    formattedTotal: "$0.000000",
  };
  private callCount = 0;

  add(response: Message, isBatch = false): CostBreakdown {
    const cost = costFromResponse(response, isBatch);
    this.breakdown.inputCost += cost.inputCost;
    this.breakdown.outputCost += cost.outputCost;
    this.breakdown.cacheWriteCost += cost.cacheWriteCost;
    this.breakdown.cacheReadCost += cost.cacheReadCost;
    this.breakdown.totalCost += cost.totalCost;
    this.breakdown.totalTokens += cost.totalTokens;
    this.breakdown.formattedTotal = `$${this.breakdown.totalCost.toFixed(6)}`;
    this.callCount++;
    return cost;
  }

  get total(): CostBreakdown {
    return { ...this.breakdown };
  }

  get calls(): number {
    return this.callCount;
  }

  summary(): string {
    const b = this.breakdown;
    return [
      `API calls   : ${this.callCount}`,
      `Total tokens: ${b.totalTokens.toLocaleString()}`,
      `Input cost  : $${b.inputCost.toFixed(6)}`,
      `Output cost : $${b.outputCost.toFixed(6)}`,
      b.cacheWriteCost > 0
        ? `Cache write : $${b.cacheWriteCost.toFixed(6)}`
        : null,
      b.cacheReadCost > 0
        ? `Cache read  : $${b.cacheReadCost.toFixed(6)}`
        : null,
      `─────────────────────────`,
      `Total cost  : ${b.formattedTotal}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
}


// import { ChatCompletion } from "openai/resources";

// const INPUT_PRICE_PER_TOKEN = 0.15 / 1_000_000;
// const OUTPUT_PRICE_PER_TOKEN = 0.6 / 1_000_000;

// export function calculateCost(response: ChatCompletion): number {
//   const inputTokens = response.usage?.prompt_tokens ?? 0;
//   const outputTokens = response.usage?.completion_tokens ?? 0;
//   return inputTokens * INPUT_PRICE_PER_TOKEN + outputTokens * OUTPUT_PRICE_PER_TOKEN;
// }