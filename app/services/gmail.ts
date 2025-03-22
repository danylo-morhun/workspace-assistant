import { EmailMessage, EmailListResponse } from '../types/email';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export class GmailService {
  private static instance: GmailService;
  private accessToken: string | null = null;
  private emailsCache: Map<string, {data: EmailMessage, timestamp: number}> = new Map();
  private messageListCache: {data: EmailMessage[], timestamp: number} | null = null;
  private CACHE_EXPIRY_MS = 60000; // 1 хвилина

  private constructor() {}

  static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  setAccessToken(token: string) {
    if (this.accessToken !== token) {
      this.accessToken = token;
      this.clearCache();
    }
  }

  clearCache() {
    this.emailsCache.clear();
    this.messageListCache = null;
    console.log('Cache cleared');
  }

  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.CACHE_EXPIRY_MS;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      console.error('No access token available');
      throw new Error('No access token');
    }

    console.log('Making request to Gmail API:', {
      url,
      method: options.method || 'GET',
      tokenLength: this.accessToken.length,
      tokenStart: this.accessToken.substring(0, 10) + '...'
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gmail API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.status === 403) {
        try {
          const errorData = JSON.parse(errorText);
          console.error('Detailed 403 error:', {
            error: errorData.error,
            errorDescription: errorData.error_description,
            errorDetails: errorData.error_details,
            message: errorData.message,
            reason: errorData.error?.errors?.[0]?.reason
          });
          throw new Error(`Gmail API access denied (403): ${errorData.error?.message || errorData.message || 'Access forbidden. Please check your permissions.'}`);
        } catch (parseError) {
          console.error('Failed to parse error JSON:', parseError);
          throw new Error(`Gmail API error (403): Access forbidden. Please check your permissions. Raw response: ${errorText.substring(0, 200)}`);
        }
      }
      
      if (response.status === 429) {
        console.error('Rate limit exceeded. Implementing exponential backoff retry strategy would be recommended.');
        throw new Error('Gmail API rate limit exceeded. Try again later.');
      }
      
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gmail API successful response:', {
      url,
      dataSize: JSON.stringify(data).length
    });
    return data;
  }

  async listEmails(pageSize?: number, page?: number, useCache: boolean = true): Promise<EmailMessage[]> {
    try {
      console.log('Starting listEmails');
      
      if (this.messageListCache && this.isCacheValid(this.messageListCache.timestamp)) {
        console.log('Returning cached email list');
        return this.messageListCache.data;
      }
      
      console.log('Fetching messages list...');
      const response = await this.fetchWithAuth(
        `${GMAIL_API_BASE}/messages?maxResults=50`
      );
      console.log('Got messages list:', {
        messageCount: response.messages?.length || 0,
        responseKeys: Object.keys(response)
      });

      if (!response.messages || !Array.isArray(response.messages)) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from Gmail API');
      }

      console.log(`Processing ${response.messages.length} messages`);
      const emails = await Promise.all(
        response.messages.map(async (message: { id: string }) => {
          console.log(`Fetching email ${message.id}`);
          const email = await this.getEmail(message.id);
          return {
            ...email,
            headers: this.parseHeaders(email.payload?.headers),
          };
        })
      );

      console.log('Successfully processed all emails');
      this.messageListCache = {
        data: emails,
        timestamp: Date.now()
      };
      return emails;
    } catch (error) {
      console.error('Error in listEmails:', error);
      throw error;
    }
  }

  async getEmail(id: string): Promise<EmailMessage> {
    try {
      const cachedEmail = this.emailsCache.get(id);
      if (cachedEmail && this.isCacheValid(cachedEmail.timestamp)) {
        console.log(`Using cached email data for ${id}`);
        return cachedEmail.data;
      }

      const response = await this.fetchWithAuth(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`
      );

      const email = {
        ...response,
        headers: this.parseHeaders(response.payload?.headers),
      };
      
      this.emailsCache.set(id, {
        data: email,
        timestamp: Date.now()
      });

      return email;
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  }

  private parseHeaders(headers: any[] = []) {
    const result: { [key: string]: string[] } = {};
    
    headers.forEach((header) => {
      const key = header.name.toLowerCase();
      const value = header.value;
      
      if (!result[key]) {
        result[key] = [];
      }
      
      if (key === 'from' || key === 'to') {
        const emails = value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        result[key] = emails;
      } else {
        result[key] = [value];
      }
    });

    return result;
  }

  async toggleImportant(id: string, isImportant: boolean): Promise<void> {
    try {
      await this.fetchWithAuth(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: isImportant ? ['IMPORTANT'] : [],
            removeLabelIds: isImportant ? [] : ['IMPORTANT'],
          }),
        }
      );
      
      if (this.emailsCache.has(id)) {
        this.emailsCache.delete(id);
      }
      this.messageListCache = null;
    } catch (error) {
      console.error('Error toggling important:', error);
      throw error;
    }
  }

  async deleteEmail(id: string): Promise<void> {
    try {
      await this.fetchWithAuth(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`,
        {
          method: 'POST',
        }
      );
      
      if (this.emailsCache.has(id)) {
        this.emailsCache.delete(id);
      }
      this.messageListCache = null;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  async getEmailContent(id: string): Promise<string> {
    try {
      const cachedEmail = this.emailsCache.get(id);
      if (cachedEmail && this.isCacheValid(cachedEmail.timestamp)) {
        console.log(`Using cached content for email ${id}`);
        return this.decodeMessageBody(cachedEmail.data);
      }
      
      const email = await this.fetchWithAuth(`${GMAIL_API_BASE}/messages/${id}?format=full`);
      
      this.emailsCache.set(id, {
        data: email,
        timestamp: Date.now()
      });
      
      return this.decodeMessageBody(email);
    } catch (error) {
      console.error(`getEmailContent error for ID ${id}:`, error);
      return 'Помилка завантаження вмісту листа';
    }
  }

  async getLabels(): Promise<{ labels: { id: string; name: string }[] }> {
    return this.fetchWithAuth('/labels');
  }

  parseEmailHeaders(message: EmailMessage) {
    const headers = message.payload?.headers || [];
    return {
      subject: headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'Без теми',
      from: headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Невідомий відправник',
      to: headers.find(h => h.name.toLowerCase() === 'to')?.value || 'Невідомий отримувач',
      date: headers.find(h => h.name.toLowerCase() === 'date')?.value || message.internalDate,
    };
  }

  private decodeMessageBody(message: EmailMessage): string {
    let body = '';
    const payload = message.payload;

    if (!payload) return 'Тіло листа порожнє';

    if (payload.body?.data) {
      body = this.decodeBase64Url(payload.body.data);
    }
    else if (payload.parts) {
      const textPart = payload.parts.find(
        part => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart?.body?.data) {
        body = this.decodeBase64Url(textPart.body.data);
      }
    }

    return body || 'Тіло листа порожнє';
  }

  private decodeBase64Url(data: string): string {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(escape(atob(base64)));
  }

  async toggleRead(id: string, isRead: boolean): Promise<void> {
    try {
      await this.fetchWithAuth(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds: isRead ? [] : ['UNREAD'],
            removeLabelIds: isRead ? ['UNREAD'] : [],
          }),
        }
      );
      
      if (this.emailsCache.has(id)) {
        this.emailsCache.delete(id);
      }
      this.messageListCache = null;
    } catch (error) {
      console.error('Error toggling read status:', error);
      throw error;
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        console.error('No access token to validate');
        return false;
      }
      
      console.log('Validating token...');
      const profileResponse = await this.fetchWithAuth(
        `${GMAIL_API_BASE}/profile`
      );
      
      console.log('Token validation successful, user email:', profileResponse.emailAddress);
      
      const messagesResponse = await this.fetchWithAuth(
        `${GMAIL_API_BASE}/messages?maxResults=1`
      );
      
      if (messagesResponse.messages && messagesResponse.messages.length > 0) {
        console.log('Successfully verified access to messages list');
        
        const messageId = messagesResponse.messages[0].id;
        console.log(`Checking access to message ${messageId}`);
        
        const messageResponse = await this.fetchWithAuth(
          `${GMAIL_API_BASE}/messages/${messageId}`
        );
        
        console.log('Successfully verified access to full message content');
        return true;
      } else {
        console.log('Token is valid but no messages found');
        return true;
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
} 