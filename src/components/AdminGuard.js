import React from 'react';
import { Navigate } from 'react-router-dom';
import { useOrganization } from '../OrganizationContext';
import { Box, Typography, Alert } from '@mui/material';

const AdminGuard = ({ children }) => {
  const { userRole, currentOrganization } = useOrganization();

  // Show loading while role is being determined
  if (!currentOrganization) {
    return (
      <Box p={3}>
        <Typography>Loading organization...</Typography>
      </Box>
    );
  }

  // Check if user has admin privileges
  const isAdmin = userRole === 'owner' || userRole === 'admin';

  if (!isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>
            You don't have permission to access this page. Contact your organization administrator for access.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return children;
};

export default AdminGuard;
