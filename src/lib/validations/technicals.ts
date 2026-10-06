import { z } from "zod";

export const ExplanationSchema = z.object({
  mood: z
    .enum(["positive", "negative", "mixed", "unclear"])
    .describe("Overall picture the chart paints right now"),
  headline: z.string().describe("One plain-English sentence, at most 20 words, no jargon"),
  whatsHappening: z
    .string()
    .describe("2 to 3 short sentences on what the price has been doing and whether that is speeding up or slowing down"),
  ifBuying: z
    .string()
    .describe(
      "2 to 3 sentences for someone thinking of buying: is this a calm or a stretched moment, and what a cautious person might wait to see first",
    ),
  ifHolding: z
    .string()
    .describe("2 to 3 sentences for someone who already owns it: what would be reassuring and what would be a warning sign"),
  watchFor: z
    .array(z.string())
    .describe("2 or 3 concrete price levels in plain words, e.g. \"If it drops below NGN 240, the recent floor has broken\""),
});

export type Explanation = z.infer<typeof ExplanationSchema>;
