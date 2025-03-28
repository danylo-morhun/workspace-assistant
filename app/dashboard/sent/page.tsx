'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmailList from '@/app/components/EmailList';
import { EmailMessage } from '@/app/types/email';

export default function SentEmailsPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentEmails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/emails?label=SENT');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch sent emails');
        }
        
        const data: EmailMessage[] = await response.json();
        setEmails(data);
      } catch (error) {
        console.error('Error loading sent emails:', error);
        setError(error instanceof Error ? error.message : 'Error loading sent emails');
      } finally {
        setLoading(false);
      }
    };

    fetchSentEmails();
  }, []);

  const handleToggleImportant = async (id: string, isImportant: boolean) => {
    try {
      await fetch(`/api/emails/${id}/important`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isImportant }),
      });
      setEmails(emails.map(email =>
        email.id === id
          ? { ...email, labelIds: isImportant ? [...(email.labelIds || []), 'IMPORTANT'] : email.labelIds?.filter(l => l !== 'IMPORTANT') }
          : email
      ));
    } catch (error) {
      console.error('Error toggling important status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/emails/${id}/delete`, {
        method: 'POST',
      });
      setEmails(emails.filter(email => email.id !== id));
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const handleEmailsUpdate = (updatedEmails: EmailMessage[]) => {
    setEmails(updatedEmails);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SendIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Надіслані листи</Typography>
      </Box>
      <EmailList
        emails={emails}
        onToggleImportant={handleToggleImportant}
        onDelete={handleDelete}
        onEmailsUpdate={handleEmailsUpdate}
      />
    </Paper>
  );
} 