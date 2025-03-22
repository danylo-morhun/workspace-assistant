'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

interface SidebarProps {
  isOpen: boolean;
  drawerWidth: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, drawerWidth }) => {
  const theme = useTheme();
  
  const menuItems = [
    { text: 'Inbox', icon: <EmailIcon /> },
    { text: 'Starred', icon: <StarIcon /> },
    { text: 'Trash', icon: <DeleteIcon /> },
    { text: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          ...(!isOpen && {
            width: `calc(${theme.spacing(7)} + 1px)`,
            [theme.breakpoints.up('sm')]: {
              width: `calc(${theme.spacing(8)} + 1px)`,
            },
          }),
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ display: isOpen ? 'block' : 'none' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}; 