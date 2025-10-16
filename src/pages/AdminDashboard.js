import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useOrganization } from '../OrganizationContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

const AdminDashboard = () => {
  const { currentOrganization, userRole } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('30d');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalProjects: 0,
    totalFeatures: 0,
    monthlyRevenue: 0,
    trialConversions: 0,
    churnRate: 0,
    storageUsed: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [organizationStats, setOrganizationStats] = useState([]);
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState({
    free: 0,
    starter: 0,
    professional: 0,
    enterprise: 0
  });

  useEffect(() => {
    loadAdminData();
  }, [timeframe]);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate loading admin data
      // In a real app, this would fetch from Firebase with proper admin permissions
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated metrics data
      setMetrics({
        totalUsers: 1247,
        totalOrganizations: 89,
        totalProjects: 342,
        totalFeatures: 5673,
        monthlyRevenue: 8940,
        trialConversions: 23.5,
        churnRate: 4.2,
        storageUsed: 145.7 // GB
      });

      // Simulated recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'new_signup',
          description: 'New organization "TechCorp Inc." signed up',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          severity: 'success'
        },
        {
          id: 2,
          type: 'subscription_upgrade',
          description: 'Acme Corp upgraded to Professional plan',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          severity: 'info'
        },
        {
          id: 3,
          type: 'high_usage',
          description: 'StartupXYZ is near storage limit (95% used)',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          severity: 'warning'
        },
        {
          id: 4,
          type: 'cancellation',
          description: 'Beta Corp cancelled subscription',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          severity: 'error'
        },
        {
          id: 5,
          type: 'feature_usage',
          description: 'High Jira integration usage detected',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          severity: 'info'
        }
      ]);

      // Simulated organization stats
      setOrganizationStats([
        {
          id: 'org1',
          name: 'TechCorp Inc.',
          plan: 'enterprise',
          members: 25,
          projects: 12,
          features: 456,
          storageUsed: 15.2,
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
          health: 'good'
        },
        {
          id: 'org2',
          name: 'Acme Corp',
          plan: 'professional',
          members: 8,
          projects: 6,
          features: 189,
          storageUsed: 4.7,
          lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000),
          health: 'good'
        },
        {
          id: 'org3',
          name: 'StartupXYZ',
          plan: 'starter',
          members: 5,
          projects: 3,
          features: 67,
          storageUsed: 9.8,
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          health: 'warning'
        },
        {
          id: 'org4',
          name: 'Digital Innovations',
          plan: 'professional',
          members: 15,
          projects: 8,
          features: 234,
          storageUsed: 7.3,
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          health: 'good'
        }
      ]);

      setSubscriptionBreakdown({
        free: 34,
        starter: 28,
        professional: 22,
        enterprise: 5
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_signup': return <GroupIcon />;
      case 'subscription_upgrade': return <TrendingUpIcon />;
      case 'high_usage': return <WarningIcon />;
      case 'cancellation': return <ErrorIcon />;
      case 'feature_usage': return <SpeedIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  const getActivityColor = (severity) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'enterprise': return 'primary';
      case 'professional': return 'secondary';
      case 'starter': return 'success';
      default: return 'default';
    }
  };

  // Check if user has admin permissions
  if (userRole !== 'owner' && userRole !== 'admin') {
    return (
      <Alert severity="error">
        Access denied. You need administrator privileges to view this dashboard.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title="Refresh Data">
          <IconButton onClick={loadAdminData} disabled={loading} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Export Report">
          <IconButton size="small">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{
          flex: '1 1 auto',
          minWidth: '200px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Total Users
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {metrics.totalUsers.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '200px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Organizations
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            {metrics.totalOrganizations}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '200px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Monthly Revenue
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            ${metrics.monthlyRevenue.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '200px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Storage Used
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
            {metrics.storageUsed} GB
          </Typography>
        </Box>
      </Box>

      {/* Content Sections */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Subscription Breakdown */}
        <Box sx={{
          flex: '1 1 300px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
            Subscription Plans
          </Typography>

          <Box>
            {Object.entries(subscriptionBreakdown).map(([plan, count]) => (
              <Box key={plan} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                    {plan}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {count}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(count / Object.values(subscriptionBreakdown).reduce((a, b) => a + b, 0)) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(0, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box sx={{
          flex: '2 1 500px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
            Recent Activity
          </Typography>

          <List sx={{ p: 0 }}>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getActivityColor(activity.severity)}.main`, width: 32, height: 32 }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.description}
                    secondary={activity.timestamp.toLocaleString()}
                    slotProps={{
                      primary: { style: { fontSize: '0.85rem' } },
                      secondary: { style: { fontSize: '0.75rem' } }
                    }}
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>

      {/* Organization Stats */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
          Organization Overview
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Organization</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Members</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Projects</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Features</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Storage</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Last Active</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Health</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizationStats.map((org) => (
                <TableRow key={org.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {org.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.plan}
                      color={getPlanColor(org.plan)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">{org.members}</TableCell>
                  <TableCell align="center">{org.projects}</TableCell>
                  <TableCell align="center">{org.features}</TableCell>
                  <TableCell align="center">{org.storageUsed} GB</TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {org.lastActive.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={org.health}
                      color={getHealthColor(org.health)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Integration Notice */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
          Admin Dashboard Preview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 1 }}>
          This admin dashboard shows simulated data for demonstration purposes. In production, this would connect to:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { fontSize: '0.85rem', color: 'text.secondary', mb: 0.5 } }}>
          <li>Real-time analytics from Firebase Analytics</li>
          <li>Stripe webhook data for subscription metrics</li>
          <li>User activity tracking and engagement metrics</li>
          <li>System health monitoring and alerts</li>
          <li>Revenue reporting and financial analytics</li>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
