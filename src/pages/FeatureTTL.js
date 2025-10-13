import React, { useMemo } from 'react';
import { useProject } from '../ProjectContext';
import { useFeatures } from '../hooks/useFeatures';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function FeatureTTL() {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';
  const { selectedProject } = useProject();
  const { features, loading } = useFeatures(selectedProject);

  // Calculate Time to Market for a feature
  const calculateTTL = (feature) => {
    const safe = key => typeof feature[key] === 'number' ? feature[key] : 3;

    // Factors that affect development time
    const technicalComplexity = safe('technicalComplexity');
    const dependencyRisk = safe('dependencyRisk');
    const unknowns = safe('unknowns');
    const effortRequired = safe('effortRequired');
    const requirementsClarity = safe('requirementsClarity');

    // T-shirt size mapping to base DAYS (much more aggressive)
    const sizeInDays = {
      'S': 2,     // Small: 2-5 days
      'M': 5,     // Medium: 5-10 days (1-2 weeks)
      'L': 10,    // Large: 10-20 days (2-4 weeks)
      'XL': 20    // Extra Large: 20-30 days (4-6 weeks)
    };
    const baseDays = sizeInDays[feature.tshirtSize] || 5;

    // Calculate average scoring factor (1-5 scale)
    // Higher scores = more complexity/risk/effort = more time
    const complexityFactor = (technicalComplexity + dependencyRisk + unknowns + effortRequired) / 4;

    // Clarity is inversed - higher clarity = less time
    const clarityBonus = (requirementsClarity - 3) * 0.1; // -0.2 to +0.2 multiplier

    // Apply complexity as a percentage increase (0% to 50% increase max)
    // Score of 1 = 0% increase, Score of 5 = 50% increase
    const complexityMultiplier = 1 + ((complexityFactor - 1) / 8);

    let totalDays = baseDays * complexityMultiplier * (1 - clarityBonus);

    // Convert to weeks
    let baseWeeks = totalDays / 5; // 5 working days per week

    // Ensure reasonable bounds: minimum 2 days (0.4 weeks), maximum 8 weeks
    baseWeeks = Math.max(0.4, Math.min(8, baseWeeks));

    // Convert to months for display
    const months = (baseWeeks / 4.33).toFixed(1);
    const weeks = parseFloat(baseWeeks.toFixed(1)); // Keep decimal for more precision
    const days = Math.round(baseWeeks * 5);

    return {
      weeks: weeks,
      days: days,
      months: parseFloat(months),
      status: weeks <= 1 ? 'fast' : weeks <= 2 ? 'normal' : weeks <= 4 ? 'slow' : 'critical',
      healthScore: Math.round(Math.max(0, 100 - (weeks * 10))) // Higher score = faster delivery
    };
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'fast': return '#10B981';      // Green - Quick delivery
      case 'normal': return '#3B82F6';    // Blue - Normal timeline
      case 'slow': return '#F59E0B';      // Orange - Slower than usual
      case 'critical': return '#EF4444';  // Red - Very long timeline
      default: return '#6B7280';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'fast': return 'Fast Delivery';
      case 'normal': return 'Normal Timeline';
      case 'slow': return 'Extended Timeline';
      case 'critical': return 'Complex - Long Timeline';
      default: return 'Unknown';
    }
  };

  // Calculate Time to Market for all features
  const featuresWithTTL = useMemo(() => {
    return features.map(feature => ({
      ...feature,
      ttl: calculateTTL(feature)
    })).sort((a, b) => b.ttl.weeks - a.ttl.weeks); // Sort by longest time first
  }, [features]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (featuresWithTTL.length === 0) return {
      avgWeeks: 0,
      fast: 0,
      slow: 0,
      critical: 0,
      projectCompletion: { weeks: 0, months: 0 },
      completedCount: 0,
      inProgressCount: 0,
      planningCount: 0
    };

    const avgWeeks = featuresWithTTL.reduce((sum, f) => sum + f.ttl.weeks, 0) / featuresWithTTL.length;
    const fast = featuresWithTTL.filter(f => f.ttl.status === 'fast').length;
    const normal = featuresWithTTL.filter(f => f.ttl.status === 'normal').length;
    const slow = featuresWithTTL.filter(f => f.ttl.status === 'slow').length;
    const critical = featuresWithTTL.filter(f => f.ttl.status === 'critical').length;

    // Project completion estimate
    // Features that are Done: 0 weeks remaining
    // Features In Progress: 50% of estimated time remaining
    // Features in Planning or no status: 100% of estimated time
    // Won't Do: excluded from calculation
    const completedFeatures = featuresWithTTL.filter(f => f.workflowStatus === 'Done');
    const inProgressFeatures = featuresWithTTL.filter(f => f.workflowStatus === 'In Progress');
    const planningFeatures = featuresWithTTL.filter(f =>
      f.workflowStatus === 'Planning' || !f.workflowStatus
    );
    const wontDoFeatures = featuresWithTTL.filter(f => f.workflowStatus === "Won't Do");

    // Calculate total remaining effort (in "feature-weeks")
    const inProgressTime = inProgressFeatures.reduce((sum, f) => sum + (f.ttl.weeks * 0.5), 0);
    const planningTime = planningFeatures.reduce((sum, f) => sum + f.ttl.weeks, 0);
    const totalEffortWeeks = inProgressTime + planningTime;

    // Assume team can work on 8 features in parallel (realistic for most teams)
    // This accounts for: multiple devs, different tracks (backend/frontend/design), etc.
    const parallelizationFactor = 8;

    // Calculate actual calendar time based on parallel work
    // Sort remaining features by duration to estimate realistic timeline
    const remainingFeatures = [...inProgressFeatures, ...planningFeatures]
      .map(f => ({
        weeks: f.workflowStatus === 'In Progress' ? f.ttl.weeks * 0.5 : f.ttl.weeks
      }))
      .sort((a, b) => b.weeks - a.weeks);

    // Simulate parallel execution: distribute features across parallel "tracks"
    let tracks = Array(parallelizationFactor).fill(0);
    remainingFeatures.forEach(feature => {
      // Assign feature to the track that finishes earliest
      const earliestTrack = tracks.indexOf(Math.min(...tracks));
      tracks[earliestTrack] += feature.weeks;
    });

    // Project completion is when the longest track finishes
    const totalRemainingWeeks = Math.max(...tracks, 0);
    const totalRemainingMonths = (totalRemainingWeeks / 4.33).toFixed(1);

    return {
      avgWeeks: avgWeeks.toFixed(1),
      fast,
      normal,
      slow,
      critical,
      projectCompletion: {
        weeks: Math.round(totalRemainingWeeks),
        months: parseFloat(totalRemainingMonths)
      },
      completedCount: completedFeatures.length,
      inProgressCount: inProgressFeatures.length,
      planningCount: planningFeatures.length
    };
  }, [featuresWithTTL]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading features...</Typography>
      </Box>
    );
  }

  if (!selectedProject) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Time to Live Estimator
        </Typography>
        <Typography color="text.secondary">
          Please select a project to view feature TTL estimates.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Avg Time to Market
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {stats.avgWeeks} wks
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ~{(stats.avgWeeks / 4.33).toFixed(1)} months
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ color: '#10B981', fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Fast Delivery
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            {stats.fast}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ≤ 1 week
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Extended
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
            {stats.slow}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            2-4 weeks
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 200 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningIcon sx={{ color: '#EF4444', fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Complex
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
            {stats.critical}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            &gt; 4 weeks
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: '1 1 200px', minWidth: 200, bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', border: 2, borderColor: '#3B82F6' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarMonthIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Project Completion
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
            {stats.projectCompletion.weeks} wks
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ~{stats.projectCompletion.months} months remaining
          </Typography>
          <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', display: 'block' }}>
              Done: {stats.completedCount} | In Progress: {stats.inProgressCount} | Planning: {stats.planningCount}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Features List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {featuresWithTTL.map((feature) => (
          <Paper
            key={feature.id}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderLeft: 4,
              borderLeftColor: getStatusColor(feature.ttl.status),
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: isDark
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {feature.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {feature.desc || 'No description'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={feature.moscow || 'Not set'}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  />
                  {feature.state && (
                    <Chip
                      label={feature.state}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ minWidth: 200, textAlign: 'right' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: getStatusColor(feature.ttl.status) }}>
                  {feature.ttl.weeks < 2 ? `${feature.ttl.days} days` : `${feature.ttl.weeks} wks`}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {feature.ttl.weeks < 2 ? `~${feature.ttl.weeks} weeks` : `~${feature.ttl.months} months`}
                </Typography>
                <Chip
                  label={getStatusLabel(feature.ttl.status)}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(feature.ttl.status),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
            </Box>

            {/* Health Bar */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Feature Health
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {feature.ttl.healthScore}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={feature.ttl.healthScore}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getStatusColor(feature.ttl.status),
                    borderRadius: 1,
                  }
                }}
              />
            </Box>
          </Paper>
        ))}
      </Box>

      {featuresWithTTL.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No features found in this project
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Add features to see TTL estimates
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default FeatureTTL;
