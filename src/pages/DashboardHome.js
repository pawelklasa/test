import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useProject } from '../ProjectContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFeatures } from '../hooks/useFeatures';
import { useCategories } from '../hooks/useCategories';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

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
const workflowStatuses = ['Planning', 'In Progress', 'Done', "Won't Do"];

function DashboardHome() {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';

  // Calculate impact score as percentage
  function getImpactScore(f) {
    const safe = key => typeof f[key] === 'number' ? f[key] : 3;
    const businessValue = safe('businessValue');
    const requirementsClarity = safe('requirementsClarity');
    const technicalComplexity = safe('technicalComplexity');
    const dependencyRisk = safe('dependencyRisk');
    const unknowns = safe('unknowns');
    const effort = safe('effortRequired');

    // Higher business value and clarity = good (keep as is)
    // Lower complexity, risk, unknowns, effort = good (invert these)
    const positiveScore = businessValue + requirementsClarity;
    const negativeScore = (6 - technicalComplexity) + (6 - dependencyRisk) + (6 - unknowns) + (6 - effort);

    const totalScore = positiveScore + negativeScore;
    const maxScore = 30; // 5+5+5+5+5+5

    return Math.round((totalScore / maxScore) * 100);
  }

  // Get color based on impact score
  function getImpactColor(score) {
    if (score >= 70) return '#10B981'; // Green - High impact
    if (score >= 50) return '#3B82F6'; // Blue - Medium impact
    if (score >= 30) return '#F59E0B'; // Orange - Low-medium impact
    return '#EF4444'; // Red - Low impact
  }

  // Get color for workflow status
  function getWorkflowStatusColor(status) {
    switch (status) {
      case 'Done': return '#10B981'; // Green
      case 'In Progress': return '#3B82F6'; // Blue
      case 'Planning': return '#F59E0B'; // Orange
      case "Won't Do": return '#6B7280'; // Gray
      default: return '#F59E0B'; // Orange (default to Planning)
    }
  }

  // Handle status change for a feature
  const handleStatusChange = async (featureId, newStatus) => {
    await updateFeature(featureId, { workflowStatus: newStatus });
  };

  // Truncate description for card display
  function getTruncatedDescription(desc) {
    if (!desc) return '';
    return desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;
  }

  // Handle delete with confirmation
  const handleDeleteFeature = (featureId, featureName) => {
    if (window.confirm(`Are you sure you want to delete "${featureName}"?\n\nThis action cannot be undone.`)) {
      deleteFeature(featureId);
    }
  };

  // Replace local state with Firestore features
  // Use selectedProject from ProjectContext (top nav dropdown)
  const { selectedProject } = useProject();
  const { features, addFeature, deleteFeature, updateFeature, loading } = useFeatures(selectedProject);
  const { categories, addCategory, removeCategory, loading: categoriesLoading } = useCategories(selectedProject);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    desc: '',
    targetQuarter: '',
    moscow: '',
    goal: '',
    tshirtSize: '',
    state: '',
    gapTypes: [],
    dependencies: '',
    category: '',
    workflowStatus: 'Planning',
    technicalComplexity: 3,
    dependencyRisk: 3,
    unknowns: 3,
    businessValue: 3,
    effortRequired: 3,
    requirementsClarity: 3
  });
  const [editingId, setEditingId] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    state: '',
    quarter: '',
    size: '',
    goal: '',
    gap: ''
  });

  // Handle adding new category
  const handleAddCategory = async () => {
    if (newCategoryInput.trim() && !categories.includes(newCategoryInput.trim())) {
      await addCategory(newCategoryInput.trim());
      setForm({ ...form, category: newCategoryInput.trim() });
      setNewCategoryInput('');
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priority: '',
      category: '',
      state: '',
      quarter: '',
      size: '',
      goal: '',
      gap: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  const handleAddFeature = async () => {
    // If there's a category that's not in the categories list, add it
    if (form.category && form.category.trim() && !categories.includes(form.category.trim())) {
      await addCategory(form.category.trim());
    }

    if (editingId) {
      // Update existing feature
      updateFeature(editingId, form);
    } else {
      // Add new feature
      addFeature(form);
    }
    setForm({
      name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: '', category: '', workflowStatus: 'Planning',
      technicalComplexity: 3, dependencyRisk: 3, unknowns: 3, businessValue: 3, effortRequired: 3, requirementsClarity: 3
    });
    setEditingId(null);
    setOpenDialog(false);
  };

  const handleCardClick = (feature) => {
    setSelectedFeature(feature);
    setOpenDetailsModal(true);
  };

  const handleEditFromModal = (feature) => {
    setOpenDetailsModal(false);
    setForm({
      name: feature.name || '',
      desc: feature.desc || '',
      targetQuarter: feature.targetQuarter || '',
      moscow: feature.moscow || '',
      goal: feature.goal || '',
      tshirtSize: feature.tshirtSize || '',
      state: feature.state || '',
      gapTypes: Array.isArray(feature.gapTypes) ? feature.gapTypes : [],
      dependencies: feature.dependencies || '',
      category: feature.category || '',
      workflowStatus: feature.workflowStatus || 'Planning',
      technicalComplexity: feature.technicalComplexity || 3,
      dependencyRisk: feature.dependencyRisk || 3,
      unknowns: feature.unknowns || 3,
      businessValue: feature.businessValue || 3,
      effortRequired: feature.effortRequired || 3,
      requirementsClarity: feature.requirementsClarity || 3
    });
    setEditingId(feature.id);
    setOpenDialog(true);
  };

  // Filter features based on active filters
  const filteredFeatures = features.filter(feature => {
    // Priority filter
    if (filters.priority && feature.moscow !== filters.priority) return false;
    
    // Category filter
    if (filters.category && feature.category !== filters.category) return false;
    
    // State filter
    if (filters.state && feature.state !== filters.state) return false;
    
    // Quarter filter
    if (filters.quarter && feature.targetQuarter !== filters.quarter) return false;
    
    // Size filter
    if (filters.size && feature.tshirtSize !== filters.size) return false;
    
    // Goal filter
    if (filters.goal && feature.goal !== filters.goal) return false;

    // Gap filter
    if (filters.gap) {
      const featureGaps = Array.isArray(feature.gapTypes) ? feature.gapTypes : [];
      if (!featureGaps.includes(filters.gap)) return false;
    }

    return true;
  });

  // Calculate dashboard metrics (using filtered features)
  const totalFeatures = filteredFeatures.length;
  const mustHave = filteredFeatures.filter(f => f.moscow === 'Must-Have').length;
  const shouldHave = filteredFeatures.filter(f => f.moscow === 'Should-Have').length;
  const avgImpact = totalFeatures > 0
    ? Math.round(filteredFeatures.reduce((sum, f) => sum + getImpactScore(f), 0) / totalFeatures)
    : 0;
  const highImpact = filteredFeatures.filter(f => getImpactScore(f) >= 18).length; // 18+ is considered high (out of 30 max)

  // Progress metrics (using ALL features, not filtered - this represents true project progress)
  const allCompletedFeatures = features.filter(f => f.workflowStatus === 'Done').length;
  const allInProgressFeatures = features.filter(f => f.workflowStatus === 'In Progress').length;
  const allPlanningFeatures = features.filter(f => f.workflowStatus === 'Planning' || !f.workflowStatus).length;
  const allWontDoFeatures = features.filter(f => f.workflowStatus === "Won't Do").length;
  const progressPercentage = features.length > 0 ? Math.round((allCompletedFeatures / features.length) * 100) : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Progress Bar */}
      <Box sx={{
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Project Progress
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            {progressPercentage}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 12,
            borderRadius: 1,
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#10B981',
              borderRadius: 1,
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#10B981', borderRadius: '2px' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              Done: {allCompletedFeatures}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#3B82F6', borderRadius: '2px' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              In Progress: {allInProgressFeatures}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#F59E0B', borderRadius: '2px' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              Planning: {allPlanningFeatures}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#6B7280', borderRadius: '2px' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              Won't Do: {allWontDoFeatures}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Dashboard Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Total Features
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {totalFeatures}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Must-Have
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
            {mustHave}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Should-Have
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
            {shouldHave}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            High Impact
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            {highImpact}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Avg Impact Score
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
            {avgImpact}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            Add Feature
          </Button>
        </Box>
      </Box>

      {/* Filtering Controls */}
      <Box sx={{ mb: 3, p: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* All Filters in One Row */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
            {/* Priority Filter */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {moscowOptions.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '0.875rem' }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {categories.map(cat => <MenuItem key={cat} value={cat} sx={{ fontSize: '0.875rem' }}>{cat}</MenuItem>)}
              </Select>
            </FormControl>

            {/* State Filter */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>State</InputLabel>
              <Select
                value={filters.state}
                label="State"
                onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {currentStates.map(state => <MenuItem key={state} value={state} sx={{ fontSize: '0.875rem' }}>{state}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Quarter Filter */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>Quarter</InputLabel>
              <Select
                value={filters.quarter}
                label="Quarter"
                onChange={(e) => setFilters(f => ({ ...f, quarter: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {targetQuarters.map(q => <MenuItem key={q} value={q} sx={{ fontSize: '0.875rem' }}>{q}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Size Filter */}
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>Size</InputLabel>
              <Select
                value={filters.size}
                label="Size"
                onChange={(e) => setFilters(f => ({ ...f, size: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {tshirtSizes.map(size => <MenuItem key={size} value={size} sx={{ fontSize: '0.875rem' }}>{size}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Goal Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>Goal</InputLabel>
              <Select
                value={filters.goal}
                label="Goal"
                onChange={(e) => setFilters(f => ({ ...f, goal: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {companyGoals.map(goal => <MenuItem key={goal} value={goal} sx={{ fontSize: '0.875rem' }}>{goal}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Gap Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontSize: '0.875rem' }}>Gap</InputLabel>
              <Select
                value={filters.gap}
                label="Gap"
                onChange={(e) => setFilters(f => ({ ...f, gap: e.target.value }))}
                sx={{
                  fontSize: '0.875rem',
                  '& .MuiSelect-select': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All</MenuItem>
                {gapTypeOptions.map(gap => <MenuItem key={gap} value={gap} sx={{ fontSize: '0.875rem' }}>{gap}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {/* Clear All Button and Count */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {hasActiveFilters && (
              <>
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {totalFeatures} / {features.length}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={clearAllFilters}
                  sx={{
                    minWidth: 'auto',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1,
                    textTransform: 'none'
                  }}
                >
                  Clear
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {loading || categoriesLoading ? (
        <Typography>Loading features and categories...</Typography>
      ) : (
        <Box>
          {filteredFeatures.length === 0 && hasActiveFilters ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                No features match your filters
              </Typography>
              <Button variant="outlined" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ display: 'flex' }}>
              <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {filteredFeatures.filter((_, i) => i % 2 === 0).map((f, idx) => {
                let borderColor = '#e0e0e0';
                if (f.moscow === 'Must-Have') borderColor = '#fa709a';
                else if (f.moscow === 'Should-Have') borderColor = '#667eea';
                else if (f.moscow === 'Could-Have') borderColor = '#43e97b';
                else if (f.moscow === "Won't-Have") borderColor = '#bdbdbd';
                return (
                  <Box key={f.id || idx} sx={{
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
                  onClick={() => handleCardClick(f)}
                  >
                    {/* Left Sidebar - Priority Color Stripe */}
                    <Box sx={{
                      width: '4px',
                      bgcolor: borderColor,
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
                            color: 'text.primary',
                            flex: 1,
                            pr: 1
                          }}
                        >
                          {f.name}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm({
                                name: f.name || '',
                                desc: f.desc || '',
                                targetQuarter: f.targetQuarter || '',
                                moscow: f.moscow || '',
                                goal: f.goal || '',
                                tshirtSize: f.tshirtSize || '',
                                state: f.state || '',
                                gapTypes: Array.isArray(f.gapTypes) ? f.gapTypes : [],
                                dependencies: f.dependencies || '',
                                category: f.category || '',
                                technicalComplexity: f.technicalComplexity || 3,
                                dependencyRisk: f.dependencyRisk || 3,
                                unknowns: f.unknowns || 3,
                                businessValue: f.businessValue || 3,
                                effortRequired: f.effortRequired || 3,
                                requirementsClarity: f.requirementsClarity || 3
                              });
                              setEditingId(f.id);
                              setOpenDialog(true);
                            }}
                            sx={{
                              color: 'text.secondary',
                              p: 0.25,
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(243, 244, 246, 1)',
                                color: 'text.primary'
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFeature(f.id, f.name);
                            }}
                            sx={{
                              color: 'text.secondary',
                              p: 0.25,
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 1)',
                                color: '#991B1B'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1.25,
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          color: 'text.secondary'
                        }}
                      >
                        {getTruncatedDescription(f.desc)}
                      </Typography>

                      {/* Impact Score Badge and Status Dropdown */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.25, flexWrap: 'wrap' }}>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1,
                          py: 0.4,
                          bgcolor: getImpactColor(getImpactScore(f)),
                          color: 'white',
                          borderRadius: '3px',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}>
                          Impact Score: {getImpactScore(f)}%
                        </Box>

                        {/* Status Dropdown */}
                        <FormControl size="small" sx={{ minWidth: 120 }} onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={f.workflowStatus || 'Planning'}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(f.id, e.target.value);
                            }}
                            sx={{
                              fontSize: '0.7rem',
                              height: '26px',
                              bgcolor: getWorkflowStatusColor(f.workflowStatus || 'Planning'),
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiOutline-notchedOutline': { border: 'none' },
                              '& .MuiSelect-icon': { color: 'white' },
                              '&:hover': { opacity: 0.9 },
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1,
                                display: 'flex',
                                alignItems: 'center'
                              }
                            }}
                          >
                            {workflowStatuses.map(status => (
                              <MenuItem key={status} value={status} sx={{ fontSize: '0.75rem' }}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Metadata - Simple Text Labels */}
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mb: 1.25,
                        fontSize: '0.625rem'
                      }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Priority:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.moscow || '-'}</Typography>
                        </Box>
                        {f.category && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Category:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'primary.main', fontWeight: 600 }}>{f.category}</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>State:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.state || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Quarter:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.targetQuarter || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Size:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.tshirtSize || '-'}</Typography>
                        </Box>
                        {f.goal && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Goal:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.goal}</Typography>
                          </Box>
                        )}
                        {Array.isArray(f.gapTypes) && f.gapTypes.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Gaps:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.gapTypes.join(', ')}</Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Footer */}
                      {f.dependencies && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Dependencies:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'warning.dark', fontWeight: 500 }}>{f.dependencies}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {filteredFeatures.filter((_, i) => i % 2 === 1).map((f, idx) => {
                let borderColor = '#e0e0e0';
                if (f.moscow === 'Must-Have') borderColor = '#fa709a';
                else if (f.moscow === 'Should-Have') borderColor = '#667eea';
                else if (f.moscow === 'Could-Have') borderColor = '#43e97b';
                else if (f.moscow === "Won't-Have") borderColor = '#bdbdbd';
                return (
                  <Box key={f.id || idx} sx={{
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
                  onClick={() => handleCardClick(f)}
                  >
                    {/* Left Sidebar - Priority Color Stripe */}
                    <Box sx={{
                      width: '4px',
                      bgcolor: borderColor,
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
                            color: 'text.primary',
                            flex: 1,
                            pr: 1
                          }}
                        >
                          {f.name}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm({
                                name: f.name || '',
                                desc: f.desc || '',
                                targetQuarter: f.targetQuarter || '',
                                moscow: f.moscow || '',
                                goal: f.goal || '',
                                tshirtSize: f.tshirtSize || '',
                                state: f.state || '',
                                gapTypes: Array.isArray(f.gapTypes) ? f.gapTypes : [],
                                dependencies: f.dependencies || '',
                                category: f.category || '',
                                technicalComplexity: f.technicalComplexity || 3,
                                dependencyRisk: f.dependencyRisk || 3,
                                unknowns: f.unknowns || 3,
                                businessValue: f.businessValue || 3,
                                effortRequired: f.effortRequired || 3,
                                requirementsClarity: f.requirementsClarity || 3
                              });
                              setEditingId(f.id);
                              setOpenDialog(true);
                            }}
                            sx={{
                              color: 'text.secondary',
                              p: 0.25,
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(243, 244, 246, 1)',
                                color: 'text.primary'
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFeature(f.id, f.name);
                            }}
                            sx={{
                              color: 'text.secondary',
                              p: 0.25,
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 1)',
                                color: '#991B1B'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1.25,
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          color: 'text.secondary'
                        }}
                      >
                        {getTruncatedDescription(f.desc)}
                      </Typography>

                      {/* Impact Score Badge and Status Dropdown */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.25, flexWrap: 'wrap' }}>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1,
                          py: 0.4,
                          bgcolor: getImpactColor(getImpactScore(f)),
                          color: 'white',
                          borderRadius: '3px',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}>
                          Impact Score: {getImpactScore(f)}%
                        </Box>

                        {/* Status Dropdown */}
                        <FormControl size="small" sx={{ minWidth: 120 }} onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={f.workflowStatus || 'Planning'}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(f.id, e.target.value);
                            }}
                            sx={{
                              fontSize: '0.7rem',
                              height: '26px',
                              bgcolor: getWorkflowStatusColor(f.workflowStatus || 'Planning'),
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiOutline-notchedOutline': { border: 'none' },
                              '& .MuiSelect-icon': { color: 'white' },
                              '&:hover': { opacity: 0.9 },
                              '& .MuiSelect-select': {
                                py: 0.5,
                                px: 1,
                                display: 'flex',
                                alignItems: 'center'
                              }
                            }}
                          >
                            {workflowStatuses.map(status => (
                              <MenuItem key={status} value={status} sx={{ fontSize: '0.75rem' }}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Metadata - Simple Text Labels */}
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mb: 1.25,
                        fontSize: '0.625rem'
                      }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Priority:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.moscow || '-'}</Typography>
                        </Box>
                        {f.category && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Category:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'primary.main', fontWeight: 600 }}>{f.category}</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>State:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.state || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Quarter:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.targetQuarter || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Size:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.tshirtSize || '-'}</Typography>
                        </Box>
                        {f.goal && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Goal:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.goal}</Typography>
                          </Box>
                        )}
                        {Array.isArray(f.gapTypes) && f.gapTypes.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Gaps:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.primary', fontWeight: 600 }}>{f.gapTypes.join(', ')}</Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Footer */}
                      {f.dependencies && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Dependencies:</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'warning.dark', fontWeight: 500 }}>{f.dependencies}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
                })}
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Feature Details Modal */}
      <Dialog
        open={openDetailsModal}
        onClose={() => setOpenDetailsModal(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '8px',
            }
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, pr: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {selectedFeature?.name}
              </Typography>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                bgcolor: selectedFeature ? getImpactColor(getImpactScore(selectedFeature)) : 'primary.main',
                color: 'white',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                Impact Score: {selectedFeature && getImpactScore(selectedFeature)}%
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleEditFromModal(selectedFeature)}
              >
                Edit
              </Button>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFeature(selectedFeature?.id);
                  setOpenDetailsModal(false);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 1)', color: '#991B1B' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectedFeature && (
            <Box>
              {/* Description */}
              {selectedFeature.desc && (
                <Box sx={{ mb: 3, p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '6px', border: 1, borderColor: 'divider' }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.primary', 
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.95rem'
                    }}
                  >
                    {selectedFeature.desc}
                  </Typography>
                </Box>
              )}

              {/* Key Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                  Key Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Priority
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {selectedFeature.moscow || '-'}
                    </Typography>
                  </Box>

                  {selectedFeature.category && (
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                        Category
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'primary.main' }}>
                        {selectedFeature.category}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      State
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {selectedFeature.state || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Quarter
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {selectedFeature.targetQuarter || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Size
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {selectedFeature.tshirtSize || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Goal
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {selectedFeature.goal || '-'}
                    </Typography>
                  </Box>

                  {Array.isArray(selectedFeature.gapTypes) && selectedFeature.gapTypes.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                        Gap Types
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {selectedFeature.gapTypes.join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Scoring */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                  Scoring
                </Typography>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {[
                    { label: 'Technical Complexity', value: selectedFeature.technicalComplexity, color: '#3B82F6' },
                    { label: 'Dependency Risk', value: selectedFeature.dependencyRisk, color: '#F59E0B' },
                    { label: 'Unknowns', value: selectedFeature.unknowns, color: '#EF4444' },
                    { label: 'Business Value', value: selectedFeature.businessValue, color: '#10B981' },
                    { label: 'Effort Required', value: selectedFeature.effortRequired, color: '#8B5CF6' },
                    { label: 'Requirements Clarity', value: selectedFeature.requirementsClarity, color: '#06B6D4' }
                  ].map((metric) => (
                    <Box key={metric.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: '160px', fontSize: '0.875rem', color: 'text.secondary' }}>
                        {metric.label}
                      </Typography>
                      <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <Box
                            key={i}
                            sx={{
                              flex: 1,
                              height: 20,
                              borderRadius: '3px',
                              bgcolor: i <= (metric.value || 0) ? metric.color : 'divider',
                              transition: 'all 0.2s',
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: '20px', fontWeight: 600, color: 'text.primary' }}>
                        {metric.value || 0}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Dependencies */}
              {selectedFeature.dependencies && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                    Dependencies / Notes
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: '6px', border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                      {selectedFeature.dependencies}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Add Feature Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Feature Name"
            fullWidth
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          {/* Category Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category}
              label="Category"
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          
          {/* Add New Category */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Add New Category"
              value={newCategoryInput}
              onChange={e => setNewCategoryInput(e.target.value)}
              placeholder="Enter category name"
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddCategory}
              disabled={!newCategoryInput.trim() || categories.includes(newCategoryInput.trim())}
            >
              Add
            </Button>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Target Quarter</InputLabel>
            <Select
              value={form.targetQuarter}
              label="Target Quarter"
              onChange={e => setForm(f => ({ ...f, targetQuarter: e.target.value }))}
            >
              {targetQuarters.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>MoSCoW</InputLabel>
            <Select
              value={form.moscow}
              label="MoSCoW"
              onChange={e => setForm(f => ({ ...f, moscow: e.target.value }))}
            >
              {moscowOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Company Goal</InputLabel>
            <Select
              value={form.goal}
              label="Company Goal"
              onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
            >
              {companyGoals.map(goal => <MenuItem key={goal} value={goal}>{goal}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>T-Shirt Sizing (Effort)</InputLabel>
            <Select
              value={form.tshirtSize}
              label="T-Shirt Sizing (Effort)"
              onChange={e => setForm(f => ({ ...f, tshirtSize: e.target.value }))}
            >
              {tshirtSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Current State</InputLabel>
            <Select
              value={form.state}
              label="Current State"
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            >
              {currentStates.map(state => <MenuItem key={state} value={state}>{state}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 1 }}>Gap Type (Root Cause)</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {gapTypeOptions.map(option => (
                <Chip
                  key={option}
                  label={option}
                  color={form.gapTypes.includes(option) ? 'primary' : 'default'}
                  onClick={() => setForm(f => ({
                    ...f,
                    gapTypes: f.gapTypes.includes(option)
                      ? f.gapTypes.filter(g => g !== option)
                      : [...f.gapTypes, option]
                  }))}
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
            value={form.dependencies}
            onChange={e => setForm(f => ({ ...f, dependencies: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Feature Scoring & Prioritization - Moved to bottom */}
          <Box sx={{ mb: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Feature Scoring & Prioritization</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Technical Complexity (1=Simple, 5=Very Complex)</Typography>
              <Slider min={1} max={5} value={form.technicalComplexity} onChange={(_, v) => setForm(f => ({ ...f, technicalComplexity: v }))} valueLabelDisplay="auto" />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Dependency Risk (1=No Dependencies, 5=Many Dependencies)</Typography>
              <Slider min={1} max={5} value={form.dependencyRisk} onChange={(_, v) => setForm(f => ({ ...f, dependencyRisk: v }))} valueLabelDisplay="auto" />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Unknowns / Uncertainty (1=Clear, 5=Many Unknowns)</Typography>
              <Slider min={1} max={5} value={form.unknowns} onChange={(_, v) => setForm(f => ({ ...f, unknowns: v }))} valueLabelDisplay="auto" />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Business Value (1=Low Value, 5=High Value)</Typography>
              <Slider min={1} max={5} value={form.businessValue} onChange={(_, v) => setForm(f => ({ ...f, businessValue: v }))} valueLabelDisplay="auto" />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Effort Required (1=Small, 5=Very Large)</Typography>
              <Slider min={1} max={5} value={form.effortRequired} onChange={(_, v) => setForm(f => ({ ...f, effortRequired: v }))} valueLabelDisplay="auto" />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Requirements Clarity (1=Vague, 5=Crystal Clear)</Typography>
              <Slider min={1} max={5} value={form.requirementsClarity} onChange={(_, v) => setForm(f => ({ ...f, requirementsClarity: v }))} valueLabelDisplay="auto" />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingId(null);
            setForm({
              name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: '', category: '',
              technicalComplexity: 3, dependencyRisk: 3, unknowns: 3, businessValue: 3, effortRequired: 3, requirementsClarity: 3
            });
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFeature} disabled={!form.name.trim()}>
            {editingId ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default DashboardHome;
