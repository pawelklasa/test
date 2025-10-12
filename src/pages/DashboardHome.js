import React, { useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTheme } from '../ThemeContext';
import { useProject } from '../ProjectContext';
import { useFeatures } from '../hooks/useFeatures';

const targetQuarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
const moscowOptions = ['Must-Have', 'Should-Have', 'Could-Have', "Won't-Have"];
const companyGoals = [
  'Reduce Churn by 5%',
  'Expand to EMEA',
  'Increase NPS',
  'Improve Onboarding',
  'Other'
];
const tshirtSizes = ['S', 'M', 'L', 'XL'];
const currentStates = ['Missing', 'Partial Endpoints', 'Live in Prod'];
const gapTypeOptions = ['Documentation/Training', 'Technology/Tech Debt', 'Process', 'Resources'];

const steps = [
  'Basic Details & Strategic Alignment',
  'Effort & Gap Analysis',
  'Scoring & Prioritization'
];

function DashboardHome() {
  // Dialog state for Add Feature
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    status: 'Open',
    category: 'Feature',
    assignee: '',
  });
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [createFeatureData, setCreateFeatureData] = useState({
    featureName: '',
    description: '',
    targetQuarter: '',
    moscow: '',
    linkedGoal: '',
    tshirtSize: '',
    currentState: '',
    gapTypes: [],
    dependencies: '',
    scoring: {
      technicalComplexity: 3,
      dependencyRisk: 3,
      unknowns: 3,
      businessValue: 3,
      effort: 3,
      requirementsClarity: 3
    },
    blockersCount: 0
  });

  const { mode } = useTheme();
  const { selectedProject } = useProject();
  const { features, loading, error, addFeature, deleteFeature, updateFeature } = useFeatures(selectedProject);

  // Open dialog handler
  const handleOpenDialog = () => setOpenDialog(true);
  // Close dialog handler
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      severity: 'Medium',
      status: 'Open',
      category: 'Feature',
      assignee: '',
    });
  };

  // Rename handler to handleSaveFeature for clarity
  const handleSaveFeature = async () => {
    if (!formData.title.trim()) return;
    console.log('Adding feature:', formData);
    const result = await addFeature({
      ...formData,
      status: formData.status,
      severity: formData.severity,
      category: formData.category,
      assignee: formData.assignee,
      title: formData.title,
      description: formData.description
    });
    if (!result.success) {
      alert('Error adding feature: ' + result.error);
      console.error('Add feature error:', result.error);
    } else {
      console.log('Feature added successfully:', result);
    }
    handleCloseDialog();
  };

  // Helper: get color for status
  function getStatusColor(status) {
    switch (status) {
      case 'Open':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'In Progress':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'Resolved':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#F3F4F6', text: '#1F2937' };
    }
  }

  // Helper: get color for priority/severity
  function getPriorityColor(severity) {
    switch (severity) {
      case 'High':
        return '#EF4444';
      case 'Medium':
        return '#F59E0B';
      case 'Low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  }

  // Helper: get color for MoSCoW priority
  function getMoscowColor(priority) {
    switch (priority) {
      case 'Must-Have': return '#EF4444';
      case 'Should-Have': return '#F59E0B';
      case 'Could-Have': return '#3B82F6';
      case "Won't-Have": return '#6B7280';
      default: return '#E5E7EB';
    }
  }

  // Helper: get gradient background for MoSCoW priority
  function getMoscowGradient(priority) {
    switch (priority) {
      case 'Must-Have':
        return 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)';
      case 'Should-Have':
        return 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)';
      case 'Could-Have':
        return 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)';
      case "Won't-Have":
        return 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
      default:
        return 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)';
    }
  }

  // Helper: get text color for MoSCoW priority
  function getMoscowTextColor(priority) {
    switch (priority) {
      case 'Must-Have': return '#991B1B';
      case 'Should-Have': return '#92400E';
      case 'Could-Have': return '#1E40AF';
      case "Won't-Have": return '#374151';
      default: return '#111827';
    }
  }

  // Dashboard stats
  const stats = useMemo(() => {
    const filtered = features;
    const withScoring = filtered.filter(f => f.scoring);
    const avgImpact = withScoring.length > 0
      ? Math.round(withScoring.reduce((sum, f) => sum + calculateImpactScore(f.scoring), 0) / withScoring.length)
      : 0;
    const highImpact = withScoring.filter(f => calculateImpactScore(f.scoring) >= 60).length;
    const totalBlockers = filtered.reduce((sum, f) => sum + (f.blockersCount || 0), 0);

    return {
      total: filtered.length,
      open: filtered.filter(f => f.status === 'Open').length,
      inProgress: filtered.filter(f => f.status === 'In Progress').length,
      resolved: filtered.filter(f => f.status === 'Resolved').length,
      mustHave: filtered.filter(f => f.moscow === 'Must-Have').length,
      avgImpact,
      highImpact,
      totalBlockers
    };
  }, [features]);

  // Filter gaps by selected project

  // Calculate Risk Score (1-5 scale, lower is better)
  function calculateRiskScore(scoring) {
    if (!scoring) return 0;
    const { technicalComplexity = 3, dependencyRisk = 3, unknowns = 3 } = scoring;
    const total = technicalComplexity + dependencyRisk + unknowns;
    return Math.round((total / 15) * 100);
  }

  // Calculate Value Score (1-5 scale, higher is better)
  function calculateValueScore(scoring) {
    if (!scoring) return 0;
    const { businessValue = 3 } = scoring;
    return Math.round((businessValue / 5) * 100);
  }

  // Calculate Effort Score (1-5 scale, lower is better)
  function calculateEffortScore(scoring) {
    if (!scoring) return 0;
    const { effort = 3 } = scoring;
    return Math.round((effort / 5) * 100);
  }

  // Calculate Confidence Level (1-5 scale, higher is better)
  function calculateConfidenceLevel(scoring) {
    if (!scoring) return 0;
    const { requirementsClarity = 3 } = scoring;
    return Math.round((requirementsClarity / 5) * 100);
  }

  // Calculate Impact Score (combines value and risk)
  function calculateImpactScore(scoring) {
    if (!scoring) return 0;
    const value = calculateValueScore(scoring);
    const risk = calculateRiskScore(scoring);
    // High value + low risk = high impact
    return Math.round((value + (100 - risk)) / 2);
  }

  // Get color for score (higher is better for most scores)
  function getScoreColor(score, inverted = false) {
    const threshold = inverted ?
      { low: 60, medium: 40 } :
      { low: 40, medium: 60 };

    if (inverted) {
      if (score <= threshold.medium) return '#10B981'; // green
      if (score <= threshold.low) return '#F59E0B'; // amber
      return '#EF4444'; // red
    } else {
      if (score >= threshold.medium) return '#10B981'; // green
      if (score >= threshold.low) return '#F59E0B'; // amber
      return '#EF4444'; // red
    }
  }

  // Convert features to CSV format
  function featuresToCSV(features) {
    const header = [
      'Title', 'Description', 'Target Quarter', 'MoSCoW Priority', 'Linked Goal', 'T-Shirt Sizing', 'Current State', 'Gap Types', 'Dependencies', 'Blockers Count', 'Assignee', 'Status', 'Category', 'Severity', 'Technical Complexity', 'Dependency Risk', 'Unknowns', 'Business Value', 'Effort', 'Requirements Clarity', 'Risk Score', 'Value Score', 'Confidence Level', 'Impact Score', 'Created At'
    ];
    const rows = features.map(f => [
      f.title,
      f.description,
      f.targetQuarter,
      f.moscow,
      f.linkedGoal,
      f.tshirtSize,
      f.currentState,
      Array.isArray(f.gapTypes) ? f.gapTypes.join('; ') : '',
      f.dependencies,
      f.blockersCount ?? '',
      f.assignee,
      f.status,
      f.category,
      f.severity,
      f.scoring?.technicalComplexity ?? '',
      f.scoring?.dependencyRisk ?? '',
      f.scoring?.unknowns ?? '',
      f.scoring?.businessValue ?? '',
      f.scoring?.effort ?? '',
      f.scoring?.requirementsClarity ?? '',
      f.scoring ? calculateRiskScore(f.scoring) : '',
      f.scoring ? calculateValueScore(f.scoring) : '',
      f.scoring ? calculateConfidenceLevel(f.scoring) : '',
      f.scoring ? calculateImpactScore(f.scoring) : '',
      f.createdAt ? new Date(f.createdAt.seconds ? f.createdAt.seconds * 1000 : f.createdAt).toLocaleDateString() : ''
    ]);
    return [header, ...rows].map(r => r.map(x => `"${x ?? ''}"`).join(',')).join('\n');
  }

  // Main return block
  return (
    <Box sx={{ height: '100vh', width: '100%', p: 3, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: mode === 'dark' ? '#121212' : '#FFFFFF', minHeight: '100vh' }}>
      {/* Dashboard stats - first row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {/* Total Features */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '45%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">Total Features</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>{stats.total}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981' }} />
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>+12%</Typography>
          </Box>
        </Box>
        {/* Open */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '45%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">Open</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>{stats.open}</Typography>
        </Box>
        {/* In Progress */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '45%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">In Progress</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>{stats.inProgress}</Typography>
        </Box>
        {/* Resolved */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '45%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">Resolved</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>{stats.resolved}</Typography>
        </Box>
        {/* Add Feature Button */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '45%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            Add Feature
          </Button>
        </Box>
      </Box>
      {/* Dashboard stats - second row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {/* High Priority */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 30%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '30%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">High Priority</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>{stats.high}</Typography>
        </Box>
        {/* In Progress */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 30%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '30%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">In Progress</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>{stats.inProgress}</Typography>
        </Box>
        {/* Open */}
        <Box sx={{
          flex: { xs: '1 1 100%', sm: '1 1 30%', md: '1 1 30%', lg: '1' },
          minWidth: { xs: '100%', sm: '30%', md: '30%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">Open</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>{stats.open}</Typography>
        </Box>
      </Box>
      {/* Features table or list */}
      <Box sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 1, p: 3, border: 1, borderColor: 'divider' }}>
        {/* Map through features and display them */}
        {features.map(feature => (
          <Box key={feature.id} sx={{
            mb: 2,
            display: 'flex',
            bgcolor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '4px',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderColor: '#D1D5DB'
            }
          }}>
            {/* Left Sidebar - Priority Color Stripe */}
            <Box sx={{
              width: '4px',
              bgcolor: getMoscowColor(feature.moscow),
              flexShrink: 0
            }} />

            {/* Card Content */}
            <Box sx={{ flex: 1, p: 1.5 }}>
              {/* Header: Title and Edit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    lineHeight: 1.3,
                    color: '#111827',
                    flex: 1,
                    pr: 1
                  }}
                >
                  {feature.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => { setSelectedFeature(feature); setEditDialogOpen(true); }}
                  sx={{
                    color: '#9CA3AF',
                    p: 0.25,
                    '&:hover': { bgcolor: '#F3F4F6', color: '#4B5563' }
                  }}
                >
                  <MoreVertIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  mb: 1.25,
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  color: '#4B5563'
                }}
              >
                {feature.description}
              </Typography>

              {/* Section: Impact Score Only */}
              {feature.scoring && (
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.4,
                  bgcolor: getScoreColor(calculateImpactScore(feature.scoring)),
                  color: 'white',
                  borderRadius: '3px',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  mb: 1.25
                }}>
                  Impact Score: {calculateImpactScore(feature.scoring)}%
                </Box>
              )}

              {/* Section: Metadata - Simple Text Labels */}
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 1.25,
                fontSize: '0.625rem',
                color: '#6B7280'
              }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>Status:</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#1F2937', fontWeight: 600 }}>{feature.status || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>State:</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#1F2937', fontWeight: 600 }}>{feature.currentState || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>Quarter:</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#1F2937', fontWeight: 600 }}>{feature.targetQuarter || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>Size:</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#1F2937', fontWeight: 600 }}>{feature.tshirtSize || '-'}</Typography>
                </Box>
                {feature.linkedGoal && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>Goal:</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#1F2937', fontWeight: 600 }}>{feature.linkedGoal}</Typography>
                  </Box>
                )}
                {Array.isArray(feature.gapTypes) && feature.gapTypes.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>Gaps:</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#1F2937', fontWeight: 600 }}>{feature.gapTypes.join(', ')}</Typography>
                  </Box>
                )}
                {(feature.blockersCount ?? 0) > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#6B7280' }}>Blockers:</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#991B1B', fontWeight: 600 }}>{feature.blockersCount}</Typography>
                  </Box>
                )}
              </Box>

              {/* Footer: Additional Info */}
              {(feature.assignee || feature.dependencies) && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  {feature.assignee && (
                    <Typography variant="caption" sx={{ color: '#374151', fontSize: '0.625rem', fontWeight: 500 }}>
                      @{feature.assignee}
                    </Typography>
                  )}
                  {feature.dependencies && (
                    <Typography variant="caption" sx={{ color: '#78350F', fontSize: '0.625rem', fontWeight: 500 }}>
                      Deps: {feature.dependencies}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
      {/* Add Feature Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Create Strategic Feature</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map(label => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Feature Name"
                fullWidth
                value={createFeatureData.featureName}
                onChange={e => setCreateFeatureData({ ...createFeatureData, featureName: e.target.value })}
              />
              <TextField
                label="Description / User Story"
                fullWidth
                multiline
                rows={3}
                value={createFeatureData.description}
                onChange={e => setCreateFeatureData({ ...createFeatureData, description: e.target.value })}
                placeholder="As a [user], I want [goal], so that [reason]"
              />
              <FormControl fullWidth>
                <InputLabel>Target Quarter</InputLabel>
                <Select
                  value={createFeatureData.targetQuarter}
                  label="Target Quarter"
                  onChange={e => setCreateFeatureData({ ...createFeatureData, targetQuarter: e.target.value })}
                >
                  {targetQuarters.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>MoSCoW Priority</InputLabel>
                <Select
                  value={createFeatureData.moscow}
                  label="MoSCoW Priority"
                  onChange={e => setCreateFeatureData({ ...createFeatureData, moscow: e.target.value })}
                >
                  {moscowOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Linked Company Goal</InputLabel>
                <Select
                  value={createFeatureData.linkedGoal}
                  label="Linked Company Goal"
                  onChange={e => setCreateFeatureData({ ...createFeatureData, linkedGoal: e.target.value })}
                >
                  {companyGoals.map(goal => <MenuItem key={goal} value={goal}>{goal}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          )}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>T-Shirt Sizing (Effort)</InputLabel>
                <Select
                  value={createFeatureData.tshirtSize}
                  label="T-Shirt Sizing (Effort)"
                  onChange={e => setCreateFeatureData({ ...createFeatureData, tshirtSize: e.target.value })}
                >
                  {tshirtSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Current State</InputLabel>
                <Select
                  value={createFeatureData.currentState}
                  label="Current State"
                  onChange={e => setCreateFeatureData({ ...createFeatureData, currentState: e.target.value })}
                >
                  {currentStates.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="caption" sx={{ mb: 1 }}>Gap Type (Root Cause)</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {gapTypeOptions.map(option => (
                    <Chip
                      key={option}
                      label={option}
                      color={createFeatureData.gapTypes.includes(option) ? 'primary' : 'default'}
                      onClick={() => {
                        setCreateFeatureData({
                          ...createFeatureData,
                          gapTypes: createFeatureData.gapTypes.includes(option)
                            ? createFeatureData.gapTypes.filter(g => g !== option)
                            : [...createFeatureData.gapTypes, option]
                        });
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
              <TextField
                label="Dependencies / Notes"
                fullWidth
                multiline
                rows={2}
                value={createFeatureData.dependencies}
                onChange={e => setCreateFeatureData({ ...createFeatureData, dependencies: e.target.value })}
              />
            </Box>
          )}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Feature Scoring & Prioritization</Typography>

              {/* Technical Complexity */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Technical Complexity (1=Simple, 5=Very Complex)
                </Typography>
                <Slider
                  value={createFeatureData.scoring.technicalComplexity}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setCreateFeatureData({
                    ...createFeatureData,
                    scoring: { ...createFeatureData.scoring, technicalComplexity: val }
                  })}
                />
              </Box>

              {/* Dependency Risk */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Dependency Risk (1=No Dependencies, 5=Many Dependencies)
                </Typography>
                <Slider
                  value={createFeatureData.scoring.dependencyRisk}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setCreateFeatureData({
                    ...createFeatureData,
                    scoring: { ...createFeatureData.scoring, dependencyRisk: val }
                  })}
                />
              </Box>

              {/* Unknowns */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Unknowns / Uncertainty (1=Clear, 5=Many Unknowns)
                </Typography>
                <Slider
                  value={createFeatureData.scoring.unknowns}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setCreateFeatureData({
                    ...createFeatureData,
                    scoring: { ...createFeatureData.scoring, unknowns: val }
                  })}
                />
              </Box>

              {/* Business Value */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Business Value (1=Low Value, 5=High Value)
                </Typography>
                <Slider
                  value={createFeatureData.scoring.businessValue}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setCreateFeatureData({
                    ...createFeatureData,
                    scoring: { ...createFeatureData.scoring, businessValue: val }
                  })}
                />
              </Box>

              {/* Effort */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Effort Required (1=Small, 5=Very Large)
                </Typography>
                <Slider
                  value={createFeatureData.scoring.effort}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setCreateFeatureData({
                    ...createFeatureData,
                    scoring: { ...createFeatureData.scoring, effort: val }
                  })}
                />
              </Box>

              {/* Requirements Clarity */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Requirements Clarity (1=Vague, 5=Crystal Clear)
                </Typography>
                <Slider
                  value={createFeatureData.scoring.requirementsClarity}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setCreateFeatureData({
                    ...createFeatureData,
                    scoring: { ...createFeatureData.scoring, requirementsClarity: val }
                  })}
                />
              </Box>

              {/* Blockers Count */}
              <TextField
                label="Number of Blockers"
                type="number"
                fullWidth
                value={createFeatureData.blockersCount}
                onChange={e => setCreateFeatureData({ ...createFeatureData, blockersCount: parseInt(e.target.value) || 0 })}
                InputProps={{ inputProps: { min: 0 } }}
              />

              {/* Calculated Scores */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Calculated Scores</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Impact Score:</Typography>
                    <Box sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: getScoreColor(calculateImpactScore(createFeatureData.scoring)),
                      color: 'white',
                      borderRadius: 1,
                      fontWeight: 700
                    }}>
                      {calculateImpactScore(createFeatureData.scoring)}%
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Risk Score:</Typography>
                    <Chip
                      label={`${calculateRiskScore(createFeatureData.scoring)}%`}
                      sx={{
                        bgcolor: getScoreColor(calculateRiskScore(createFeatureData.scoring), true),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Value Score:</Typography>
                    <Chip label={`${calculateValueScore(createFeatureData.scoring)}%`} color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Confidence Level:</Typography>
                    <Chip
                      label={`${calculateConfidenceLevel(createFeatureData.scoring)}%`}
                      sx={{
                        bgcolor: getScoreColor(calculateConfidenceLevel(createFeatureData.scoring)),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && <Button onClick={() => setActiveStep(activeStep - 1)}>Back</Button>}
          {activeStep < steps.length - 1 && <Button onClick={() => setActiveStep(activeStep + 1)} disabled={activeStep === 0 && !createFeatureData.featureName.trim()}>Next</Button>}
          {activeStep === steps.length - 1 && (
            <Button
              variant="contained"
              onClick={async () => {
                const result = await addFeature({
                  title: createFeatureData.featureName,
                  description: createFeatureData.description,
                  targetQuarter: createFeatureData.targetQuarter,
                  moscow: createFeatureData.moscow,
                  linkedGoal: createFeatureData.linkedGoal,
                  tshirtSize: createFeatureData.tshirtSize,
                  currentState: createFeatureData.currentState,
                  gapTypes: createFeatureData.gapTypes,
                  dependencies: createFeatureData.dependencies,
                  scoring: createFeatureData.scoring,
                  blockersCount: createFeatureData.blockersCount,
                  status: 'Open',
                  severity: 'Medium',
                  category: 'Feature',
                  assignee: '',
                });
                if (!result.success) {
                  alert('Error creating feature: ' + result.error);
                } else {
                  setOpenDialog(false);
                  setActiveStep(0);
                  setCreateFeatureData({
                    featureName: '',
                    description: '',
                    targetQuarter: '',
                    moscow: '',
                    linkedGoal: '',
                    tshirtSize: '',
                    currentState: '',
                    gapTypes: [],
                    dependencies: '',
                    scoring: {
                      technicalComplexity: 3,
                      dependencyRisk: 3,
                      unknowns: 3,
                      businessValue: 3,
                      effort: 3,
                      requirementsClarity: 3
                    },
                    blockersCount: 0
                  });
                }
              }}
            >
              Save Feature
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Feature Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Feature</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Feature Name"
              fullWidth
              value={selectedFeature?.title || ''}
              onChange={e => setSelectedFeature({ ...selectedFeature, title: e.target.value })}
            />
            <TextField
              label="Description / User Story"
              fullWidth
              multiline
              rows={3}
              value={selectedFeature?.description || ''}
              onChange={e => setSelectedFeature({ ...selectedFeature, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Target Quarter</InputLabel>
              <Select
                value={selectedFeature?.targetQuarter || ''}
                label="Target Quarter"
                onChange={e => setSelectedFeature({ ...selectedFeature, targetQuarter: e.target.value })}
              >
                {targetQuarters.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>MoSCoW Priority</InputLabel>
              <Select
                value={selectedFeature?.moscow || ''}
                label="MoSCoW Priority"
                onChange={e => setSelectedFeature({ ...selectedFeature, moscow: e.target.value })}
              >
                {moscowOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Linked Company Goal</InputLabel>
              <Select
                value={selectedFeature?.linkedGoal || ''}
                label="Linked Company Goal"
                onChange={e => setSelectedFeature({ ...selectedFeature, linkedGoal: e.target.value })}
              >
                {companyGoals.map(goal => <MenuItem key={goal} value={goal}>{goal}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>T-Shirt Sizing (Effort)</InputLabel>
              <Select
                value={selectedFeature?.tshirtSize || ''}
                label="T-Shirt Sizing (Effort)"
                onChange={e => setSelectedFeature({ ...selectedFeature, tshirtSize: e.target.value })}
              >
                {tshirtSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Current State</InputLabel>
              <Select
                value={selectedFeature?.currentState || ''}
                label="Current State"
                onChange={e => setSelectedFeature({ ...selectedFeature, currentState: e.target.value })}
              >
                {currentStates.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="caption" sx={{ mb: 1 }}>Gap Type (Root Cause)</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {gapTypeOptions.map(option => (
                  <Chip
                    key={option}
                    label={option}
                    color={selectedFeature?.gapTypes?.includes(option) ? 'primary' : 'default'}
                    onClick={() => {
                      setSelectedFeature({
                        ...selectedFeature,
                        gapTypes: selectedFeature?.gapTypes?.includes(option)
                          ? selectedFeature.gapTypes.filter(g => g !== option)
                          : [...(selectedFeature.gapTypes || []), option]
                      });
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
            <TextField
              label="Dependencies / Notes"
              fullWidth
              multiline
              rows={2}
              value={selectedFeature?.dependencies || ''}
              onChange={e => setSelectedFeature({ ...selectedFeature, dependencies: e.target.value })}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Feature Scoring & Prioritization</Typography>

              {/* Technical Complexity */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Technical Complexity (1=Simple, 5=Very Complex)
                </Typography>
                <Slider
                  value={selectedFeature?.scoring?.technicalComplexity || 3}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setSelectedFeature({
                    ...selectedFeature,
                    scoring: { ...(selectedFeature?.scoring || {}), technicalComplexity: val }
                  })}
                />
              </Box>

              {/* Dependency Risk */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Dependency Risk (1=No Dependencies, 5=Many Dependencies)
                </Typography>
                <Slider
                  value={selectedFeature?.scoring?.dependencyRisk || 3}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setSelectedFeature({
                    ...selectedFeature,
                    scoring: { ...(selectedFeature?.scoring || {}), dependencyRisk: val }
                  })}
                />
              </Box>

              {/* Unknowns */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Unknowns / Uncertainty (1=Clear, 5=Many Unknowns)
                </Typography>
                <Slider
                  value={selectedFeature?.scoring?.unknowns || 3}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setSelectedFeature({
                    ...selectedFeature,
                    scoring: { ...(selectedFeature?.scoring || {}), unknowns: val }
                  })}
                />
              </Box>

              {/* Business Value */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Business Value (1=Low Value, 5=High Value)
                </Typography>
                <Slider
                  value={selectedFeature?.scoring?.businessValue || 3}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setSelectedFeature({
                    ...selectedFeature,
                    scoring: { ...(selectedFeature?.scoring || {}), businessValue: val }
                  })}
                />
              </Box>

              {/* Effort */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Effort Required (1=Small, 5=Very Large)
                </Typography>
                <Slider
                  value={selectedFeature?.scoring?.effort || 3}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setSelectedFeature({
                    ...selectedFeature,
                    scoring: { ...(selectedFeature?.scoring || {}), effort: val }
                  })}
                />
              </Box>

              {/* Requirements Clarity */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Requirements Clarity (1=Vague, 5=Crystal Clear)
                </Typography>
                <Slider
                  value={selectedFeature?.scoring?.requirementsClarity || 3}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, val) => setSelectedFeature({
                    ...selectedFeature,
                    scoring: { ...(selectedFeature?.scoring || {}), requirementsClarity: val }
                  })}
                />
              </Box>

              {/* Blockers Count */}
              <TextField
                label="Number of Blockers"
                type="number"
                fullWidth
                value={selectedFeature?.blockersCount || 0}
                onChange={e => setSelectedFeature({ ...selectedFeature, blockersCount: parseInt(e.target.value) || 0 })}
                slotProps={{ htmlInput: { min: 0 } }}
                sx={{ mb: 2 }}
              />

              {/* Calculated Scores */}
              {selectedFeature?.scoring && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Calculated Scores</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Impact Score:</Typography>
                      <Box sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: getScoreColor(calculateImpactScore(selectedFeature.scoring)),
                        color: 'white',
                        borderRadius: 1,
                        fontWeight: 700
                      }}>
                        {calculateImpactScore(selectedFeature.scoring)}%
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Risk Score:</Typography>
                      <Chip
                        label={`${calculateRiskScore(selectedFeature.scoring)}%`}
                        sx={{
                          bgcolor: getScoreColor(calculateRiskScore(selectedFeature.scoring), true),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Value Score:</Typography>
                      <Chip label={`${calculateValueScore(selectedFeature.scoring)}%`} color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Confidence Level:</Typography>
                      <Chip
                        label={`${calculateConfidenceLevel(selectedFeature.scoring)}%`}
                        sx={{
                          bgcolor: getScoreColor(calculateConfidenceLevel(selectedFeature.scoring)),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedFeature?.id) return;
              const { id, ...updateData } = selectedFeature;
              const result = await updateFeature(selectedFeature.id, updateData);
              if (!result.success) {
                alert('Error updating feature: ' + result.error);
              } else {
                setEditDialogOpen(false);
              }
            }}
            disabled={!selectedFeature?.title?.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      {/* Export to CSV Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={() => {
            const csv = featuresToCSV(features);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'features.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export to Spreadsheet
        </Button>
      </Box>
    </Box>
  );
}

export default DashboardHome;
