import { useState, useEffect } from 'react';
import { GmailService } from '../services/gmail';

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
}

export const useGmail = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gmailService = new GmailService();

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEmails = await gmailService.listEmails();
      setEmails(fetchedEmails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading emails');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthCallback = async (code: string) => {
    try {
      await gmailService.authorize(code);
      await fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error');
    }
  };

  return {
    emails,
    loading,
    error,
    fetchEmails,
    handleAuthCallback,
  };
}; 