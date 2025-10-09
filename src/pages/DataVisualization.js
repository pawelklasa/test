import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';

function DataVisualization() {
  const [timeRange, setTimeRange] = useState('month');

  const chartData = [
    { label: 'Mon', value: 45, color: '#667eea' },
    { label: 'Tue', value: 62, color: '#667eea' },
    { label: 'Wed', value: 38, color: '#667eea' },
    { label: 'Thu', value: 75, color: '#667eea' },
    { label: 'Fri', value: 58, color: '#667eea' },
    { label: 'Sat', value: 30, color: '#667eea' },
    { label: 'Sun', value: 42, color: '#667eea' }
  ];

  const categoryData = [
    { name: 'Features', count: 45, percentage: 35, color: '#667eea' },
    { name: 'Bugs', count: 32, percentage: 25, color: '#f093fb' },
    { name: 'UX', count: 28, percentage: 22, color: '#4facfe' },
    { name: 'Performance', count: 23, percentage: 18, color: '#43e97b' }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Data Visualization
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Interactive charts and dashboards to visualize product gaps and trends
      </Typography>

      {/* Time Range Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Gap Analysis Trends</Typography>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, value) => value && setTimeRange(value)}
          size="small"
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="quarter">Quarter</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Bar Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Activity
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-end', gap: 2, height: 300, px: 2 }}>
              {chartData.map((data, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1 }}>
                    {data.value}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${(data.value / maxValue) * 100}%`,
                      bgcolor: data.color,
                      borderRadius: 1,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                        transform: 'scaleY(1.05)'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {data.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Category Breakdown
            </Typography>
            <Box sx={{ mt: 3 }}>
              {categoryData.map((category, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} ({category.percentage}%)
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: '#e0e0e0',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${category.percentage}%`,
                        height: '100%',
                        bgcolor: category.color,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Heatmap/Grid Visualization */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gap Severity Heatmap
            </Typography>
            <Grid container spacing={1} sx={{ mt: 2 }}>
              {Array.from({ length: 35 }, (_, i) => {
                const intensity = Math.random();
                return (
                  <Grid item key={i}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: intensity > 0.7 ? '#fa709a' :
                                 intensity > 0.4 ? '#f093fb' :
                                 intensity > 0.2 ? '#667eea' : '#e0e0e0',
                        borderRadius: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2
                        }
                      }}
                      title={`Day ${i + 1}: ${(intensity * 100).toFixed(0)}% severity`}
                    />
                  </Grid>
                );
              })}
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Low
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#e0e0e0', borderRadius: 0.5 }} />
                <Box sx={{ width: 20, height: 20, bgcolor: '#667eea', borderRadius: 0.5 }} />
                <Box sx={{ width: 20, height: 20, bgcolor: '#f093fb', borderRadius: 0.5 }} />
                <Box sx={{ width: 20, height: 20, bgcolor: '#fa709a', borderRadius: 0.5 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                High
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>128</Typography>
              <Typography variant="body2">Total Gaps</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#43e97b', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>85</Typography>
              <Typography variant="body2">Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f093fb', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>43</Typography>
              <Typography variant="body2">In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4facfe', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>66%</Typography>
              <Typography variant="body2">Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DataVisualization;
