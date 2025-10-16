import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page which will trigger the auth modal
    // Add a slight delay to show the loading message
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#f5f5f5' }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Redirecting to Sign In...
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Please wait while we redirect you to the login page.
      </Typography>
    </Box>
  );
};

export default LoginPage;
