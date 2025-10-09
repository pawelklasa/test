import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

function IntegrationHub() {
  const [searchQuery, setSearchQuery] = useState('');

  const connectedIntegrations = [
    {
      name: 'Slack',
      description: 'Team communication and notifications',
      status: 'Connected',
      logo: '💬',
      color: '#4A154B'
    },
    {
      name: 'Jira',
      description: 'Issue tracking and project management',
      status: 'Connected',
      logo: '📋',
      color: '#0052CC'
    },
    {
      name: 'Google Drive',
      description: 'Cloud storage and file sharing',
      status: 'Connected',
      logo: '📁',
      color: '#4285F4'
    }
  ];

  const availableIntegrations = [
    {
      name: 'GitHub',
      description: 'Code repository and version control',
      category: 'Development',
      logo: '⚙️',
      color: '#181717'
    },
    {
      name: 'Asana',
      description: 'Work management and team collaboration',
      category: 'Project Management',
      logo: '✓',
      color: '#F06A6A'
    },
    {
      name: 'Salesforce',
      description: 'Customer relationship management',
      category: 'CRM',
      logo: '☁️',
      color: '#00A1E0'
    },
    {
      name: 'Zapier',
      description: 'Connect with 3000+ apps',
      category: 'Automation',
      logo: '⚡',
      color: '#FF4A00'
    },
    {
      name: 'Microsoft Teams',
      description: 'Team chat and collaboration',
      category: 'Communication',
      logo: '👥',
      color: '#6264A7'
    },
    {
      name: 'Trello',
      description: 'Visual project management',
      category: 'Project Management',
      logo: '📊',
      color: '#0079BF'
    },
    {
      name: 'Notion',
      description: 'All-in-one workspace',
      category: 'Productivity',
      logo: '📝',
      color: '#000000'
    },
    {
      name: 'Figma',
      description: 'Design and prototyping tool',
      category: 'Design',
      logo: '🎨',
      color: '#F24E1E'
    },
    {
      name: 'Zendesk',
      description: 'Customer service and support',
      category: 'Support',
      logo: '🎫',
      color: '#03363D'
    }
  ];

  const filteredIntegrations = availableIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Integration Hub
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Connect with your favorite tools and sync data seamlessly
      </Typography>

      {/* Connected Integrations */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Connected Apps ({connectedIntegrations.length})
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {connectedIntegrations.map((integration, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderLeft: 4, borderColor: integration.color }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        bgcolor: `${integration.color}20`,
                        borderRadius: 2
                      }}
                    >
                      {integration.logo}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {integration.name}
                      </Typography>
                      <Chip label={integration.status} size="small" color="success" />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {integration.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">Configure</Button>
                    <Button size="small" color="error">Disconnect</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Available Integrations */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Available Integrations</Typography>
          <TextField
            size="small"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <Grid container spacing={2}>
          {filteredIntegrations.map((integration, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        bgcolor: '#f5f5f5',
                        borderRadius: 2
                      }}
                    >
                      {integration.logo}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {integration.name}
                      </Typography>
                      <Chip label={integration.category} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {integration.description}
                  </Typography>
                  <Button variant="contained" fullWidth>
                    Connect
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* API Access */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: '#f0f9ff', borderLeft: 4, borderColor: '#667eea' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#667eea' }}>
          Custom Integration with API
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Build custom integrations using our REST API. Access all features programmatically and integrate with any tool.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained">View API Docs</Button>
          <Button variant="outlined">Generate API Key</Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default IntegrationHub;
