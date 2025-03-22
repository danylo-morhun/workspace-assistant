'use client';

import { Box, Typography, Paper } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

export default function ImportantEmailsPage() {
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
        <Typography variant="h5">Важливі листи</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Тут будуть відображатися ваші важливі листи
      </Typography>
    </Paper>
  );
} 