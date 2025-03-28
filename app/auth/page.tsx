'use client';

import React from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { signIn } from 'next-auth/react';

export default function AuthPage() {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography className='text-center' component="h1" variant="h4" gutterBottom>
            Ласкаво просимо до Workspace Assistant
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Увійдіть через Google, щоб керувати своїми листами з допомогою AI
          </Typography>

          <Button
            variant="text"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            size="large"
            sx={{
              textTransform: 'none',
              backgroundColor: '#fff',
              color: '#757575',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Увійти через Google
          </Button>
        </Paper>
      </Box>
    </Container>
  );
} 