import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProject } from './ProjectContext';
import { Box, CircularProgress, Typography } from '@mui/material';

function ProjectGuard({ children }) {
  const { projects, loading } = useProject();
  const location = useLocation();
  
  // Don't guard the projects page itself
  if (location.pathname === '/dashboard/projects') {
    return children;
  }

  // Show loading while checking for projects
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '50vh',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading your projects...
        </Typography>
      </Box>
    );
  }

  // If no projects exist, redirect to projects page
  if (!loading && projects.length === 0) {
    return <Navigate to="/dashboard/projects" replace />;
  }

  // If projects exist, render the children
  return children;
}

export default ProjectGuard;
