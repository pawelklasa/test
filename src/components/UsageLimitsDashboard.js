import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Warning,
  Error,
  CheckCircle,
  Upgrade,
  Refresh,
  TrendingUp,
  Storage,
  People,
  Visibility
} from '@mui/icons-material';
import { usageLimitsService } from '../utils/usageLimitsService';

/**
 * Usage Limits & Billing Alerts Dashboard
 */

const UsageLimitsDashboard = ({ organizationId }) => {
  const [loading, setLoading] = useState(true);
  const [usageReport, setUsageReport] = useState(null);
  const [upgradeRecommendations, setUpgradeRecommendations] = useState([]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadUsageData = async () => {
    setLoading(true);
    try {
      // Check current usage limits
      const report = await usageLimitsService.checkUsageLimits(organizationId);
      setUsageReport(report);

      // Get upgrade recommendations
      const recommendations = await usageLimitsService.generateUpgradeRecommendations(organizationId);
      setUpgradeRecommendations(recommendations);

    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      loadUsageData();
    }
  }, [organizationId]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getUsagePercentage = (current, limit) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 95) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const formatMetricName = (metric) => {
    const names = {
      projects: 'Projects',
      features: 'Features',
      teamMembers: 'Team Members',
      storageGB: 'Storage (GB)',
      monthlyViews: 'Monthly Views'
    };
    return names[metric] || metric;
  };

  const getMetricIcon = (metric) => {
    const icons = {
      projects: <TrendingUp />,
      features: <CheckCircle />,
      teamMembers: <People />,
      storageGB: <Storage />,
      monthlyViews: <Visibility />
    };
    return icons[metric] || <CheckCircle />;
  };

  // ============================================================================
  // COMPONENTS
  // ============================================================================

  const UsageCard = ({ metric, current, limit }) => {
    const percentage = getUsagePercentage(current, limit);
    const color = getUsageColor(percentage);
    const isUnlimited = limit === -1;

    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Box sx={{ mr: 2, color: `${color}.main` }}>
              {getMetricIcon(metric)}
            </Box>
            <Box flex={1}>
              <Typography variant="h6">
                {formatMetricName(metric)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isUnlimited 
                  ? `${current.toLocaleString()} (Unlimited)`
                  : `${current.toLocaleString()} / ${limit.toLocaleString()}`
                }
              </Typography>
            </Box>
          </Box>
          
          {!isUnlimited && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                color={color}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" align="right">
                {percentage.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const AlertsSection = () => {
    if (!usageReport || (usageReport.warnings.length === 0 && usageReport.overages.length === 0)) {
      return (
        <Alert severity="success" icon={<CheckCircle />}>
          All usage is within limits. No action required.
        </Alert>
      );
    }

    return (
      <Box>
        {usageReport.overages.map((overage, index) => (
          <Alert 
            key={`overage-${index}`}
            severity="error" 
            icon={<Error />}
            sx={{ mb: 1 }}
            action={
              <Button color="inherit" size="small" startIcon={<Upgrade />}>
                Upgrade Plan
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>{formatMetricName(overage.metric)}</strong> usage exceeded: 
              {' '}{overage.current.toLocaleString()} / {overage.limit.toLocaleString()}
              {' '}({overage.percentage.toFixed(1)}%)
            </Typography>
          </Alert>
        ))}

        {usageReport.warnings.map((warning, index) => (
          <Alert 
            key={`warning-${index}`}
            severity={warning.level === 'red' ? 'error' : 'warning'} 
            icon={warning.level === 'red' ? <Error /> : <Warning />}
            sx={{ mb: 1 }}
          >
            <Typography variant="body2">
              <strong>{formatMetricName(warning.metric)}</strong> usage high: 
              {' '}{warning.current.toLocaleString()} / {warning.limit.toLocaleString()}
              {' '}({warning.percentage.toFixed(1)}%)
            </Typography>
          </Alert>
        ))}
      </Box>
    );
  };

  const SubscriptionInfoCard = () => {
    if (!usageReport) return null;

    const { subscription } = usageReport;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Subscription
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Chip 
              label={subscription.tier?.toUpperCase() || 'FREE'} 
              color={subscription.tier === 'enterprise' ? 'success' : 'primary'}
              variant="outlined"
            />
            <Box ml={2}>
              <Typography variant="body2" color="textSecondary">
                Status: {subscription.status || 'Active'}
              </Typography>
            </Box>
          </Box>

          {subscription.nextBillingDate && (
            <Typography variant="body2" color="textSecondary">
              Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  const UpgradeRecommendationsCard = () => {
    if (!upgradeRecommendations || upgradeRecommendations.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upgrade Recommendations
          </Typography>
          
          {upgradeRecommendations.map((rec, index) => (
            <Alert 
              key={index}
              severity="info" 
              icon={<Upgrade />}
              sx={{ mb: 1 }}
              action={
                <Button color="inherit" size="small">
                  Upgrade to {rec.suggestedTier}
                </Button>
              }
            >
              <Typography variant="body2">
                {rec.reason}
              </Typography>
            </Alert>
          ))}
        </CardContent>
      </Card>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Usage & Billing
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!usageReport) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Usage & Billing
        </Typography>
        <Alert severity="error">
          Unable to load usage data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Usage & Billing Dashboard
        </Typography>
        
        <Tooltip title="Refresh Usage Data">
          <IconButton onClick={loadUsageData}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Alerts Section */}
      <Box mb={3}>
        <AlertsSection />
      </Box>

      <Grid container spacing={3}>
        {/* Usage Metrics */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" gutterBottom>
            Current Usage
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            {Object.entries(usageReport.usage).map(([metric, current]) => (
              <Grid item xs={12} sm={6} md={4} key={metric}>
                <UsageCard
                  metric={metric}
                  current={current}
                  limit={usageReport.limits[metric]}
                />
              </Grid>
            ))}
          </Grid>

          {/* Usage History Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage Details
              </Typography>
              
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Current</TableCell>
                      <TableCell align="right">Limit</TableCell>
                      <TableCell align="right">Usage %</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(usageReport.usage).map(([metric, current]) => {
                      const limit = usageReport.limits[metric];
                      const percentage = getUsagePercentage(current, limit);
                      const color = getUsageColor(percentage);
                      
                      return (
                        <TableRow key={metric}>
                          <TableCell>{formatMetricName(metric)}</TableCell>
                          <TableCell align="right">{current.toLocaleString()}</TableCell>
                          <TableCell align="right">
                            {limit === -1 ? 'Unlimited' : limit.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {limit === -1 ? 'N/A' : `${percentage.toFixed(1)}%`}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={percentage >= 95 ? 'Critical' : percentage >= 80 ? 'Warning' : 'Good'}
                              color={color}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SubscriptionInfoCard />
            </Grid>
            
            <Grid item xs={12}>
              <UpgradeRecommendationsCard />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UsageLimitsDashboard;
