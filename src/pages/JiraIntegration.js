import React, { useState, useEffect } from 'react';
import { useProject } from '../ProjectContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function JiraIntegration() {
  const { selectedProject } = useProject();
  const [config, setConfig] = useState({
    jiraUrl: '',
    email: '',
    apiToken: '',
    projectKey: '',
    issueType: 'Epic'
  });
  const [showApiToken, setShowApiToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Load existing configuration
  useEffect(() => {
    const loadConfig = async () => {
      if (!selectedProject) return;
      
      try {
        const configDoc = await getDoc(doc(db, 'projects', selectedProject, 'integrations', 'jira'));
        if (configDoc.exists()) {
          setConfig(configDoc.data());
        }
      } catch (error) {
        console.error('Error loading Jira config:', error);
      }
    };

    loadConfig();
  }, [selectedProject]);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setConnectionStatus(null); // Reset connection status when config changes
  };

  const saveConfiguration = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'projects', selectedProject, 'integrations', 'jira'), config);
      setStatusMessage('Configuration saved successfully!');
      setConnectionStatus('success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setStatusMessage('Failed to save configuration');
      setConnectionStatus('error');
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!config.jiraUrl || !config.email || !config.apiToken) {
      setStatusMessage('Please fill in all required fields');
      setConnectionStatus('error');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsTesting(true);
    setConnectionStatus(null);

    try {
      // Test connection by trying to fetch user info
      const auth = btoa(`${config.email}:${config.apiToken}`);
      const response = await fetch(`${config.jiraUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setConnectionStatus('success');
        setStatusMessage(`Connection successful! Connected as ${userData.displayName}`);
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        setStatusMessage(`Connection failed: ${errorData.errorMessages?.[0] || 'Authentication error'}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`Connection failed: ${error.message}`);
    } finally {
      setIsTesting(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  if (!selectedProject) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please select a project to configure Jira integration.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>

      {statusMessage && (
        <Alert 
          severity={connectionStatus === 'success' ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          icon={connectionStatus === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          {statusMessage}
        </Alert>
      )}

      <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '4px', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
          Connection Settings
        </Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <TextField
              label="Jira URL"
              placeholder="https://yourcompany.atlassian.net"
              value={config.jiraUrl}
              onChange={(e) => handleConfigChange('jiraUrl', e.target.value)}
              fullWidth
              helperText="Your Jira instance URL (without trailing slash)"
            />

            <TextField
              label="Email"
              placeholder="your.email@company.com"
              value={config.email}
              onChange={(e) => handleConfigChange('email', e.target.value)}
              fullWidth
              helperText="Your Jira account email"
            />

            <TextField
              label="API Token"
              type={showApiToken ? 'text' : 'password'}
              value={config.apiToken}
              onChange={(e) => handleConfigChange('apiToken', e.target.value)}
              fullWidth
              helperText="Generate this from Jira Account Settings > Security > API tokens"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowApiToken(!showApiToken)}
                      edge="end"
                    >
                      {showApiToken ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Project Key"
                placeholder="PROJ"
                value={config.projectKey}
                onChange={(e) => handleConfigChange('projectKey', e.target.value.toUpperCase())}
                helperText="Jira project key (e.g., PROJ, DEV)"
              />

              <FormControl fullWidth>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={config.issueType}
                  label="Issue Type"
                  onChange={(e) => handleConfigChange('issueType', e.target.value)}
                >
                  <MenuItem value="Epic">Epic</MenuItem>
                  <MenuItem value="Story">Story</MenuItem>
                  <MenuItem value="Task">Task</MenuItem>
                  <MenuItem value="Feature">Feature</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={testConnection}
              disabled={isTesting || !config.jiraUrl || !config.email || !config.apiToken}
              startIcon={isTesting ? <CircularProgress size={20} /> : null}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>

            <Button
              variant="contained"
              onClick={saveConfiguration}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '4px' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '0.9rem' }}>
          How to Set Up API Token
        </Typography>
          
          <Box component="ol" sx={{ pl: 2 }}>
            <Box component="li" sx={{ mb: 1 }}>
              Go to your Jira account settings: <strong>Account Settings → Security</strong>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              Click <strong>"Create API token"</strong>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              Give it a label (e.g., "Feature Management Tool")
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              Copy the generated token and paste it above
            </Box>
            <Box component="li">
              <strong>Note:</strong> Keep this token secure - it gives full access to your Jira account
            </Box>
          </Box>
      </Box>
    </Box>
  );
}

export default JiraIntegration;
