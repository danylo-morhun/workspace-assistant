'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  importance: string;
  isUnread: boolean;
}

interface EmailListProps {
  emails: Email[];
  onMarkAsRead: (id: string) => void;
  onMarkAsImportant: (id: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ 
  emails,
  onMarkAsRead,
  onMarkAsImportant,
}) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {emails.map((email) => (
        <React.Fragment key={email.id}>
          <ListItem 
            alignItems="flex-start"
            sx={{
              bgcolor: email.isUnread ? 'action.hover' : 'inherit',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemAvatar>
              <Avatar>{email.from[0].toUpperCase()}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography component="span" variant="subtitle1">
                      {email.from}
                    </Typography>
                    {email.isUnread && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={() => onMarkAsRead(email.id)}
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={email.importance === 'high' ? 'Remove importance' : 'Mark as important'}>
                      <IconButton
                        size="small"
                        onClick={() => onMarkAsImportant(email.id)}
                      >
                        {email.importance === 'high' ? (
                          <StarIcon fontSize="small" color="warning" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography component="span" variant="body2" color="text.secondary">
                    {new Date(email.date).toLocaleTimeString()}
                  </Typography>
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body1" color="text.primary" display="block">
                    {email.subject}
                  </Typography>
                  <Typography component="span" variant="body2" color="text.secondary" display="block">
                    {email.snippet}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );
}; 