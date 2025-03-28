'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Collapse,
  CircularProgress,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { EmailMessage } from '../types/email';

interface EmailListProps {
  emails: EmailMessage[];
  onToggleImportant: (id: string, isImportant: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEmailsUpdate?: (emails: EmailMessage[]) => void;
}

export default function EmailList({
  emails,
  onToggleImportant,
  onDelete,
  onEmailsUpdate,
}: EmailListProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [loadingContent, setLoadingContent] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [emailToDelete, setEmailToDelete] = React.useState<string | null>(null);

  const handleToggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setLoadingContent(id);
      try {
        const response = await fetch(`/api/emails/${id}`);
        if (!response.ok) throw new Error('Failed to fetch email content');
        const email = await response.json();
        // Оновлюємо лист з повним контентом
        const updatedEmails = emails.map((e) =>
          e.id === id ? email : e
        );
        // Оновлюємо стан батьківського компонента
        onEmailsUpdate?.(updatedEmails);
      } catch (error) {
        console.error('Error fetching email content:', error);
      } finally {
        setLoadingContent(null);
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEmailToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (emailToDelete) {
      await onDelete(emailToDelete);
      setDeleteDialogOpen(false);
      setEmailToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmailToDelete(null);
  };

  if (emails.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Немає листів для відображення
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0}>
      <List>
        {emails.map((email) => (
          <React.Fragment key={email.id}>
            <ListItem
              component="div"
              onClick={() => handleToggleExpand(email.id)}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                cursor: 'pointer',
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  {email.payload?.headers?.find(h => h.name === 'From')?.value?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: email.labelIds?.includes('IMPORTANT')
                        ? 'bold'
                        : 'normal',
                    }}
                  >
                    {email.payload?.headers?.find(h => h.name === 'Subject')?.value || 'Без теми'}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {email.payload?.headers?.find(h => h.name === 'From')?.value || 'Невідомий відправник'}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mx: 1 }}
                    >
                      •
                    </Typography>
                    {new Date(parseInt(email.internalDate || '0')).toLocaleDateString()}
                  </Typography>
                }
              />
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(email.id);
                }}
                sx={{ mr: 1 }}
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleImportant(
                    email.id,
                    !email.labelIds?.includes('IMPORTANT')
                  );
                }}
                sx={{ mr: 1 }}
              >
                {email.labelIds?.includes('IMPORTANT') ? (
                  <StarIcon color="primary" />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
              <ExpandMoreIcon
                sx={{
                  transform:
                    expandedId === email.id ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </ListItem>
            <Collapse in={expandedId === email.id} timeout="auto" unmountOnExit>
              <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                {loadingContent === email.id ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      p: 2,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: email.snippet || 'Немає вмісту',
                    }}
                  />
                )}
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Підтвердження видалення
        </DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити цей лист? Цю дію неможливо відмінити.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Скасувати
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 