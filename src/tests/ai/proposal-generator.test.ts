import { generateProposalDraft, parseAndValidateAIResponse } from '@/lib/ai/proposal-generator';
import type { CustomerInput, EventDetails, Preferences, AvailableProducts } from '@/lib/prompt/types';
import { generateObject } from 'ai';

// Mock the AI SDK
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

describe('parseAndValidateAIResponse', () => {
  const availableContentIds = [101, 102, 103, 104];

  it('should parse valid AI response', () => {
    const validResponse = {
      title_md: '# Corporate Event Proposal',
      description_md: '## Overview\nDetailed proposal...',
      data: {
        event_date: '2024-06-01',
        guests: 50,
        nights: 2,
        total_rooms: 25,
      },
      blocks: [
        { content_id: 101 },
        { content_id: 103 },
      ],
    };

    const result = parseAndValidateAIResponse(JSON.stringify(validResponse), availableContentIds);

    expect(result).toEqual(validResponse);
  });

  it('should filter out invalid content_ids', () => {
    const responseWithInvalidIds = {
      title_md: '# Test Proposal',
      description_md: 'Description',
      data: { event_date: '2024-06-01' },
      blocks: [
        { content_id: 101 },
        { content_id: 999 }, // Invalid - not in available list
        { content_id: 103 },
      ],
    };

    const result = parseAndValidateAIResponse(
      JSON.stringify(responseWithInvalidIds),
      availableContentIds
    );

    expect(result.blocks).toEqual([
      { content_id: 101 },
      { content_id: 103 },
    ]);
    expect(result.blocks).not.toContainEqual({ content_id: 999 });
  });

  it('should handle missing optional fields', () => {
    const minimalResponse = {
      title_md: '# Minimal Proposal',
      description_md: 'Basic description',
      data: {},
      blocks: [],
    };

    const result = parseAndValidateAIResponse(JSON.stringify(minimalResponse), availableContentIds);

    expect(result).toEqual(minimalResponse);
  });

  it('should throw on missing required fields', () => {
    const invalidResponse = {
      title_md: '# Missing Description',
      data: {},
      blocks: [],
    };

    expect(() => 
      parseAndValidateAIResponse(JSON.stringify(invalidResponse), availableContentIds)
    ).toThrow();
  });

  it('should throw on invalid JSON', () => {
    expect(() => 
      parseAndValidateAIResponse('invalid json', availableContentIds)
    ).toThrow();
  });

  it('should handle attachments if provided', () => {
    const responseWithAttachments = {
      title_md: '# Proposal with Attachments',
      description_md: 'Description',
      data: {},
      blocks: [],
      attachments: [
        { url: 'https://example.com/brochure.pdf' },
      ],
    };

    const result = parseAndValidateAIResponse(
      JSON.stringify(responseWithAttachments),
      availableContentIds
    );

    expect(result.attachments).toEqual([
      { url: 'https://example.com/brochure.pdf' },
    ]);
  });
});

describe('generateProposalDraft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCustomer: CustomerInput = {
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    companyName: 'ABC Corp',
  };

  const mockEvent: EventDetails = {
    eventType: 'Corporate Meeting',
    startDate: '2024-06-01',
    endDate: '2024-06-03',
    guestCount: 50,
    roomsNeeded: 25,
  };

  const mockPreferences: Preferences = {
    tone: 'professional',
    additionalBrief: 'Need AV equipment and breakout rooms',
  };

  const mockRequestedServices: string[] = ['meeting', 'catering'];

  const mockProducts: AvailableProducts = {
    contentItems: [
      { id: 101, name: 'Meeting Room Package', category: 'meeting' },
      { id: 102, name: 'Catering Service', category: 'catering' },
      { id: 103, name: 'Guest Room Block', category: 'accommodation' },
      { id: 104, name: 'AV Equipment', category: 'technology' },
    ],
  };

  it('should generate a proposal draft with mocked AI', async () => {
    const mockAIResponse = {
      title_md: '# Corporate Meeting Proposal',
      description_md: '## Overview\nDetailed proposal...',
      data: { event_date: '2024-06-01', guests: 50, nights: 2, total_rooms: 25 },
      blocks: [{ content_id: 101 }, { content_id: 103 }],
    };

    (generateObject as jest.Mock).mockResolvedValue({
      object: mockAIResponse,
    });

    const result = await generateProposalDraft({
      customer: mockCustomer,
      event: mockEvent,
      preferences: mockPreferences,
      requestedServices: mockRequestedServices,
      products: mockProducts,
    });

    expect(result.title_md).toBe('# Corporate Meeting Proposal');
    expect(result.description_md).toBe('## Overview\nDetailed proposal...');
    expect(result.data).toEqual({ event_date: '2024-06-01', guests: 50, nights: 2, total_rooms: 25 });
    expect(result.blocks).toEqual([{ content_id: 101 }, { content_id: 103 }]);
    expect(generateObject).toHaveBeenCalled();
  });
});