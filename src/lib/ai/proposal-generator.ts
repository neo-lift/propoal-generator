import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildPrompt } from "@/lib/prompt/builder";
import type {
  CustomerInput,
  EventDetails,
  Preferences,
  AvailableProducts,
  AIProposalDraft,
} from "@/lib/prompt/types";

const proposalSchema = z.object({
  title_md: z.string(),
  description_md: z.string(),
  data: z.record(z.string(), z.any()).default({}),
  blocks: z.array(z.object({ content_id: z.number() })).default([]),
  attachments: z.array(z.object({ url: z.string(), mime_type: z.string().optional(), name: z.string().optional() })).default([]),
});

interface GenerateProposalDraftProps {
  customer: CustomerInput;
  event: EventDetails;
  preferences: Preferences;
  requestedServices: string[];
  products: AvailableProducts;
}

export function parseAndValidateAIResponse(
  jsonString: string,
  availableContentIds: number[],
): AIProposalDraft {
  const parsed = JSON.parse(jsonString);

  // Validate with zod
  const validated = proposalSchema.parse(parsed);

  // Filter out invalid content_ids
  const validBlocks = validated.blocks.filter((block) =>
    availableContentIds.includes(block.content_id),
  );

  const result: AIProposalDraft = {
    title_md: validated.title_md,
    description_md: validated.description_md,
    data: validated.data,
    blocks: validBlocks,
    attachments: parsed.attachments,
  };

  return result;
}

export async function generateProposalDraft({
  customer,
  event,
  preferences,
  requestedServices,
  products,
}: GenerateProposalDraftProps): Promise<AIProposalDraft> {
  const prompt = buildPrompt({
    customer,
    event,
    preferences,
    requestedServices,
    products,
  });
  const availableContentIds = products.contentItems.map((item) => item.id);

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: proposalSchema,
      prompt,
      temperature: 0.7,
    });

    // Validate the response
    return parseAndValidateAIResponse(JSON.stringify(object), availableContentIds);
  } catch (error) {
    console.error("Error generating proposal draft:", error);
    throw error;
  }
}