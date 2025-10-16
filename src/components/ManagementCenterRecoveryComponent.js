import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, Alert, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { useOrganization } from '../OrganizationContext';
import { recreateManagementCenterFeatures } from '../utils/managementCenterRecovery';

const ManagementCenterRecoveryComponent = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const { currentOrganization } = useOrganization();
  const [isRecreating, setIsRecreating] = useState(false);
  const [recreationResult, setRecreationResult] = useState(null);
  const [error, setError] = useState(null);

  // Management Center 2.0 project ID from your debug data
  const managementCenterProjectId = 'sxf0bQ1wz7WPsIC8Un0l';

  const performFeatureRecreation = async () => {
    if (!user || !currentOrganization) {
      setError('User or organization not available for recreation');
      return;
    }

    setIsRecreating(true);
    setError(null);
    setRecreationResult(null);

    try {
      const result = await recreateManagementCenterFeatures(currentOrganization.id, managementCenterProjectId);
      setRecreationResult(result);
      
      // Refresh the page after successful recreation to show features
      if (result.success && result.createdFeatures > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setError('Feature recreation failed: ' + error.message);
    } finally {
      setIsRecreating(false);
    }
  };

  if (!user || !currentOrganization) {
    return (
      <Alert severity="warning">
        User or organization not loaded. Please make sure you're logged in and have an organization.
      </Alert>
    );
  }

  const featureCategories = [
    { name: "Dashboard Components", count: 15, examples: ["Responsive Charts", "Total Maps Status Card", "Health Check Bento Box"] },
    { name: "Member Management", count: 8, examples: ["Member status tracking", "CPU and memory monitoring", "Heartbeat monitoring"] },
    { name: "Alerting & Logging", count: 8, examples: ["Centralized logging", "Alert management system", "Real-time notifications"] },
    { name: "Data Management", count: 5, examples: ["Maps & Caches", "Cache Management", "Data Structures"] },
    { name: "Developer Tools", count: 4, examples: ["Developer Console", "SQL Browser", "Jet Pipeline Designer"] },
    { name: "User Experience", count: 6, examples: ["Keyboard shortcuts", "Guided tours", "Dark mode and themes"] },
    { name: "Observability", count: 5, examples: ["Real-time Monitoring Dashboard", "System Logs", "Diagnostic Logging"] },
    { name: "Other Categories", count: 12, examples: ["AI Assistant", "Business Intelligence", "Deployment & Operations"] }
  ];

  return (
    <Card sx={{ maxWidth: 900, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          🏗️ Management Center 2.0 Feature Recreation
        </Typography>
        <Typography variant="body1" paragraph>
          Recreate all your specific Management Center 2.0 features exactly as you described them.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Target Project:</strong> Management Center 2.0 ({managementCenterProjectId})<br/>
          <strong>Total Features to Recreate:</strong> 53 comprehensive features<br/>
          <strong>Organization:</strong> {currentOrganization.name}
        </Typography>

        {/* Feature Categories Overview */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            📊 Features to be Recreated:
          </Typography>
          <List dense>
            {featureCategories.map((category, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {category.name}
                      </Typography>
                      <Chip label={`${category.count} features`} size="small" color="primary" />
                    </Box>
                  }
                  secondary={`Examples: ${category.examples.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">🎯 What This Will Recreate:</Typography>
          <Typography variant="body2">
            All 53 features from your Management Center 2.0 project including:
            <br/>• Complete feature descriptions and user stories
            <br/>• Impact scores, priorities (Must-Have, Should-Have, Could-Have)
            <br/>• Categories, states, story points, and quarters
            <br/>• All the specific details you provided (HIVE Update, Responsive Charts, AI Assistant, etc.)
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {recreationResult && (
          <Alert severity={recreationResult.success ? "success" : "error"} sx={{ my: 2 }}>
            <Typography variant="h6">Recreation Result</Typography>
            <Typography>{recreationResult.message}</Typography>
            {recreationResult.success && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  ✅ Features created: {recreationResult.createdFeatures}<br/>
                  ℹ️ Features skipped (already existed): {recreationResult.skippedFeatures}<br/>
                  📊 Total features processed: {recreationResult.totalFeatures}
                </Typography>
                
                {recreationResult.creationLog && recreationResult.creationLog.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Creation Log (showing first 10):</Typography>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {recreationResult.creationLog.slice(0, 10).map((logEntry, index) => (
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
                    {recreationResult.creationLog.length > 10 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {recreationResult.creationLog.length - 10} more entries
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
            {recreationResult.success && recreationResult.createdFeatures > 0 && (
              <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                Page will refresh in 3 seconds to show recreated features...
              </Typography>
            )}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={performFeatureRecreation}
          disabled={isRecreating}
          startIcon={isRecreating ? <CircularProgress size={20} /> : null}
          size="large"
          sx={{ mt: 2 }}
        >
          {isRecreating ? 'Recreating Features...' : 'Recreate All 53 Management Center 2.0 Features'}
        </Button>

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          This will recreate all your Management Center 2.0 features exactly as you described them, 
          with all the details including HIVE Update, Keyboard shortcuts, AI Assistant, Dashboard components, etc.
          Features that already exist will be skipped to avoid duplicates.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ManagementCenterRecoveryComponent;
