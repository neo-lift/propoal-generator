import type {
  CustomerInput,
  EventDetails,
  Preferences,
  ProposalResponse,
  ProposalPayload,
} from "./types";

export function generateProposal(payload: ProposalPayload): ProposalResponse {
  return {
    uuid: "123",
    url: "https://www.example.com",
  };
}

interface BuildPromptParams {
  customer: CustomerInput;
  event: EventDetails;
  preferences: Preferences;
  requestedServices: string[];
  productsList: string[];
}

export function buildPrompt(
  { customer, event, preferences, requestedServices, productsList }: BuildPromptParams
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
${productsList.join(", ")}

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
