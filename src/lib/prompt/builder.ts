import type {
  CustomerInput,
  EventDetails,
  Preferences,
  ProposalPayload,
  AIProposalDraft,
  NewRecipient,
  AvailableProducts,
} from "./types";

interface BuildPromptParams {
  customer: CustomerInput;
  event: EventDetails;
  preferences: Preferences;
  requestedServices: string[];
  products: AvailableProducts;
}

export function buildPrompt(
  { customer, event, preferences, requestedServices, products }: BuildPromptParams
): string {
  const prompt = `Generate a hotel proposal for the following event:

CUSTOMER INFORMATION:
- Name: ${customer.customerName}
- Email: ${customer.customerEmail}
- Company: ${customer.companyName}

EVENT DETAILS:
- Event Type: ${event.eventType}
- Dates: ${event.startDate} to ${event.endDate}
- Guest Count: ${event.guestCount} guests
- Rooms Needed: ${event.roomsNeeded} rooms

PREFERENCES:
- Tone: ${preferences.tone}
- Requested Services: ${requestedServices.length > 0 ? requestedServices.join(", ") : "basic accommodation"}
${preferences.additionalBrief ? `- Additional Requirements: ${preferences.additionalBrief}` : ""}

AVAILABLE CONTENT ITEMS (use these content_ids in your blocks):
${products.contentItems.map(item => `- content_id: ${item.id}`).join("\n")}

Please generate a proposal in JSON format with the following structure:
{
  "title_md": "Markdown-formatted title for the proposal",
  "description_md": "Detailed markdown-formatted description of the proposal",
  "data": {
    "event_date": "YYYY-MM-DD format",
    "guests": number,
    "nights": number,
    // Include any other relevant metadata
  },
  "blocks": [
    { "content_id": number },
    // Include relevant content_ids from the available items above
  ]
}

Requirements:
- The title should be compelling and include the company name
- The description should be detailed and match the requested tone (${preferences.tone})
- Only use content_ids from the available content items list provided above
- Select content items that match the requested services and event type
- Calculate nights based on the start and end dates`;

  return prompt;
}

interface BuildProposalesPayloadParams {
  input: {
    customer: CustomerInput;
    event: EventDetails;
  };
  aiDraft: AIProposalDraft;
  env: {
    companyId: number;
    language: string;
  };
}

export function buildProposalesPayload({
  input,
  aiDraft,
  env,
}: BuildProposalesPayloadParams): ProposalPayload {
  // Parse customer name into first and last name
  const nameParts = input.customer.customerName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const recipient: NewRecipient = {
    first_name: firstName,
    last_name: lastName,
    email: input.customer.customerEmail,
    company_name: input.customer.companyName,
  };

  const payload: ProposalPayload = {
    company_id: env.companyId,
    language: env.language,
    title_md: aiDraft.title_md,
    description_md: aiDraft.description_md,
    recipient,
    data: aiDraft.data,
    blocks: aiDraft.blocks,
  };

  if (aiDraft.attachments && aiDraft.attachments.length > 0) {
    payload.attachments = aiDraft.attachments.map((att) => ({
      url: att.url,
      mime_type: att.mime_type || 'application/octet-stream',
      name: att.name || 'attachment',
    }));
  }

  return payload;
}
