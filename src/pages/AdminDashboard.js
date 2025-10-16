import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Storage as StorageIcon,
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        
        <Box display="flex" gap={2}>
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
            <IconButton onClick={loadAdminData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Report">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {metrics.totalUsers.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <GroupIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Organizations
                  </Typography>
                  <Typography variant="h4">
                    {metrics.totalOrganizations}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${metrics.monthlyRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Storage Used
                  </Typography>
                  <Typography variant="h4">
                    {metrics.storageUsed} GB
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <StorageIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Subscription Breakdown */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Subscription Plans
              </Typography>
              
              <Box mt={2}>
                {Object.entries(subscriptionBreakdown).map(([plan, count]) => (
                  <Box key={plan} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" textTransform="capitalize">
                        {plan}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(count / Object.values(subscriptionBreakdown).reduce((a, b) => a + b, 0)) * 100}
                      color={getPlanColor(plan)}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getActivityColor(activity.severity)}.main` }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.timestamp.toLocaleString()}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Organization Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Overview
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell align="center">Members</TableCell>
                      <TableCell align="center">Projects</TableCell>
                      <TableCell align="center">Features</TableCell>
                      <TableCell align="center">Storage</TableCell>
                      <TableCell align="center">Last Active</TableCell>
                      <TableCell align="center">Health</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizationStats.map((org) => (
                      <TableRow key={org.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
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
                          <Typography variant="body2" color="text.secondary">
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
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Integration Notice */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Admin Dashboard Preview
        </Typography>
        <Typography variant="body2">
          This admin dashboard shows simulated data for demonstration purposes. In production, this would connect to:
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Real-time analytics from Firebase Analytics</li>
          <li>Stripe webhook data for subscription metrics</li>
          <li>User activity tracking and engagement metrics</li>
          <li>System health monitoring and alerts</li>
          <li>Revenue reporting and financial analytics</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
