'use client';

import { Box, Typography, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function SentEmailsPage() {
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SendIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Надіслані листи</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Тут будуть відображатися ваші надіслані листи
      </Typography>
    </Paper>
  );
} 