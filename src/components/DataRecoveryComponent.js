import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { useOrganization } from '../OrganizationContext';
import { recoverUserDataToOrganization, checkOldDataExists } from '../utils/dataRecovery';
import TargetedRecoveryComponent from './TargetedRecoveryComponent';
import FeatureMigrationComponent from './FeatureMigrationComponent';
import ManagementCenterRecoveryComponent from './ManagementCenterRecoveryComponent';

const DataRecoveryComponent = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { currentOrganization } = useOrganization();
  const [isChecking, setIsChecking] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [oldDataInfo, setOldDataInfo] = useState(null);
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && currentOrganization) {
      checkForOldData();
    }
  }, [user, currentOrganization]);

  const checkForOldData = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const result = await checkOldDataExists(user.uid);
      setOldDataInfo(result);
    } catch (error) {
      setError('Error checking for old data: ' + error.message);
    } finally {
      setIsChecking(false);
    }
  };

  const performRecovery = async () => {
    if (!user || !currentOrganization) {
      setError('User or organization not available for recovery');
      return;
    }

    setIsRecovering(true);
    setError(null);
    setRecoveryResult(null);

    try {
      const result = await recoverUserDataToOrganization(user.uid, currentOrganization.id);
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
    <>
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="error">
          🚨 Data Recovery Tool
        </Typography>
        <Typography variant="body1" paragraph>
          This tool will help recover your projects that were in the old structure and move them to your organization.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Current User:</strong> {user.email}<br/>
          <strong>Current Organization:</strong> {currentOrganization.name} ({currentOrganization.id})
        </Typography>

        {isChecking && (
          <Box display="flex" alignItems="center" gap={2} my={2}>
            <CircularProgress size={20} />
            <Typography>Checking for old data...</Typography>
          </Box>
        )}

        {oldDataInfo && !isChecking && (
          <Box my={2}>
            {oldDataInfo.hasOldData ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="h6">Old Data Found!</Typography>
                <Typography>Found {oldDataInfo.oldProjectsCount} projects in the old structure.</Typography>
                
                {oldDataInfo.projects.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Projects to recover:</Typography>
                    <List dense>
                      {oldDataInfo.projects.map((project) => (
                        <ListItem key={project.id} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={project.name} 
                            secondary={`ID: ${project.id} | Created: ${project.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Alert>
            ) : (
              <Alert severity="success">
                No old data found. Your projects may already be in the organization structure.
              </Alert>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {recoveryResult && (
          <Alert severity={recoveryResult.success ? "success" : "error"} sx={{ my: 2 }}>
            <Typography variant="h6">Recovery Result</Typography>
            <Typography>{recoveryResult.message}</Typography>
            {recoveryResult.success && (
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
            variant="outlined"
            onClick={checkForOldData}
            disabled={isChecking || isRecovering}
          >
            {isChecking ? 'Checking...' : 'Check for Old Data'}
          </Button>

          {oldDataInfo?.hasOldData && (
            <Button
              variant="contained"
              color="primary"
              onClick={performRecovery}
              disabled={isRecovering || isChecking}
              startIcon={isRecovering ? <CircularProgress size={20} /> : null}
            >
              {isRecovering ? 'Recovering...' : `Recover ${oldDataInfo.oldProjectsCount} Projects`}
            </Button>
          )}
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          This recovery tool looks for projects in the old structure (collection: 'projects' where userId = your user ID) 
          and moves them to your organization structure (collection: 'organizations/[orgId]/projects').
        </Typography>
      </CardContent>
    </Card>
    
    <Box mt={3}>
      <ManagementCenterRecoveryComponent />
    </Box>
    
    <Box mt={3}>
      <FeatureMigrationComponent />
    </Box>
    
    <Box mt={3}>
      <TargetedRecoveryComponent />
    </Box>
    </>
  );
};

export default DataRecoveryComponent;
