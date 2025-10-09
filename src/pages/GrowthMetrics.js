import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function GrowthMetrics() {
  const kpis = [
    { label: 'User Growth', value: '42%', trend: 'up', change: '+12%', color: '#667eea' },
    { label: 'Feature Adoption', value: '68%', trend: 'up', change: '+8%', color: '#43e97b' },
    { label: 'Time to Resolution', value: '2.3 days', trend: 'down', change: '-15%', color: '#f093fb' },
    { label: 'Customer Satisfaction', value: '4.7/5', trend: 'up', change: '+0.3', color: '#4facfe' }
  ];

  const monthlyMetrics = [
    { month: 'Jan', gaps: 45, resolved: 32, revenue: 12500 },
    { month: 'Feb', gaps: 52, resolved: 38, revenue: 15200 },
    { month: 'Mar', gaps: 48, resolved: 42, revenue: 18900 },
    { month: 'Apr', gaps: 55, resolved: 48, revenue: 22400 },
    { month: 'May', gaps: 60, resolved: 52, revenue: 26800 },
    { month: 'Jun', gaps: 58, resolved: 55, revenue: 31200 }
  ];

  const impactAreas = [
    { name: 'Product Quality', score: 85, change: '+12%' },
    { name: 'Team Efficiency', score: 78, change: '+8%' },
    { name: 'Customer Retention', score: 92, change: '+5%' },
    { name: 'Market Competitiveness', score: 73, change: '+18%' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Growth Metrics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track improvements and showcase ROI with comprehensive metrics
      </Typography>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.label}
                  </Typography>
                  {kpi.trend === 'up' ? (
                    <TrendingUpIcon sx={{ color: '#43e97b', fontSize: 20 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#43e97b', fontSize: 20 }} />
                  )}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: kpi.color, mb: 1 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#43e97b', fontWeight: 600 }}>
                  {kpi.change} this quarter
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Performance */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Performance Trend
            </Typography>
            <Box sx={{ mt: 3 }}>
              {monthlyMetrics.map((data, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data.month}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Revenue: ${data.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Gaps Identified: {data.gaps}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(data.gaps / 60) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': { bgcolor: '#667eea' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Gaps Resolved: {data.resolved}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(data.resolved / 60) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': { bgcolor: '#43e97b' }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Impact Areas */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Impact Areas
            </Typography>
            <Box sx={{ mt: 3 }}>
              {impactAreas.map((area, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {area.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#43e97b', fontWeight: 600 }}>
                      {area.change}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={area.score}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: area.score > 80 ? '#43e97b' : area.score > 60 ? '#667eea' : '#f093fb'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ minWidth: 30, fontWeight: 600 }}>
                      {area.score}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ROI Summary */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: '#f0f9ff', borderLeft: 4, borderColor: '#667eea' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#667eea' }}>
          ROI Summary (Last 6 Months)
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Total Gaps Resolved
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
              267
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Time Saved
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#43e97b' }}>
              340hrs
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Revenue Impact
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f093fb' }}>
              $127K
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default GrowthMetrics;
