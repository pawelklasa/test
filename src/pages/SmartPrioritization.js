import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function SmartPrioritization() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Implement SSO Authentication',
      impact: 'High',
      effort: 'Medium',
      priority: 95,
      aiScore: 'Critical'
    },
    {
      id: 2,
      title: 'Mobile App Performance Optimization',
      impact: 'High',
      effort: 'Low',
      priority: 88,
      aiScore: 'High Priority'
    },
    {
      id: 3,
      title: 'User Dashboard Redesign',
      impact: 'Medium',
      effort: 'High',
      priority: 72,
      aiScore: 'Medium Priority'
    },
    {
      id: 4,
      title: 'Email Notification System',
      impact: 'Medium',
      effort: 'Medium',
      priority: 65,
      aiScore: 'Medium Priority'
    },
    {
      id: 5,
      title: 'Documentation Updates',
      impact: 'Low',
      effort: 'Low',
      priority: 45,
      aiScore: 'Low Priority'
    }
  ]);

  const getScoreColor = (score) => {
    if (score === 'Critical') return '#fa709a';
    if (score === 'High Priority') return '#667eea';
    if (score === 'Medium Priority') return '#f093fb';
    return '#43e97b';
  };

  const getImpactColor = (impact) => {
    if (impact === 'High') return 'error';
    if (impact === 'Medium') return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Smart Prioritization
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered recommendations help you focus on what matters most
      </Typography>

      {/* AI Insights */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f0f4ff', borderLeft: 4, borderColor: '#667eea' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
          <AutoAwesomeIcon sx={{ color: '#667eea', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#667eea' }}>
              AI Recommendation
            </Typography>
            <Typography variant="body2" paragraph>
              Based on your team's current workload and business goals, we recommend prioritizing
              <strong> SSO Authentication</strong> and <strong>Mobile App Performance</strong> this sprint.
              These items have the highest impact-to-effort ratio and align with your Q4 objectives.
            </Typography>
            <Button variant="contained" size="small" sx={{ mt: 1 }}>
              Apply Recommendations
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Priority Matrix Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Priority Distribution
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Chip label="Critical: 1 item" sx={{ bgcolor: '#fa709a', color: 'white' }} />
            <Chip label="High: 1 item" sx={{ bgcolor: '#667eea', color: 'white' }} />
            <Chip label="Medium: 2 items" sx={{ bgcolor: '#f093fb', color: 'white' }} />
            <Chip label="Low: 1 item" sx={{ bgcolor: '#43e97b', color: 'white' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Prioritized Items List */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Prioritized Backlog
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Items are automatically sorted by AI priority score
        </Typography>

        <Box>
          {items.map((item, index) => (
            <Card
              key={item.id}
              sx={{
                mb: 2,
                borderLeft: 4,
                borderColor: getScoreColor(item.aiScore),
                cursor: 'move',
                '&:hover': { boxShadow: 3 }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <DragIndicatorIcon sx={{ color: '#999' }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        {index + 1}. {item.title}
                      </Typography>
                      <Chip
                        label={item.aiScore}
                        size="small"
                        sx={{
                          bgcolor: getScoreColor(item.aiScore),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`Impact: ${item.impact}`} size="small" color={getImpactColor(item.impact)} />
                      <Chip label={`Effort: ${item.effort}`} size="small" variant="outlined" />
                      <Chip
                        icon={<AutoAwesomeIcon />}
                        label={`AI Score: ${item.priority}/100`}
                        size="small"
                        sx={{ bgcolor: '#f5f5f5' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
          Add New Item
        </Button>
      </Paper>
    </Box>
  );
}

export default SmartPrioritization;
