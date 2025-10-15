import React, { useMemo, useEffect, useState } from 'react';
import { useProject } from '../ProjectContext';
import { useFeatures } from '../hooks/useFeatures';
import { trackPageView } from '../services/analytics';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function FeatureTTL() {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';
  const { selectedProject } = useProject();
  const { features, loading } = useFeatures(selectedProject);

  // Team configuration state
  const [showSettings, setShowSettings] = useState(false);

  // Breakdown modal state
  const [selectedFeatureForBreakdown, setSelectedFeatureForBreakdown] = useState(null);
  const [teamConfig, setTeamConfig] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('ttm-team-config');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      workMode: 'parallel', // 'parallel' or 'sequential'
      teamSize: 8, // Number of parallel tracks (for parallel mode)
      teamVelocity: 25 // Story points per week
    };
  });

  // Track page view
  useEffect(() => {
    trackPageView('time-to-market', selectedProject);
  }, [selectedProject]);

  // Save team config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ttm-team-config', JSON.stringify(teamConfig));
  }, [teamConfig]);

  // Proprietary TTM Algorithm - Revolutionary Edition
  const calculateTTL = (feature) => {
    const safe = key => typeof feature[key] === 'number' ? feature[key] : 3;
    const safeNum = key => typeof feature[key] === 'number' ? feature[key] : 0;

    // Store breakdown details
    const breakdown = {
      steps: []
    };

    // === STEP 1: BASE EFFORT CALCULATION ===
    // Use Story Points as primary driver (more accurate than T-shirt sizes)
    const storyPoints = safeNum('storyPoints') || 5;

    // Team velocity (Story Points per week) - configurable
    const teamVelocity = teamConfig.teamVelocity;

    // Base time in weeks from story points
    let baseWeeks = storyPoints / teamVelocity;

    breakdown.steps.push({
      step: 1,
      title: 'Base Effort Calculation',
      description: `Story Points (${storyPoints}) ÷ Team Velocity (${teamVelocity})`,
      calculation: `${storyPoints} ÷ ${teamVelocity} = ${baseWeeks.toFixed(2)} weeks`,
      result: baseWeeks,
      impact: baseWeeks
    });

    // === STEP 2: COMPLEXITY MULTIPLIER ===
    // Aggregate all complexity factors
    const technicalComplexity = safe('technicalComplexity');
    const dependencyRisk = safe('dependencyRisk');
    const unknowns = safe('unknowns');
    const effortRequired = safe('effortRequired');
    const requirementsClarity = safe('requirementsClarity');

    // Complexity increases time, clarity reduces time
    const complexityScore = (technicalComplexity + dependencyRisk + unknowns + effortRequired) / 4;
    const complexityMultiplier = 1 + ((complexityScore - 3) * 0.25); // ±50% based on complexity
    const clarityMultiplier = 1 - ((requirementsClarity - 3) * 0.15); // ±30% based on clarity

    const beforeComplexity = baseWeeks;
    baseWeeks = baseWeeks * complexityMultiplier * clarityMultiplier;

    breakdown.steps.push({
      step: 2,
      title: 'Complexity & Clarity Adjustments',
      description: `Complexity Score: ${complexityScore.toFixed(1)}/5, Clarity: ${requirementsClarity}/5`,
      calculation: `${beforeComplexity.toFixed(2)} × ${complexityMultiplier.toFixed(2)} × ${clarityMultiplier.toFixed(2)} = ${baseWeeks.toFixed(2)} weeks`,
      result: baseWeeks,
      impact: baseWeeks - beforeComplexity
    });

    // === STEP 3: LAYER IMPACT ADJUSTMENT ===
    // Weight by which layers are affected (Frontend, Backend, Database)
    const frontendImpact = safe('frontendImpact');
    const backendImpact = safe('backendImpact');
    const databaseImpact = safe('databaseImpact');

    // Calculate weighted impact (higher impact = more time)
    const avgImpact = (frontendImpact + backendImpact + databaseImpact) / 3;
    const layerMultiplier = 1 + ((avgImpact - 3) * 0.2); // ±40% based on layer impact

    const beforeLayers = baseWeeks;
    baseWeeks = baseWeeks * layerMultiplier;

    breakdown.steps.push({
      step: 3,
      title: 'Layer Impact Adjustment',
      description: `Frontend: ${frontendImpact}/5, Backend: ${backendImpact}/5, Database: ${databaseImpact}/5`,
      calculation: `${beforeLayers.toFixed(2)} × ${layerMultiplier.toFixed(2)} = ${baseWeeks.toFixed(2)} weeks`,
      result: baseWeeks,
      impact: baseWeeks - beforeLayers
    });

    // === STEP 4: DEPENDENCY DELAY ===
    // Each dependency adds delay (blocking time)
    const dependencyCount = safeNum('dependencyCount');
    const dependencyDelay = dependencyCount * 0.5; // Each dependency adds half a week

    const beforeDeps = baseWeeks;
    baseWeeks += dependencyDelay;

    breakdown.steps.push({
      step: 4,
      title: 'Dependency Delay',
      description: `${dependencyCount} dependencies (each adds 0.5 weeks)`,
      calculation: `${beforeDeps.toFixed(2)} + ${dependencyDelay.toFixed(2)} = ${baseWeeks.toFixed(2)} weeks`,
      result: baseWeeks,
      impact: dependencyDelay
    });

    // === STEP 5: QA OVERHEAD ===
    // Add QA time if estimated, otherwise use 15% of dev time
    const estimatedQAHours = safeNum('estimatedQAHours');
    const qaWeeks = estimatedQAHours > 0
      ? estimatedQAHours / 40 // Convert hours to weeks (40 hours/week)
      : baseWeeks * 0.15; // Default 15% of dev time

    const beforeQA = baseWeeks;
    baseWeeks += qaWeeks;

    breakdown.steps.push({
      step: 5,
      title: 'QA Overhead',
      description: estimatedQAHours > 0
        ? `${estimatedQAHours} hours estimated`
        : `15% of development time`,
      calculation: `${beforeQA.toFixed(2)} + ${qaWeeks.toFixed(2)} = ${baseWeeks.toFixed(2)} weeks`,
      result: baseWeeks,
      impact: qaWeeks
    });

    // === STEP 6: FTE EFFICIENCY (if hours are provided) ===
    const estimatedBackendHours = safeNum('estimatedBackendHours');
    const estimatedFrontendHours = safeNum('estimatedFrontendHours');

    if (estimatedBackendHours > 0 || estimatedFrontendHours > 0) {
      // If detailed hours are provided, use those instead
      const totalDevHours = estimatedBackendHours + estimatedFrontendHours;
      const availableFTE = 2; // Assume 2 FTE available (configurable)
      const hoursPerWeek = 40;

      const weeksFromHours = totalDevHours / (availableFTE * hoursPerWeek);
      const beforeFTE = baseWeeks;
      // Use the higher of story point estimate or hours estimate
      baseWeeks = Math.max(baseWeeks, weeksFromHours + qaWeeks);

      breakdown.steps.push({
        step: 6,
        title: 'FTE Hours Adjustment',
        description: `${totalDevHours} hours estimated across ${availableFTE} FTE`,
        calculation: `max(${beforeFTE.toFixed(2)}, ${weeksFromHours.toFixed(2)} + ${qaWeeks.toFixed(2)}) = ${baseWeeks.toFixed(2)} weeks`,
        result: baseWeeks,
        impact: baseWeeks - beforeFTE
      });
    }

    // === STEP 7: TECHNOLOGY DEBT TAX ===
    // If feature has "Technology/Tech Debt" gap type, add 25% buffer
    const gapTypes = Array.isArray(feature.gapTypes) ? feature.gapTypes : [];
    const hasTechDebt = gapTypes.includes('Technology/Tech Debt');

    if (hasTechDebt) {
      const beforeTechDebt = baseWeeks;
      baseWeeks *= 1.25; // 25% tech debt tax

      breakdown.steps.push({
        step: 7,
        title: 'Technology Debt Tax',
        description: 'Feature involves tech debt (adds 25%)',
        calculation: `${beforeTechDebt.toFixed(2)} × 1.25 = ${baseWeeks.toFixed(2)} weeks`,
        result: baseWeeks,
        impact: baseWeeks - beforeTechDebt
      });
    }

    // Ensure reasonable bounds: minimum 2 days (0.4 weeks), maximum 16 weeks
    const beforeBounds = baseWeeks;
    baseWeeks = Math.max(0.4, Math.min(16, baseWeeks));

    if (beforeBounds !== baseWeeks) {
      breakdown.steps.push({
        step: hasTechDebt ? 8 : 7,
        title: 'Bounds Check',
        description: 'Capped between 0.4 and 16 weeks',
        calculation: `min(16, max(0.4, ${beforeBounds.toFixed(2)})) = ${baseWeeks.toFixed(2)} weeks`,
        result: baseWeeks,
        impact: baseWeeks - beforeBounds
      });
    }

    // Convert to months for display
    const months = (baseWeeks / 4.33).toFixed(1);
    const weeks = parseFloat(baseWeeks.toFixed(1)); // Keep decimal for more precision
    const days = Math.round(baseWeeks * 5);

    breakdown.finalResult = weeks;
    breakdown.totalWeeks = weeks;
    breakdown.totalMonths = parseFloat(months);

    return {
      weeks: weeks,
      days: days,
      months: parseFloat(months),
      status: weeks <= 1 ? 'fast' : weeks <= 2 ? 'normal' : weeks <= 4 ? 'slow' : 'critical',
      healthScore: Math.round(Math.max(0, 100 - (weeks * 10))), // Higher score = faster delivery
      breakdown: breakdown
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
  }, [features, teamConfig]);

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

    // Calculate actual calendar time based on work mode
    const remainingFeatures = [...inProgressFeatures, ...planningFeatures]
      .map(f => ({
        weeks: f.workflowStatus === 'In Progress' ? f.ttl.weeks * 0.5 : f.ttl.weeks
      }))
      .sort((a, b) => b.weeks - a.weeks);

    let totalRemainingWeeks;

    if (teamConfig.workMode === 'sequential') {
      // Sequential mode: add all features together
      totalRemainingWeeks = remainingFeatures.reduce((sum, f) => sum + f.weeks, 0);
    } else {
      // Parallel mode: distribute features across parallel "tracks"
      const parallelizationFactor = teamConfig.teamSize;
      let tracks = Array(parallelizationFactor).fill(0);

      remainingFeatures.forEach(feature => {
        // Assign feature to the track that finishes earliest
        const earliestTrack = tracks.indexOf(Math.min(...tracks));
        tracks[earliestTrack] += feature.weeks;
      });

      // Project completion is when the longest track finishes
      totalRemainingWeeks = Math.max(...tracks, 0);
    }
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
      {/* Team Configuration Settings */}
      <Box sx={{
        mb: 3,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(243, 244, 246, 0.5)',
            }
          }}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Team Configuration
            </Typography>
            <Chip
              label={teamConfig.workMode === 'parallel' ? `Parallel (${teamConfig.teamSize} tracks)` : 'Sequential'}
              size="small"
              sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}
            />
          </Box>
          <IconButton
            sx={{
              transform: showSettings ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={showSettings}>
          <Box sx={{ p: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure how your team works to get more accurate project completion estimates.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {/* Work Mode */}
              <FormControl fullWidth>
                <InputLabel>Work Mode</InputLabel>
                <Select
                  value={teamConfig.workMode}
                  label="Work Mode"
                  onChange={(e) => setTeamConfig({ ...teamConfig, workMode: e.target.value })}
                >
                  <MenuItem value="parallel">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Parallel</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Multiple features at once
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="sequential">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Sequential</Typography>
                      <Typography variant="caption" color="text.secondary">
                        One feature at a time
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Team Size (only for parallel mode) */}
              {teamConfig.workMode === 'parallel' && (
                <FormControl fullWidth>
                  <InputLabel>Team Size / Parallel Tracks</InputLabel>
                  <Select
                    value={teamConfig.teamSize}
                    label="Team Size / Parallel Tracks"
                    onChange={(e) => setTeamConfig({ ...teamConfig, teamSize: e.target.value })}
                  >
                    <MenuItem value={1}>1 person (Solo dev)</MenuItem>
                    <MenuItem value={2}>2 people (Small team)</MenuItem>
                    <MenuItem value={3}>3 people</MenuItem>
                    <MenuItem value={4}>4 people</MenuItem>
                    <MenuItem value={5}>5 people</MenuItem>
                    <MenuItem value={6}>6 people</MenuItem>
                    <MenuItem value={8}>8 people (Medium team)</MenuItem>
                    <MenuItem value={10}>10 people</MenuItem>
                    <MenuItem value={12}>12+ people (Large team)</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* Team Velocity */}
              <TextField
                fullWidth
                type="number"
                label="Team Velocity (Story Points / Week)"
                value={teamConfig.teamVelocity}
                onChange={(e) => setTeamConfig({ ...teamConfig, teamVelocity: Number(e.target.value) })}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
                helperText="How many story points your team completes per week"
              />
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                💡 How this works:
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                <strong>Parallel mode:</strong> Simulates team members working on different features simultaneously. The project completion estimate is based on the longest "track" rather than summing all features.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                <strong>Sequential mode:</strong> Assumes features are completed one after another. Best for solo developers or teams that must focus on one feature at a time.
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{
          p: 2,
          flex: '1 1 200px',
          minWidth: 200,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}>
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
        </Box>

        <Box sx={{
          p: 2,
          flex: '1 1 200px',
          minWidth: 200,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}>
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
        </Box>

        <Box sx={{
          p: 2,
          flex: '1 1 200px',
          minWidth: 200,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}>
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
        </Box>

        <Box sx={{
          p: 2,
          flex: '1 1 200px',
          minWidth: 200,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}>
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
        </Box>

        <Box sx={{
          p: 2,
          flex: '1 1 200px',
          minWidth: 200,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }}>
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
        </Box>
      </Box>

      {/* Features List - Two Column Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2 }}>
        {featuresWithTTL.map((feature) => (
          <Box
            key={feature.id}
            onClick={() => setSelectedFeatureForBreakdown(feature)}
            sx={{
              display: 'flex',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: isDark
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderColor: isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(209, 213, 219, 1)'
              }
            }}
          >
            {/* Left Sidebar - Status Color Stripe */}
            <Box sx={{
              width: '4px',
              bgcolor: getStatusColor(feature.ttl.status),
              flexShrink: 0
            }} />

            {/* Card Content */}
            <Box sx={{ flex: 1, p: 1.5 }}>
              {/* Header: Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  lineHeight: 1.3,
                  color: 'text.primary',
                  mb: 0.75
                }}
              >
                {feature.name}
              </Typography>

              {/* Category */}
              {feature.category && (
                <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', fontStyle: 'italic', display: 'block', mb: 1 }}>
                  {feature.category}
                </Typography>
              )}

              {/* Time Estimate and Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: getStatusColor(feature.ttl.status), lineHeight: 1.2 }}>
                    {feature.ttl.weeks} wks
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    ~{feature.ttl.months} months
                  </Typography>
                </Box>

                {/* Status Badge */}
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.4,
                  bgcolor: getStatusColor(feature.ttl.status),
                  color: 'white',
                  borderRadius: '3px',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}>
                  {getStatusLabel(feature.ttl.status)}
                </Box>
              </Box>

              {/* Workflow Status */}
              {feature.workflowStatus && (
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.4,
                  bgcolor: feature.workflowStatus === 'Done'
                    ? '#10B981'
                    : feature.workflowStatus === 'In Progress'
                    ? '#3B82F6'
                    : '#6B7280',
                  color: 'white',
                  borderRadius: '3px',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}>
                  {feature.workflowStatus}
                </Box>
              )}
            </Box>
          </Box>
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

      {/* TTM Breakdown Modal */}
      <Dialog
        open={Boolean(selectedFeatureForBreakdown)}
        onClose={() => setSelectedFeatureForBreakdown(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedFeatureForBreakdown && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Time to Market Breakdown
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {selectedFeatureForBreakdown.name}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedFeatureForBreakdown(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              {/* Final Result Summary */}
              <Box sx={{
                p: 3,
                mb: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px',
                borderLeft: 4,
                borderLeftColor: getStatusColor(selectedFeatureForBreakdown.ttl.status)
              }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: getStatusColor(selectedFeatureForBreakdown.ttl.status) }}>
                    {selectedFeatureForBreakdown.ttl.weeks} weeks
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ~{selectedFeatureForBreakdown.ttl.months} months
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Chip
                    label={getStatusLabel(selectedFeatureForBreakdown.ttl.status)}
                    sx={{
                      bgcolor: getStatusColor(selectedFeatureForBreakdown.ttl.status),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  {selectedFeatureForBreakdown.workflowStatus && (
                    <Chip
                      label={selectedFeatureForBreakdown.workflowStatus}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        borderColor: selectedFeatureForBreakdown.workflowStatus === 'Done'
                          ? '#10B981'
                          : selectedFeatureForBreakdown.workflowStatus === 'In Progress'
                          ? '#3B82F6'
                          : 'text.secondary',
                        color: selectedFeatureForBreakdown.workflowStatus === 'Done'
                          ? '#10B981'
                          : selectedFeatureForBreakdown.workflowStatus === 'In Progress'
                          ? '#3B82F6'
                          : 'text.secondary'
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Calculation Steps */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Calculation Steps
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedFeatureForBreakdown.ttl.breakdown.steps.map((step, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: '4px',
                      borderLeft: 3,
                      borderLeftColor: step.impact > 0 ? '#EF4444' : step.impact < 0 ? '#10B981' : '#6B7280'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', ml: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Impact
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: step.impact > 0.01 ? '#EF4444' : step.impact < -0.01 ? '#10B981' : '#6B7280'
                          }}
                        >
                          {step.impact > 0 ? '+' : ''}{step.impact.toFixed(2)}w
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Summary */}
              <Box sx={{
                p: 2,
                mt: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: '4px',
                borderLeft: 3,
                borderLeftColor: '#10B981'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#10B981' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    This calculation uses your team configuration: {teamConfig.workMode === 'parallel' ? `Parallel (${teamConfig.teamSize} tracks)` : 'Sequential'} with team velocity of {teamConfig.teamVelocity} story points/week.
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default FeatureTTL;
