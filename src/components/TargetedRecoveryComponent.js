import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert, CircularProgress, List, ListItem, ListItemText, Checkbox, FormControlLabel } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { useOrganization } from '../OrganizationContext';
import { recoverSpecificProjects, fixOrganizationMembership } from '../utils/targetedRecovery';

const TargetedRecoveryComponent = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { currentOrganization, loadUserOrganizations } = useOrganization();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isFixingMembership, setIsFixingMembership] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);

  // Based on your debug output, these are the projects we found
  const availableProjects = [
    { id: '6UqDMbU7sci5HOZYSy2m', name: 'Project big', userId: 'XlF3O3RV2VaijwqXJsa7rvhIS9D2', created: '16/10/2025' },
    { id: 'FsYSTt79hcf9fHR2ibD1', name: 'Foo', userId: 'YRWcxjIY9lMUND6JhAIO7QYQ5qQ2', created: '13/10/2025' },
    { id: 'rthsY7G8Tc7wbmtwvjN3', name: 'MC - Q4 - 26', userId: 'YRWcxjIY9lMUND6JhAIO7QYQ5qQ2', created: '15/10/2025' },
    { id: 'sxf0bQ1wz7WPsIC8Un0l', name: 'Management Center 2.0', userId: 'YRWcxjIY9lMUND6JhAIO7QYQ5qQ2', created: '13/10/2025' },
    { id: 't2KjfazNx70B1TEckfyc', name: 'Foo', userId: 'NCSgxNoEDLXn6AypyGvCxs0YY7D3', created: '13/10/2025' }
  ];

  const handleProjectSelection = (projectId, checked) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    }
  };

  const selectAllProjects = () => {
    setSelectedProjects(availableProjects.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProjects([]);
  };

  const fixMembership = async () => {
    if (!user || !currentOrganization) {
      setError('User or organization not available');
      return;
    }

    setIsFixingMembership(true);
    setError(null);

    try {
      await fixOrganizationMembership(user.uid, currentOrganization.id);
      
      // Reload organization data
      await loadUserOrganizations();
      
      setRecoveryResult({
        success: true,
        message: 'Organization membership fixed! You should now be properly connected to your organization.',
        type: 'membership'
      });
    } catch (error) {
      setError('Failed to fix membership: ' + error.message);
    } finally {
      setIsFixingMembership(false);
    }
  };

  const performTargetedRecovery = async () => {
    if (!user || !currentOrganization) {
      setError('User or organization not available for recovery');
      return;
    }

    if (selectedProjects.length === 0) {
      setError('Please select at least one project to recover');
      return;
    }

    setIsRecovering(true);
    setError(null);
    setRecoveryResult(null);

    try {
      const result = await recoverSpecificProjects(selectedProjects, currentOrganization.id);
      setRecoveryResult(result);
      
      // Refresh the page after successful recovery to reload data
      if (result.success && result.projectsRecovered > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setError('Recovery failed: ' + error.message);
    } finally {
      setIsRecovering(false);
    }
  };

  if (!user || !currentOrganization) {
    return (
      <Alert severity="warning">
        User or organization not loaded. Please make sure you're logged in and have an organization.
      </Alert>
    );
  }

  return (
    <Card sx={{ maxWidth: 900, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          🎯 Targeted Project Recovery
        </Typography>
        <Typography variant="body1" paragraph>
          Based on the debug results, we found several projects in the old structure. Select which ones you want to recover.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Current User:</strong> {user.email} ({user.uid})<br/>
          <strong>Current Organization:</strong> {currentOrganization.name} ({currentOrganization.id})
        </Typography>

        {/* Fix Organization Membership */}
        <Box mb={3}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6">🔧 Organization Membership Issue Detected</Typography>
            <Typography>You're not properly connected to your organization. Fix this first before recovering projects.</Typography>
          </Alert>
          
          <Button
            variant="contained"
            color="warning"
            onClick={fixMembership}
            disabled={isFixingMembership || isRecovering}
            startIcon={isFixingMembership ? <CircularProgress size={20} /> : null}
          >
            {isFixingMembership ? 'Fixing Membership...' : 'Fix Organization Membership'}
          </Button>
        </Box>

        {/* Project Selection */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            📋 Available Projects to Recover
          </Typography>
          
          <Box mb={2}>
            <Button variant="outlined" size="small" onClick={selectAllProjects} sx={{ mr: 1 }}>
              Select All
            </Button>
            <Button variant="outlined" size="small" onClick={clearSelection}>
              Clear Selection
            </Button>
          </Box>

          <List>
            {availableProjects.map((project) => (
              <ListItem key={project.id} dense>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onChange={(e) => handleProjectSelection(project.id, e.target.checked)}
                    />
                  }
                  label={
                    <ListItemText
                      primary={project.name}
                      secondary={`ID: ${project.id} | Created: ${project.created} | Original User: ${project.userId}`}
                    />
                  }
                />
                {project.userId === user.uid && (
                  <Typography variant="caption" color="primary" sx={{ ml: 2 }}>
                    ✓ Your project
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {recoveryResult && (
          <Alert severity={recoveryResult.success ? "success" : "error"} sx={{ my: 2 }}>
            <Typography variant="h6">
              {recoveryResult.type === 'membership' ? 'Membership Fix Result' : 'Recovery Result'}
            </Typography>
            <Typography>{recoveryResult.message}</Typography>
            {recoveryResult.success && recoveryResult.projectsRecovered > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                ✅ Projects: {recoveryResult.projectsRecovered}<br/>
                ✅ Features: {recoveryResult.featuresRecovered}<br/>
                ✅ Categories: {recoveryResult.categoriesRecovered}<br/>
                ✅ Integrations: {recoveryResult.integrationsRecovered}
              </Typography>
            )}
            {recoveryResult.success && recoveryResult.projectsRecovered > 0 && (
              <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                Page will refresh in 3 seconds to show recovered data...
              </Typography>
            )}
          </Alert>
        )}

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={performTargetedRecovery}
            disabled={isRecovering || isFixingMembership || selectedProjects.length === 0}
            startIcon={isRecovering ? <CircularProgress size={20} /> : null}
          >
            {isRecovering ? 'Recovering...' : `Recover ${selectedProjects.length} Selected Projects`}
          </Button>
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          This tool will copy the selected projects from the old structure to your organization, 
          updating the ownership to your current user ID. All features, categories, and integrations will be preserved.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TargetedRecoveryComponent;
