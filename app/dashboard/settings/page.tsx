'use client';

import { Box, Typography, Paper, List, ListItem, ListItemText, Switch, Divider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoRefresh: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Налаштування</Typography>
      </Box>
      
      <List>
        <ListItem>
          <ListItemText 
            primary="Сповіщення" 
            secondary="Отримувати сповіщення про нові листи"
          />
          <Switch
            edge="end"
            checked={settings.notifications}
            onChange={() => handleToggle('notifications')}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Темна тема" 
            secondary="Увімкнути темну тему інтерфейсу"
          />
          <Switch
            edge="end"
            checked={settings.darkMode}
            onChange={() => handleToggle('darkMode')}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Автооновлення" 
            secondary="Автоматично оновлювати список листів"
          />
          <Switch
            edge="end"
            checked={settings.autoRefresh}
            onChange={() => handleToggle('autoRefresh')}
          />
        </ListItem>
      </List>
    </Paper>
  );
} 