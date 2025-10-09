import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecommendIcon from '@mui/icons-material/Recommend';
import WarningIcon from '@mui/icons-material/Warning';

function ActionableInsights() {
  const insights = [
    {
      title: 'Onboarding Conversion Drop',
      description: 'User onboarding completion rate dropped 15% this week. Consider simplifying the sign-up flow.',
      type: 'warning',
      impact: 'High',
      action: 'Review onboarding funnel'
    },
    {
      title: 'Feature Adoption Opportunity',
      description: 'Only 23% of users have tried the new collaboration features. Increase visibility in UI.',
      type: 'opportunity',
      impact: 'Medium',
      action: 'Add feature tour'
    },
    {
      title: 'Performance Improvement',
      description: 'API response time improved by 40% after recent optimizations. User engagement up 12%.',
      type: 'success',
      impact: 'High',
      action: 'Document best practices'
    }
  ];

  const recommendations = [
    'Implement A/B testing for new pricing page layout',
    'Add email reminders for incomplete gap analyses',
    'Create video tutorials for advanced features',
    'Enable SSO for enterprise customers'
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Actionable Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Transform raw data into strategic insights that drive decisions
      </Typography>

      {/* Key Insights */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {insights.map((insight, index) => (
          <Grid item xs={12} key={index}>
            <Card
              sx={{
                borderLeft: 4,
                borderColor: insight.type === 'warning' ? '#fa709a' :
                           insight.type === 'opportunity' ? '#667eea' : '#43e97b'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {insight.type === 'warning' && <WarningIcon sx={{ color: '#fa709a', fontSize: 32 }} />}
                    {insight.type === 'opportunity' && <TrendingUpIcon sx={{ color: '#667eea', fontSize: 32 }} />}
                    {insight.type === 'success' && <RecommendIcon sx={{ color: '#43e97b', fontSize: 32 }} />}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {insight.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Impact: {insight.impact}
                      </Typography>
                    </Box>
                  </Box>
                  <Button variant="outlined" size="small">
                    View Details
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {insight.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Recommended Action: {insight.action}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* AI Recommendations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RecommendIcon sx={{ color: '#667eea' }} />
          AI-Powered Recommendations
        </Typography>
        <Box sx={{ mt: 2 }}>
          {recommendations.map((rec, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 1,
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2">{rec}</Typography>
              <Button size="small" variant="text">Apply</Button>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

export default ActionableInsights;
