import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Warning,
  Error,
  CheckCircle,
  Upgrade,
  Refresh
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

  // ============================================================================
  // COMPONENTS
  // ============================================================================

  const UsageCard = ({ metric, current, limit }) => {
    const percentage = getUsagePercentage(current, limit);
    const color = getUsageColor(percentage);
    const isUnlimited = limit === -1;

    const getColorValue = () => {
      if (color === 'error') return '#EF4444';
      if (color === 'warning') return '#F59E0B';
      return '#10B981';
    };

    return (
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
          {formatMetricName(metric)}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: getColorValue(), mb: 1 }}>
          {isUnlimited
            ? current.toLocaleString()
            : `${current.toLocaleString()} / ${limit.toLocaleString()}`
          }
        </Typography>

        {!isUnlimited && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getColorValue(),
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              {percentage.toFixed(1)}% used
            </Typography>
          </Box>
        )}
        {isUnlimited && (
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            Unlimited
          </Typography>
        )}
      </Box>
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
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
          Current Subscription
        </Typography>

        <Box display="flex" alignItems="center" mb={2}>
          <Chip
            label={subscription.tier?.toUpperCase() || 'FREE'}
            color={subscription.tier === 'enterprise' ? 'success' : 'primary'}
            size="small"
          />
          <Box ml={2}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              Status: {subscription.status || 'Active'}
            </Typography>
          </Box>
        </Box>

        {subscription.nextBillingDate && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    );
  };

  const UpgradeRecommendationsCard = () => {
    if (!upgradeRecommendations || upgradeRecommendations.length === 0) {
      return null;
    }

    return (
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
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
      </Box>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Loading usage data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!usageReport) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Unable to load usage data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title="Refresh Usage Data">
          <IconButton onClick={loadUsageData} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Alerts Section */}
      <Box sx={{ mb: 3 }}>
        <AlertsSection />
      </Box>

      {/* Usage Metrics - Full Width */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {Object.entries(usageReport.usage).map(([metric, current]) => (
          <UsageCard
            key={metric}
            metric={metric}
            current={current}
            limit={usageReport.limits[metric]}
          />
        ))}
      </Box>

      {/* Usage Details Table */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
          Usage Details
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Metric</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Current</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Limit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Usage %</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(usageReport.usage).map(([metric, current]) => {
                const limit = usageReport.limits[metric];
                const percentage = getUsagePercentage(current, limit);
                const color = getUsageColor(percentage);

                return (
                  <TableRow key={metric} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
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
      </Box>

      {/* Sidebar Cards - Full Width Responsive */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <SubscriptionInfoCard />
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <UpgradeRecommendationsCard />
        </Box>
      </Box>
    </Box>
  );
};

export default UsageLimitsDashboard;
