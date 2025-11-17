import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProposalDraft } from '@/lib/ai/proposal-generator';
import { buildProposalesPayload } from '@/lib/prompt/builder';
import { createProposal } from '@/lib/proposales/client';
import { logGeneratedProposal } from '@/lib/db';
import type { ProposalResponse } from '@/lib/prompt/types';
import { mockAvailableProducts } from '@/data/products';

// Request validation schema
const generateProposalRequestSchema = z.object({
  customer: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    customerEmail: z.string().email('Valid email is required'),
    companyName: z.string().min(1, 'Company name is required'),
  }),
  event: z.object({
    eventType: z.string().min(1, 'Event type is required'),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD format'),
    guestCount: z
      .number()
      .int()
      .positive('Guest count must be a positive number'),
    roomsNeeded: z
      .number()
      .int()
      .positive('Rooms needed must be a positive number'),
  }),
  preferences: z.object({
    meetingSpaces: z.boolean(),
    catering: z.boolean(),
    tone: z.enum(['professional', 'casual', 'formal']),
    additionalBrief: z.string().optional(),
  }),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateProposalRequestSchema.parse(body);

    // Check required environment variables
    const companyId = process.env.PROPOSALES_COMPANY_ID;
    const apiKey = process.env.PROPOSALES_API_KEY;

    if (!companyId || !apiKey) {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'Missing required environment variables for Proposales API',
        },
        { status: 500 },
      );
    }

    // Generate AI proposal draft
    const requestedServices: string[] = [];
    if (validatedData.preferences.meetingSpaces) {
      requestedServices.push('meeting');
    }
    if (validatedData.preferences.catering) {
      requestedServices.push('catering');
    }

    const aiDraft = await generateProposalDraft({
      customer: validatedData.customer,
      event: validatedData.event,
      preferences: validatedData.preferences,
      requestedServices,
      products: mockAvailableProducts,
    });

    // Build Proposales API payload
    const proposalesPayload = buildProposalesPayload({
      input: {
        customer: validatedData.customer,
        event: validatedData.event,
      },
      aiDraft,
      env: {
        companyId: parseInt(companyId),
        language: 'en',
      },
    });

    console.log('Proposales payload built:', proposalesPayload);

    // Create proposal
    const proposalResult = await createProposal(proposalesPayload);

    // Log the generated proposal to database
    const logResult = await logGeneratedProposal({
      customerEmail: validatedData.customer.customerEmail,
      proposalUuid: proposalResult.uuid,
      summary:
        aiDraft.title_md?.replace(/^#+ /, '').substring(0, 255) ||
        'No summary available',
      companyName: validatedData.customer.companyName,
      eventType: validatedData.event.eventType,
    });

    if (logResult === -1) {
      return NextResponse.json(
        {
          error: 'Failed to log proposal to database',
          message: 'Failed to log proposal to database',
        },
        { status: 500 },
      );
    }

    const response: ProposalResponse = {
      url: proposalResult.url,
      uuid: proposalResult.uuid,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error generating proposal:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid request data',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }

    // Handle proposales API errors
    if (error instanceof Error) {
      if (error.message.includes('Proposales API error')) {
        return NextResponse.json(
          {
            error: 'Proposales API error',
            message: 'Failed to create proposal in Proposales',
            details: error.message,
          },
          { status: 502 },
        );
      }

      if (error.message.includes('Network error when calling Proposales API')) {
        return NextResponse.json(
          {
            error: 'Network error',
            message: 'Failed to communicate with Proposales API',
          },
          { status: 503 },
        );
      }
    }

    // Other types of errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while generating the proposal',
      },
      { status: 500 },
    );
  }
}
