import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function AutomatedWorkflows() {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Auto-assign New Gaps',
      description: 'Automatically assign new gaps to team members based on expertise',
      enabled: true,
      triggers: 3,
      actions: 2
    },
    {
      id: 2,
      name: 'Weekly Summary Email',
      description: 'Send weekly summary of gap analysis progress to stakeholders',
      enabled: true,
      triggers: 1,
      actions: 1
    },
    {
      id: 3,
      name: 'Priority Alert System',
      description: 'Alert team when high-priority gaps are created or updated',
      enabled: false,
      triggers: 2,
      actions: 3
    },
    {
      id: 4,
      name: 'Auto-close Resolved Gaps',
      description: 'Automatically close gaps that have been marked as resolved for 7 days',
      enabled: true,
      triggers: 1,
      actions: 2
    }
  ]);

  const workflowTemplates = [
    { name: 'Slack Notification on New Gap', category: 'Notifications' },
    { name: 'Export Weekly Report to Google Drive', category: 'Reporting' },
    { name: 'Create Jira Ticket from Gap', category: 'Integration' },
    { name: 'Send Reminder for Overdue Items', category: 'Automation' }
  ];

  const toggleWorkflow = (id) => {
    setWorkflows(workflows.map(w =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Automated Workflows
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Automate repetitive tasks and streamline your gap analysis process
      </Typography>

      {/* Workflow Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {workflows.filter(w => w.enabled).length}
              </Typography>
              <Typography variant="body2">Active Workflows</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#43e97b', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>1,234</Typography>
              <Typography variant="body2">Tasks Automated</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f093fb', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>48hrs</Typography>
              <Typography variant="body2">Time Saved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4facfe', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>99.8%</Typography>
              <Typography variant="body2">Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Active Workflows */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Your Workflows</Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Create Workflow
              </Button>
            </Box>

            <Box>
              {workflows.map((workflow) => (
                <Card key={workflow.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                            {workflow.name}
                          </Typography>
                          <Chip
                            label={workflow.enabled ? 'Active' : 'Inactive'}
                            size="small"
                            color={workflow.enabled ? 'success' : 'default'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {workflow.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {workflow.triggers} trigger{workflow.triggers > 1 ? 's' : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {workflow.actions} action{workflow.actions > 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button size="small" variant="outlined" startIcon={<PlayArrowIcon />}>
                          Test
                        </Button>
                        <Switch
                          checked={workflow.enabled}
                          onChange={() => toggleWorkflow(workflow.id)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Workflow Templates */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Templates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Quick start with pre-built templates
            </Typography>

            <Box>
              {workflowTemplates.map((template, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {template.name}
                  </Typography>
                  <Chip label={template.category} size="small" variant="outlined" />
                </Box>
              ))}
            </Box>

            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              Browse All Templates
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Workflow Builder Preview */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: '#f0f9ff', borderLeft: 4, borderColor: '#667eea' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#667eea' }}>
          Build Custom Workflows
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create powerful automations with our visual workflow builder. Connect triggers, conditions, and actions to automate your gap analysis process.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label="When: Gap Created" sx={{ bgcolor: 'white' }} />
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>→</Typography>
          <Chip label="If: Priority = High" sx={{ bgcolor: 'white' }} />
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>→</Typography>
          <Chip label="Then: Send Notification" sx={{ bgcolor: 'white' }} />
        </Box>
      </Paper>
    </Box>
  );
}

export default AutomatedWorkflows;
