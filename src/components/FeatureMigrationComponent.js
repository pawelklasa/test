import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert, CircularProgress, TextField, List, ListItem, ListItemText } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { useOrganization } from '../OrganizationContext';
import { migrateFeaturesToNestedStructure, fixOrganizationName } from '../utils/featureMigration';

const FeatureMigrationComponent = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { currentOrganization, loadUserOrganizations } = useOrganization();
  const [isMigrating, setIsMigrating] = useState(false);
  const [isFixingName, setIsFixingName] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [nameFixResult, setNameFixResult] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [error, setError] = useState(null);

  const performFeatureMigration = async () => {
    if (!user || !currentOrganization) {
      setError('User or organization not available for migration');
      return;
    }

    setIsMigrating(true);
    setError(null);
    setMigrationResult(null);

    try {
      const result = await migrateFeaturesToNestedStructure(currentOrganization.id);
      setMigrationResult(result);
      
      // Refresh the page after successful migration to show features
      if (result.success && result.migratedFeatures > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setError('Migration failed: ' + error.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const fixOrgName = async () => {
    if (!user || !currentOrganization || !newOrgName.trim()) {
      setError('Please enter a new organization name');
      return;
    }

    setIsFixingName(true);
    setError(null);
    setNameFixResult(null);

    try {
      const result = await fixOrganizationName(currentOrganization.id, newOrgName.trim());
      setNameFixResult(result);
      
      // Reload organization data
      await loadUserOrganizations();
      
      // Refresh page to show new name
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError('Name fix failed: ' + error.message);
    } finally {
      setIsFixingName(false);
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
          🔧 Feature Migration & Organization Fix
        </Typography>
        <Typography variant="body1" paragraph>
          Based on the debug results, your features are in the old flat structure and need to be migrated to work properly.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Current User:</strong> {user.email}<br/>
          <strong>Current Organization:</strong> {currentOrganization.name} ({currentOrganization.id})<br/>
          <strong>Issue:</strong> Features are in old structure, need migration to nested structure
        </Typography>

        {/* Fix Organization Name */}
        <Box mb={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">📝 Fix Organization Name</Typography>
            <Typography>Your organization is named "undefined's Organization". Let's give it a proper name.</Typography>
          </Alert>
          
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label="New Organization Name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="e.g., My Company, Team Project, etc."
              size="small"
              sx={{ minWidth: 250 }}
            />
            <Button
              variant="outlined"
              onClick={fixOrgName}
              disabled={isFixingName || isMigrating || !newOrgName.trim()}
              startIcon={isFixingName ? <CircularProgress size={20} /> : null}
            >
              {isFixingName ? 'Fixing...' : 'Fix Name'}
            </Button>
          </Box>
        </Box>

        {/* Feature Migration */}
        <Box mb={3}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6">🔧 Feature Migration Required</Typography>
            <Typography>
              Your features are stored in the old flat structure and need to be migrated to the new nested structure
              so they appear in your projects.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Current:</strong> organizations/{currentOrganization.id}/features/<br/>
              <strong>Required:</strong> organizations/{currentOrganization.id}/projects/[projectId]/features/
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            onClick={performFeatureMigration}
            disabled={isMigrating || isFixingName}
            startIcon={isMigrating ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {isMigrating ? 'Migrating Features...' : 'Migrate 91 Features to Nested Structure'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {nameFixResult && (
          <Alert severity="success" sx={{ my: 2 }}>
            <Typography variant="h6">Organization Name Fixed</Typography>
            <Typography>{nameFixResult.message}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Page will refresh in 2 seconds to show the new name...
            </Typography>
          </Alert>
        )}

        {migrationResult && (
          <Alert severity={migrationResult.success ? "success" : "error"} sx={{ my: 2 }}>
            <Typography variant="h6">Migration Result</Typography>
            <Typography>{migrationResult.message}</Typography>
            {migrationResult.success && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  ✅ Features migrated: {migrationResult.migratedFeatures}<br/>
                  ✅ Projects processed: {migrationResult.projectsProcessed}<br/>
                  ⚠️ Errors: {migrationResult.errorCount}
                </Typography>
                
                {migrationResult.migrationLog && migrationResult.migrationLog.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Migration Log:</Typography>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {migrationResult.migrationLog.map((logEntry, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={logEntry}
                            sx={{ 
                              '& .MuiListItemText-primary': { 
                                fontSize: '0.875rem',
                                fontFamily: 'monospace'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
            {migrationResult.success && migrationResult.migratedFeatures > 0 && (
              <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                Page will refresh in 3 seconds to show migrated features...
              </Typography>
            )}
          </Alert>
        )}

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          This migration will move all features from the old flat structure to the proper nested structure 
          so they appear correctly in each project. The old structure will be cleaned up after successful migration.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureMigrationComponent;
