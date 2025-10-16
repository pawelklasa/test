import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Refresh
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
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Loading analytics...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
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
          <IconButton onClick={loadAnalytics} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Revenue" />
          <Tab label="Usage" />
          <Tab label="Customers" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Revenue data will be displayed here. Integration with Stripe analytics coming soon.
          </Typography>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
            Usage Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Usage metrics and feature adoption data will be displayed here.
          </Typography>
        </Box>
      )}

      {activeTab === 2 && (
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
            Customer Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Customer engagement and retention metrics will be displayed here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;
