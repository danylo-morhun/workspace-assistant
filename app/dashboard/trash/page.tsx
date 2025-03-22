'use client';

import { Box, Typography, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function TrashEmailsPage() {
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
        <Typography variant="h5">Видалені листи</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Тут будуть відображатися ваші видалені листи
      </Typography>
    </Paper>
  );
} 