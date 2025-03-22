'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { EmailList } from './components/EmailList/EmailList';
import { EmailFilters } from './components/EmailFilters/EmailFilters';
import { EmailMessage, EmailFilters as IEmailFilters, EmailSortOptions } from './types/email';
import { useSession } from 'next-auth/react';

interface Email extends EmailMessage {
  from: string;
  subject: string;
  snippet: string;
  date: string;
  importance: string;
  isUnread: boolean;
}

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IEmailFilters>({});
  const [sort, setSort] = useState<EmailSortOptions>({
    field: 'date',
    order: 'desc',
  });

  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.isUnread) params.append('isUnread', 'true');
      if (filters.isImportant) params.append('isImportant', 'true');
      if (filters.from) params.append('from', filters.from);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.after) params.append('after', filters.after.toISOString().split('T')[0]);
      if (filters.before) params.append('before', filters.before.toISOString().split('T')[0]);

      const response = await fetch(`/api/emails?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth');
          return;
        }
        throw new Error('Failed to fetch emails');
      }

      let fetchedEmails = await response.json();

      if (sort) {
        fetchedEmails.sort((a: Email, b: Email) => {
          const aValue = sort.field === 'date' ? new Date(a.date) : a[sort.field];
          const bValue = sort.field === 'date' ? new Date(b.date) : b[sort.field];
          
          if (sort.order === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      setEmails(fetchedEmails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [filters, sort]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleFiltersChange = (newFilters: IEmailFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: EmailSortOptions) => {
    setSort(newSort);
  };

  const handleEmailAction = async (messageId: string, action: 'markAsRead' | 'markAsImportant') => {
    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update email');
      }

      fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    }
  };

  if (status === 'loading') {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <EmailFilters
        filters={filters}
        sort={sort}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
      />
      {error ? (
        <Box sx={{ color: 'error.main', mt: 2 }}>{error}</Box>
      ) : (
        <EmailList 
          emails={emails} 
          onMarkAsRead={(id) => handleEmailAction(id, 'markAsRead')}
          onMarkAsImportant={(id) => handleEmailAction(id, 'markAsImportant')}
        />
      )}
    </Box>
  );
}
