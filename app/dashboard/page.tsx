'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { EmailMessage } from '../types/email';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('Dashboard session status:', status);
  console.log('Dashboard session:', session ? 'exists' : 'not found');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'loading') {
      return;
    }

    const loadEmails = async () => {
      try {
        console.log('Starting to load emails...');
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/emails');
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch emails');
        }
        
        const data = await response.json();
        console.log('Successfully loaded emails:', data.length);
        setEmails(data);
      } catch (error) {
        console.error('Error loading emails:', error);
        setError(error instanceof Error ? error.message : 'Error loading emails');
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
  }, [status, router]);

  const handleToggleImportant = async (id: string, isImportant: boolean) => {
    try {
      console.log('Toggling important status for email:', id);
      await fetch(`/api/emails/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAsImportant',
          isImportant,
        }),
      });
      setEmails(emails.map(email =>
        email.id === id
          ? { ...email, isImportant: !isImportant }
          : email
      ));
    } catch (error) {
      console.error('Error toggling important:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting email:', id);
      await fetch(`/api/emails/${id}`, {
        method: 'DELETE',
      });
      setEmails(emails.filter(email => email.id !== id));
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

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
    <Box>
      <Typography variant="h4" gutterBottom>
        Вхідні листи
      </Typography>
      <Paper>
        <List>
          {emails.map((email, index) => (
            <React.Fragment key={email.id}>
              <ListItem>
                <ListItemText
                  primary={email.headers?.subject?.[0] || 'Без теми'}
                  secondary={
                    <Typography component="span" variant="body2" color="text.primary">
                      {email.headers?.from?.[0] || 'Невідомий відправник'}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="important"
                    onClick={() => handleToggleImportant(email.id, !email.isImportant)}
                  >
                    {email.isImportant ? <StarIcon color="primary" /> : <StarBorderIcon />}
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(email.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < emails.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
} 