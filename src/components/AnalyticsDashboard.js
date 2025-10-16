import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  Assessment,
  Refresh,
  Download
} from '@mui/icons-material';
import { stripeAnalytics } from '../utils/stripeAnalytics';

const AnalyticsDashboard = ({ organizationId }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState(30);

  const loadAnalytics = async () => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Mock loading for now
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [organizationId, timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <LinearProgress sx={{ mb: 2, width: 200 }} />
          <Typography variant="body2" color="text.secondary">
            Loading analytics...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
              <MenuItem value={365}>Last year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh data">
            <IconButton onClick={loadAnalytics}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box borderBottom={1} borderColor="divider" mb={3}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Revenue" />
          <Tab label="Usage" />
          <Tab label="Customers" />
        </Tabs>
      </Box>

      <Box>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenue data will be displayed here.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Usage Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Usage data will be displayed here.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customer Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer data will be displayed here.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsDashboard;
