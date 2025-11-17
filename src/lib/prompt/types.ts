// types.ts

export type BackgroundImage = {
  id: number;
  uuid: string;
};

export type BackgroundVideo = {
  id: number;
  uuid: string;
};

export type ExistingRecipient = {
  id: number;
};

export type NewRecipient = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  sources?: {
    integration?: {
      id: number;
      contactId: string;
      metadata: Record<string, unknown>;
    };
  };
};

export type Recipient = ExistingRecipient | NewRecipient;

export type ContentBlock = {
  content_id: number;
};

export type VideoBlock = {
  type: 'video-block';
  video_url: string;
  title: string;
};

export type Block = ContentBlock | VideoBlock;

export type ProposalAttachment = {
  mime_type?: string;
  name?: string;
  url: string;
};

export type ProposalPayload = {
  company_id: number;
  language: string;
  contact_email?: string;
  background_image?: BackgroundImage;
  background_video?: BackgroundVideo;
  title_md?: string;
  description_md?: string;
  recipient: Recipient;
  data?: Record<string, unknown>;
  invoicing_enabled?: boolean;
  blocks?: Block[];
  attachments?: ProposalAttachment[];
};

export interface CustomerInput {
  customerName: string;
  customerEmail: string;
  companyName: string;
}

export interface EventDetails {
  eventType: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  roomsNeeded: number;
}

export interface Preferences {
  tone: string;
  additionalBrief: string;
}

export interface AvailableProducts {
  contentItems: Array<{
    id: number;
    name: string;
    category: string;
  }>;
}

export interface ProposalRequest {
  customer: CustomerInput;
  event: EventDetails;
  preferences: Preferences;
  requestedServices: string[];
  productsList: AvailableProducts[];
}

export interface ProposalResponse {
  uuid: string;
  url: string;
}

export interface AIProposalDraft {
  title_md?: string;
  description_md?: string;
  data?: Record<string, unknown>;
  blocks?: ContentBlock[];
  attachments?: ProposalAttachment[];
}