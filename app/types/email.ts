export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: {
    headers?: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
  internalDate?: string;
}

export interface EmailFilters {
  isUnread?: boolean;
  isImportant?: boolean;
  from?: string;
  subject?: string;
  after?: Date;
  before?: Date;
}

export interface EmailSortOptions {
  field: 'date' | 'from' | 'subject';
  order: 'asc' | 'desc';
}

export interface EmailListResponse {
  messages: EmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
} 