import type { ProposalPayload, ProposalResponse } from "@/lib/prompt/types";

export async function createProposal(
  payload: ProposalPayload,
): Promise<ProposalResponse> {
  if (!process.env.PROPOSALES_API_KEY || !process.env.PROPOSALES_API_URL) {
    throw new Error("PROPOSALES_API_KEY and PROPOSALES_API_URL must be set");
  }

  const endpoint = `${process.env.PROPOSALES_API_URL}/v3/proposals`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PROPOSALES_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage: string;
      try {
        const data = await response.json();
        errorMessage = data.error || data.message || 'Unknown error';
      } catch {
        // If JSON parsing fails, try to get text response
        errorMessage = await response.text() || 'Unknown error';
      }
      throw new Error(`Proposales API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json() as { proposal: ProposalResponse };

    return {  
      uuid: data.proposal.uuid,
      url: data.proposal.url,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Proposales API error')) {
      throw error;
    }
    throw new Error(`Error creating proposal: ${error}`);
  }
}
