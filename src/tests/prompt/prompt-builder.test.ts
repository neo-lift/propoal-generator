import { buildPrompt, buildProposalesPayload } from '@/lib/prompt/builder';
import type {
  CustomerInput,
  EventDetails,
  Preferences,
  AIProposalDraft,
  AvailableProducts,
  NewRecipient,
} from '@/lib/prompt/types';

describe('buildPrompt', () => {
  const mockCustomerInput: CustomerInput = {
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    companyName: 'ABC Corp',
  };

  const mockEventDetails: EventDetails = {
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

  const mockAvailableProducts: AvailableProducts = {
    contentItems: [
      { id: 101, name: 'Meeting Room Package', category: 'meeting' },
      { id: 102, name: 'Catering Service', category: 'catering' },
      { id: 103, name: 'Guest Room Block', category: 'accommodation' },
      { id: 104, name: 'AV Equipment', category: 'technology' },
    ],
  };

  it('should build a structured prompt for the LLM', () => {
    const requestedServices = ['meeting', 'catering'];

    const prompt = buildPrompt({
      customer: mockCustomerInput,
      event: mockEventDetails,
      preferences: mockPreferences,
      requestedServices,
      products: mockAvailableProducts,
    });

    expect(prompt).toContain('John Smith');
    expect(prompt).toContain('ABC Corp');
    expect(prompt).toContain('Corporate Meeting');
    expect(prompt).toContain('50');
    expect(prompt).toContain('professional');
    expect(prompt).toContain('AV equipment');
    expect(prompt).toContain('content_id: 101');
    expect(prompt).toContain('content_id: 102');
    expect(prompt).toContain('content_id: 103');
    expect(prompt).toContain('content_id: 104');
  });

  it('should handle minimal input', () => {
    const minimalPreferences: Preferences = {
      tone: 'casual',
      additionalBrief: '',
    };

    const requestedServices: string[] = [];

    const prompt = buildPrompt({
      customer: mockCustomerInput,
      event: mockEventDetails,
      preferences: minimalPreferences,
      requestedServices,
      products: mockAvailableProducts,
    });

    expect(prompt).toContain('casual');
    expect(prompt).not.toContain('undefined');
    expect(prompt).not.toContain('null');
  });

  it('should include JSON output format instructions', () => {
    const requestedServices = ['meeting'];

    const prompt = buildPrompt({
      customer: mockCustomerInput,
      event: mockEventDetails,
      preferences: mockPreferences,
      requestedServices,
      products: mockAvailableProducts,
    });

    expect(prompt).toContain('title_md');
    expect(prompt).toContain('description_md');
    expect(prompt).toContain('JSON');
    expect(prompt).toContain('blocks');
  });
});

describe('buildProposalesPayload', () => {
  const mockInput = {
    customer: {
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      companyName: 'ABC Corp',
    },
    event: {
      eventType: 'Corporate Meeting',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
      guestCount: 50,
      roomsNeeded: 25,
    },
  };

  const mockAIDraft: AIProposalDraft = {
    title_md: '# Corporate Meeting Package for ABC Corp',
    description_md: '## 3-Day Corporate Meeting\n\nWe are pleased to offer...',
    data: {
      event_date: '2024-06-01',
      guests: 50,
      nights: 2,
    },
    blocks: [
      { content_id: 101 },
      { content_id: 102 },
    ],
  };

  const mockEnv = {
    companyId: 123,
    language: 'en',
  };

  it('should build a valid Proposales API payload', () => {
    const payload = buildProposalesPayload({
      input: mockInput,
      aiDraft: mockAIDraft,
      env: mockEnv,
    });

    expect(payload.company_id).toBe(123);
    expect(payload.language).toBe('en');
    expect(payload.title_md).toBe('# Corporate Meeting Package for ABC Corp');
    expect(payload.description_md).toContain('3-Day Corporate Meeting');
    const recipient = payload.recipient as NewRecipient;
    expect(recipient.email).toBe('john@example.com');
    expect(recipient.first_name).toBe('John');
    expect(recipient.last_name).toBe('Smith');
    expect(recipient.company_name).toBe('ABC Corp');
    expect(payload.data).toEqual(mockAIDraft.data);
    expect(payload.blocks).toEqual(mockAIDraft.blocks);
  });

  it('should handle names with multiple parts', () => {
    const inputWithComplexName = {
      ...mockInput,
      customer: {
        ...mockInput.customer,
        customerName: 'Mary Jane Watson-Parker',
      },
    };

    const payload = buildProposalesPayload({
      input: inputWithComplexName,
      aiDraft: mockAIDraft,
      env: mockEnv,
    });

    const recipient = payload.recipient as NewRecipient;
    expect(recipient.first_name).toBe('Mary');
    expect(recipient.last_name).toBe('Jane Watson-Parker');
  });

  it('should handle single-word names', () => {
    const inputWithSingleName = {
      ...mockInput,
      customer: {
        ...mockInput.customer,
        customerName: 'Madonna',
      },
    };

    const payload = buildProposalesPayload({
      input: inputWithSingleName,
      aiDraft: mockAIDraft,
      env: mockEnv,
    });

    const recipient = payload.recipient as NewRecipient;
    expect(recipient.first_name).toBe('Madonna');
    expect(recipient.last_name).toBe('');
  });

  it('should include optional attachments if provided', () => {
    const draftWithAttachments: AIProposalDraft = {
      ...mockAIDraft,
      attachments: [{ url: 'https://example.com/file.pdf' }],
    };

    const payload = buildProposalesPayload({
      input: mockInput,
      aiDraft: draftWithAttachments,
      env: mockEnv,
    });

    expect(payload.attachments).toEqual([
      {
        url: 'https://example.com/file.pdf',
        mime_type: 'application/octet-stream',
        name: 'attachment',
      },
    ]);
  });
});