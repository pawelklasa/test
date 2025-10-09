import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';

function RealtimeTracking() {
  const [metrics, setMetrics] = useState({
    activeUsers: 234,
    gapsAnalyzed: 45,
    completionRate: 68,
    avgResponseTime: 1.2
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        gapsAnalyzed: prev.gapsAnalyzed + Math.floor(Math.random() * 3),
        completionRate: Math.min(100, prev.completionRate + Math.random() * 2),
        avgResponseTime: Math.max(0.5, prev.avgResponseTime + (Math.random() - 0.5) * 0.2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const liveActivities = [
    { user: 'Sarah J.', action: 'Created new gap analysis', status: 'active', time: 'Just now' },
    { user: 'Mike C.', action: 'Updated priority settings', status: 'active', time: '1 min ago' },
    { user: 'Emily D.', action: 'Completed workflow automation', status: 'completed', time: '3 min ago' },
    { user: 'Alex K.', action: 'Exported metrics report', status: 'completed', time: '5 min ago' }
  ];

  const projectProgress = [
    { name: 'Mobile App Gap Analysis', progress: 85, status: 'On Track' },
    { name: 'API Documentation Review', progress: 45, status: 'In Progress' },
    { name: 'User Research Insights', progress: 92, status: 'Near Completion' }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Real-time Tracking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor progress and measure impact with live analytics
          </Typography>
        </Box>
        <Chip label="🟢 Live" color="success" />
      </Box>

      {/* Real-time Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                {metrics.activeUsers}
              </Typography>
              <Typography variant="caption" color="success.main">
                +12% from yesterday
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gaps Analyzed Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f093fb' }}>
                {metrics.gapsAnalyzed}
              </Typography>
              <Typography variant="caption" color="success.main">
                +8% from yesterday
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#43e97b' }}>
                {metrics.completionRate.toFixed(0)}%
              </Typography>
              <Typography variant="caption" color="success.main">
                +5% from yesterday
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4facfe' }}>
                {metrics.avgResponseTime.toFixed(1)}s
              </Typography>
              <Typography variant="caption" color="error.main">
                -15% from yesterday
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Live Activity Feed */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Live Activity Feed
            </Typography>
            <Box sx={{ mt: 2 }}>
              {liveActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    borderLeft: 3,
                    borderColor: activity.status === 'active' ? '#667eea' : '#43e97b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {activity.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.action}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Project Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Project Progress
            </Typography>
            <Box sx={{ mt: 2 }}>
              {projectProgress.map((project, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {project.name}
                    </Typography>
                    <Chip label={project.status} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: project.progress > 80 ? '#43e97b' : project.progress > 50 ? '#667eea' : '#f093fb'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default RealtimeTracking;
