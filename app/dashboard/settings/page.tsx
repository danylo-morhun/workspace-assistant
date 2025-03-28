'use client';

import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';

export default function SettingsPage() {
  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Налаштування</Typography>
      </Box>

      <List>
        <ListItem>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Сповіщення"
            secondary="Налаштування сповіщень про нові листи"
          />
        </ListItem>
        <Divider />
        
        <ListItem>
          <ListItemIcon>
            <PaletteIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Тема"
            secondary="Налаштування зовнішнього вигляду"
          />
        </ListItem>
        <Divider />
        
        <ListItem>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Безпека"
            secondary="Налаштування безпеки та приватності"
          />
        </ListItem>
        <Divider />
        
        <ListItem>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Мова"
            secondary="Налаштування мови інтерфейсу"
          />
        </ListItem>
      </List>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Всі налаштування будуть доступні в наступних оновленнях
      </Typography>
    </Paper>
  );
} 