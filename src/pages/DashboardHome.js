import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
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
import { trackFeatureAdded, trackFeatureDeleted, trackFilterUsed, trackCategoryCreated, trackPageView } from '../services/analytics';
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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Psychology from '@mui/icons-material/Psychology';
import SubtaskAnalysisDialog from '../components/SubtaskAnalysisDialog';
import { useSubtaskExtraction } from '../hooks/useSubtaskExtraction';

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
const storyPoints = [1, 2, 3, 5, 8, 13, 21, 34]; // Fibonacci sequence
const currentStates = ['Missing', 'Partial Endpoints', 'Live in Prod'];
const gapTypeOptions = ['Documentation/Training', 'Technology/Tech Debt', 'Process', 'Resources'];
const workflowStatuses = ['Planning', 'In Progress', 'Done', "Won't Do"];

function DashboardHome() {
  const theme = useMuiTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

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
  const handleDeleteFeature = (featureId, featureName, featureCategory = 'unknown') => {
    if (window.confirm(`Are you sure you want to delete "${featureName}"?\n\nThis action cannot be undone.`)) {
      deleteFeature(featureId);
      trackFeatureDeleted(featureCategory);
      // Close modal if deleting the currently selected feature
      if (selectedFeature?.id === featureId) {
        setOpenDetailsModal(false);
        setSelectedFeature(null);
      }
    }
  };

  // Replace local state with Firestore features
  // Use selectedProject from ProjectContext (top nav dropdown)
  const { selectedProject } = useProject();
  const { features, addFeature, deleteFeature, updateFeature, loading } = useFeatures(selectedProject);
  const { categories, addCategory, removeCategory, loading: categoriesLoading } = useCategories(selectedProject);

  // Track page view
  useEffect(() => {
    trackPageView('dashboard', selectedProject);
  }, [selectedProject]);

  // Handle feature ID from search results
  useEffect(() => {
    const featureId = searchParams.get('featureId');
    if (featureId && features.length > 0) {
      const feature = features.find(f => f.id === featureId);
      if (feature) {
        setSelectedFeature(feature);
        setOpenDetailsModal(true);
        // Remove the featureId from URL to clean it up
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('featureId');
          return newParams;
        });
      }
    }
  }, [searchParams, features, setSearchParams]);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, or 3 for the wizard

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [addCategoryDropdownOpen, setAddCategoryDropdownOpen] = useState(false);
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
    requirementsClarity: 3,
    // New TTM Algorithm Fields
    storyPoints: 5,
    dependencyCount: 0,
    frontendImpact: 3,
    backendImpact: 3,
    databaseImpact: 3,
    estimatedBackendHours: 0,
    estimatedFrontendHours: 0,
    estimatedQAHours: 0
  });
  const [editingId, setEditingId] = useState(null);
  
  // Subtask analysis state
  const [subtaskAnalysisOpen, setSubtaskAnalysisOpen] = useState(false);
  const [selectedFeatureForAnalysis, setSelectedFeatureForAnalysis] = useState(null);
  const { analyzeFeatureComplexity } = useSubtaskExtraction();
  
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
      trackCategoryCreated(newCategoryInput.trim());
      setForm({ ...form, category: newCategoryInput.trim() });
      setNewCategoryInput('');
    }
  };

  // Handle deleting category
  const handleDeleteCategory = async (categoryToDelete, event) => {
    event.stopPropagation(); // Prevent dropdown from opening/closing
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
      await removeCategory(categoryToDelete);
      // If the deleted category was selected, clear the form field
      if (form.category === categoryToDelete) {
        setForm({ ...form, category: '' });
      }
    }
  };

  // Filter change handlers with analytics tracking
  const handleFilterChange = (filterType, value) => {
    if (value) {
      trackFilterUsed(filterType, value, selectedProject);
    }
    setFilters(f => ({ ...f, [filterType]: value }));
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

  // Export features to CSV
  const exportToCSV = () => {
    // Log debug info to ensure we're getting all features
    console.log('🔍 Export Debug Info:');
    console.log(`📊 Total features in database: ${features.length}`);
    console.log(`🔎 Filtered features currently shown: ${filteredFeatures.length}`);
    console.log('🗄️ All features array:', features);
    
    if (!features.length) {
      alert('No features to export');
      return;
    }

    // Define the headers for CSV (removed Description)
    const headers = [
      'Feature Name',
      'Category',
      'Priority (MoSCoW)',
      'Target Quarter',
      'T-Shirt Size',
      'Story Points',
      'Current State',
      'Company Goal',
      'Gap Types',
      'Workflow Status',
      'Business Value (1-5)',
      'Technical Complexity (1-5)',
      'Effort Required (1-5)',
      'Created Date'
    ];

    // Convert ALL features to CSV rows (using 'features' not 'filteredFeatures')
    const csvRows = features.map(feature => [
      `"${(feature.name || '').replace(/"/g, '""')}"`,
      `"${feature.category || ''}"`,
      `"${feature.moscow || ''}"`,
      `"${feature.targetQuarter || ''}"`,
      `"${feature.tshirtSize || ''}"`,
      `"${feature.storyPoints || ''}"`,
      `"${feature.state || ''}"`,
      `"${feature.goal || ''}"`,
      `"${(feature.gapTypes || []).join(', ')}"`,
      `"${feature.workflowStatus || ''}"`,
      `"${feature.businessValue || ''}"`,
      `"${feature.technicalComplexity || ''}"`,
      `"${feature.effortRequired || ''}"`,
      `"${feature.createdAt ? new Date(feature.createdAt.seconds * 1000).toLocaleDateString() : ''}"`
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `features-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Successfully exported ALL ${features.length} features to CSV (not just the ${filteredFeatures.length} filtered ones)`);
    // Track the export
    trackFilterUsed('export', 'csv', selectedProject);
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
      trackFeatureAdded(form.category || 'uncategorized', form.moscow || 'unspecified');
    }
    setForm({
      name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: '', category: '', workflowStatus: 'Planning',
      technicalComplexity: 3, dependencyRisk: 3, unknowns: 3, businessValue: 3, effortRequired: 3, requirementsClarity: 3,
      storyPoints: 5, dependencyCount: 0, frontendImpact: 3, backendImpact: 3, databaseImpact: 3,
      estimatedBackendHours: 0, estimatedFrontendHours: 0, estimatedQAHours: 0
    });
    setEditingId(null);
    setWizardStep(1); // Reset wizard
    setOpenDialog(false);
  };

  // Wizard navigation
  const handleWizardNext = () => {
    setWizardStep(prev => Math.min(prev + 1, 3));
  };

  const handleWizardBack = () => {
    setWizardStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToStep2 = () => {
    return form.name.trim() !== '';
  };

  const canProceedToStep3 = () => {
    return form.moscow !== '' && form.category !== '';
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
      requirementsClarity: feature.requirementsClarity || 3,
      storyPoints: feature.storyPoints || 5,
      dependencyCount: feature.dependencyCount || 0,
      frontendImpact: feature.frontendImpact || 3,
      backendImpact: feature.backendImpact || 3,
      databaseImpact: feature.databaseImpact || 3,
      estimatedBackendHours: feature.estimatedBackendHours || 0,
      estimatedFrontendHours: feature.estimatedFrontendHours || 0,
      estimatedQAHours: feature.estimatedQAHours || 0
    });
    setEditingId(feature.id);
    setOpenDialog(true);
  };

  // Subtask analysis handlers
  const handleAnalyzeForSubtasks = (feature) => {
    setSelectedFeatureForAnalysis(feature);
    setSubtaskAnalysisOpen(true);
  };

  const handleSubtasksCreated = (createdSubtasks) => {
    // Refresh features list to show new subtasks
    // The useFeatures hook should automatically update
    console.log('Created subtasks:', createdSubtasks);
  };

  // Check if feature needs subtask analysis
  const shouldShowSubtaskButton = (feature) => {
    if (!feature.desc || feature.isSubtask) return false;
    
    const description = feature.desc;
    // Show button for long descriptions or those with structure indicators
    return description.length > 150 || 
           /[-•*]\s/.test(description) || 
           /\d+\.\s/.test(description) ||
           (description.split(/[.!?]+/).filter(s => s.trim().length > 10).length > 4);
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
          flexDirection: 'column',
          gap: 1
        }}>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
            fullWidth
            sx={{ fontWeight: 600 }}
          >
            Add Feature
          </Button>
          <Button
            variant="outlined"
            onClick={exportToCSV}
            fullWidth
            startIcon={<DownloadIcon />}
            sx={{ fontWeight: 600 }}
            disabled={!features.length}
          >
            Export CSV
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
                onChange={(e) => handleFilterChange('priority', e.target.value)}
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
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
                onChange={(e) => handleFilterChange('state', e.target.value)}
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
                onChange={(e) => handleFilterChange('quarter', e.target.value)}
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
                onChange={(e) => handleFilterChange('size', e.target.value)}
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
                onChange={(e) => handleFilterChange('goal', e.target.value)}
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
                onChange={(e) => handleFilterChange('gap', e.target.value)}
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
                                workflowStatus: f.workflowStatus || 'Planning',
                                technicalComplexity: f.technicalComplexity || 3,
                                dependencyRisk: f.dependencyRisk || 3,
                                unknowns: f.unknowns || 3,
                                businessValue: f.businessValue || 3,
                                effortRequired: f.effortRequired || 3,
                                requirementsClarity: f.requirementsClarity || 3,
                                storyPoints: f.storyPoints || 5,
                                dependencyCount: f.dependencyCount || 0,
                                frontendImpact: f.frontendImpact || 3,
                                backendImpact: f.backendImpact || 3,
                                databaseImpact: f.databaseImpact || 3,
                                estimatedBackendHours: f.estimatedBackendHours || 0,
                                estimatedFrontendHours: f.estimatedFrontendHours || 0,
                                estimatedQAHours: f.estimatedQAHours || 0
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
                          {shouldShowSubtaskButton(f) && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyzeForSubtasks(f);
                              }}
                              sx={{
                                color: 'text.secondary',
                                p: 0.25,
                                '&:hover': {
                                  bgcolor: isDark ? 'rgba(156, 39, 176, 0.15)' : 'rgba(243, 229, 245, 1)',
                                  color: '#7B1FA2'
                                }
                              }}
                            >
                              <Psychology sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
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
                        {f.storyPoints && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Story Points:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'primary.main', fontWeight: 700 }}>{f.storyPoints}</Typography>
                          </Box>
                        )}
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
                                workflowStatus: f.workflowStatus || 'Planning',
                                technicalComplexity: f.technicalComplexity || 3,
                                dependencyRisk: f.dependencyRisk || 3,
                                unknowns: f.unknowns || 3,
                                businessValue: f.businessValue || 3,
                                effortRequired: f.effortRequired || 3,
                                requirementsClarity: f.requirementsClarity || 3,
                                storyPoints: f.storyPoints || 5,
                                dependencyCount: f.dependencyCount || 0,
                                frontendImpact: f.frontendImpact || 3,
                                backendImpact: f.backendImpact || 3,
                                databaseImpact: f.databaseImpact || 3,
                                estimatedBackendHours: f.estimatedBackendHours || 0,
                                estimatedFrontendHours: f.estimatedFrontendHours || 0,
                                estimatedQAHours: f.estimatedQAHours || 0
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
                          {shouldShowSubtaskButton(f) && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyzeForSubtasks(f);
                              }}
                              sx={{
                                color: 'text.secondary',
                                p: 0.25,
                                '&:hover': {
                                  bgcolor: isDark ? 'rgba(156, 39, 176, 0.15)' : 'rgba(243, 229, 245, 1)',
                                  color: '#7B1FA2'
                                }
                              }}
                            >
                              <Psychology sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
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
                        {f.storyPoints && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>Story Points:</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'primary.main', fontWeight: 700 }}>{f.storyPoints}</Typography>
                          </Box>
                        )}
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
                  handleDeleteFeature(selectedFeature?.id, selectedFeature?.name, selectedFeature?.category);
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

              {/* Time to Market Details */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                  Time to Market Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', border: 1, borderColor: '#3B82F6', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Story Points
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                      {selectedFeature.storyPoints || 5}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Dependencies
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedFeature.dependencyCount || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Frontend Impact
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: selectedFeature.frontendImpact >= 4 ? '#F59E0B' : 'text.primary' }}>
                      {selectedFeature.frontendImpact || 3}/5
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Backend Impact
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: selectedFeature.backendImpact >= 4 ? '#F59E0B' : 'text.primary' }}>
                      {selectedFeature.backendImpact || 3}/5
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      Database Impact
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: selectedFeature.databaseImpact >= 4 ? '#F59E0B' : 'text.primary' }}>
                      {selectedFeature.databaseImpact || 3}/5
                    </Typography>
                  </Box>

                  {(selectedFeature.estimatedBackendHours > 0 || selectedFeature.estimatedFrontendHours > 0 || selectedFeature.estimatedQAHours > 0) && (
                    <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '6px', gridColumn: 'span 2' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                        Estimated Hours
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Backend: {selectedFeature.estimatedBackendHours || 0}h | Frontend: {selectedFeature.estimatedFrontendHours || 0}h | QA: {selectedFeature.estimatedQAHours || 0}h
                      </Typography>
                    </Box>
                  )}
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
        <DialogTitle>
          {editingId ? 'Edit Feature' : 'Add New Feature'}
          {!editingId && (
            <Stepper activeStep={wizardStep - 1} sx={{ mt: 2 }}>
              <Step>
                <StepLabel>Basic Info</StepLabel>
              </Step>
              <Step>
                <StepLabel>Classification</StepLabel>
              </Step>
              <Step>
                <StepLabel>Estimation</StepLabel>
              </Step>
            </Stepper>
          )}
        </DialogTitle>
        <DialogContent>
          {/* For Editing: Show all fields in one page */}
          {editingId && (
            <>
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
              open={categoryDropdownOpen}
              onOpen={() => setCategoryDropdownOpen(true)}
              onClose={() => setCategoryDropdownOpen(false)}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Box component="span">
                      {cat}
                    </Box>
                    {categoryDropdownOpen && (
                      <Box
                        component="span"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteCategory(cat, e);
                        }}
                        sx={{ 
                          ml: 1,
                          px: 0.5,
                          py: 0.5,
                          fontSize: '12px',
                          color: 'text.secondary',
                          cursor: 'pointer',
                          borderRadius: '50%',
                          minWidth: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': { 
                            bgcolor: 'error.main',
                            color: 'white'
                          }
                        }}
                      >
                        ×
                      </Box>
                    )}
                  </Box>
                </MenuItem>
              ))}
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

            {/* Advanced TTM Estimation Fields */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Time to Market Estimation</Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Story Points</InputLabel>
              <Select
                value={form.storyPoints}
                label="Story Points"
                onChange={e => setForm(f => ({ ...f, storyPoints: e.target.value }))}
              >
                {storyPoints.map(sp => <MenuItem key={sp} value={sp}>{sp}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              label="Dependency Count"
              type="number"
              fullWidth
              value={form.dependencyCount}
              onChange={e => setForm(f => ({ ...f, dependencyCount: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
              helperText="Number of internal/external dependencies or blockers"
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Frontend Impact (1=Minimal, 5=Major Changes)</Typography>
              <Slider min={1} max={5} value={form.frontendImpact} onChange={(_, v) => setForm(f => ({ ...f, frontendImpact: v }))} valueLabelDisplay="auto" />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Backend Impact (1=Minimal, 5=Major Changes)</Typography>
              <Slider min={1} max={5} value={form.backendImpact} onChange={(_, v) => setForm(f => ({ ...f, backendImpact: v }))} valueLabelDisplay="auto" />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography>Database/Infrastructure Impact (1=Minimal, 5=Major Changes)</Typography>
              <Slider min={1} max={5} value={form.databaseImpact} onChange={(_, v) => setForm(f => ({ ...f, databaseImpact: v }))} valueLabelDisplay="auto" />
            </FormControl>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Estimated Hours (Optional)</Typography>

            <TextField
              label="Backend Hours"
              type="number"
              fullWidth
              value={form.estimatedBackendHours}
              onChange={e => setForm(f => ({ ...f, estimatedBackendHours: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Frontend Hours"
              type="number"
              fullWidth
              value={form.estimatedFrontendHours}
              onChange={e => setForm(f => ({ ...f, estimatedFrontendHours: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
            />

            <TextField
              label="QA Hours"
              type="number"
              fullWidth
              value={form.estimatedQAHours}
              onChange={e => setForm(f => ({ ...f, estimatedQAHours: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
            />
          </Box>
          </>
          )}

          {/* For Adding: Show wizard steps */}
          {!editingId && wizardStep === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Let's start with the basic information about your feature.
              </Typography>
              <TextField
                label="Feature Name"
                fullWidth
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                sx={{ mb: 2 }}
                helperText="Give your feature a clear, descriptive name"
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                sx={{ mb: 3 }}
                helperText="What does this feature do?"
              />

              <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>Quality Scoring</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Help us understand the complexity and value of this feature.
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Technical Complexity (1=Simple, 5=Very Complex)</Typography>
                <Slider min={1} max={5} value={form.technicalComplexity} onChange={(_, v) => setForm(f => ({ ...f, technicalComplexity: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Business Value (1=Low, 5=High)</Typography>
                <Slider min={1} max={5} value={form.businessValue} onChange={(_, v) => setForm(f => ({ ...f, businessValue: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Requirements Clarity (1=Vague, 5=Crystal Clear)</Typography>
                <Slider min={1} max={5} value={form.requirementsClarity} onChange={(_, v) => setForm(f => ({ ...f, requirementsClarity: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Dependency Risk (1=None, 5=Many)</Typography>
                <Slider min={1} max={5} value={form.dependencyRisk} onChange={(_, v) => setForm(f => ({ ...f, dependencyRisk: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Unknowns / Uncertainty (1=Clear, 5=Many Unknowns)</Typography>
                <Slider min={1} max={5} value={form.unknowns} onChange={(_, v) => setForm(f => ({ ...f, unknowns: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Effort Required (1=Small, 5=Very Large)</Typography>
                <Slider min={1} max={5} value={form.effortRequired} onChange={(_, v) => setForm(f => ({ ...f, effortRequired: v }))} valueLabelDisplay="auto" marks />
              </FormControl>
            </Box>
          )}

          {!editingId && wizardStep === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Help us categorize and prioritize this feature.
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={form.category}
                  label="Category *"
                  open={addCategoryDropdownOpen}
                  onOpen={() => setAddCategoryDropdownOpen(true)}
                  onClose={() => setAddCategoryDropdownOpen(false)}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box component="span">
                          {cat}
                        </Box>
                        {addCategoryDropdownOpen && (
                          <Box
                            component="span"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteCategory(cat, e);
                            }}
                            sx={{ 
                              ml: 1,
                              px: 0.5,
                              py: 0.5,
                              fontSize: '12px',
                              color: 'text.secondary',
                              cursor: 'pointer',
                              borderRadius: '50%',
                              minWidth: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': { 
                                bgcolor: 'error.main',
                                color: 'white'
                              }
                            }}
                          >
                            ×
                          </Box>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  label="Add New Category"
                  value={newCategoryInput}
                  onChange={e => setNewCategoryInput(e.target.value)}
                  placeholder="Enter category name"
                  sx={{ flex: 1 }}
                  size="small"
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
                <InputLabel>Priority (MoSCoW) *</InputLabel>
                <Select
                  value={form.moscow}
                  label="Priority (MoSCoW) *"
                  onChange={e => setForm(f => ({ ...f, moscow: e.target.value }))}
                >
                  {moscowOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>

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
                <InputLabel>T-Shirt Sizing</InputLabel>
                <Select
                  value={form.tshirtSize}
                  label="T-Shirt Sizing"
                  onChange={e => setForm(f => ({ ...f, tshirtSize: e.target.value }))}
                >
                  {tshirtSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
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
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Gap Type (Root Cause)</Typography>
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
              />
            </Box>
          )}

          {!editingId && wizardStep === 3 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Finally, help us estimate the time to market for this feature.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>Story Points & Impact</Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Story Points</InputLabel>
                <Select
                  value={form.storyPoints}
                  label="Story Points"
                  onChange={e => setForm(f => ({ ...f, storyPoints: e.target.value }))}
                >
                  {storyPoints.map(sp => <MenuItem key={sp} value={sp}>{sp}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                label="Dependency Count"
                type="number"
                fullWidth
                value={form.dependencyCount}
                onChange={e => setForm(f => ({ ...f, dependencyCount: parseInt(e.target.value) || 0 }))}
                sx={{ mb: 2 }}
                helperText="Number of blockers or dependencies"
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Frontend Impact (1=Minimal, 5=Major)</Typography>
                <Slider min={1} max={5} value={form.frontendImpact} onChange={(_, v) => setForm(f => ({ ...f, frontendImpact: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Backend Impact (1=Minimal, 5=Major)</Typography>
                <Slider min={1} max={5} value={form.backendImpact} onChange={(_, v) => setForm(f => ({ ...f, backendImpact: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Database Impact (1=Minimal, 5=Major)</Typography>
                <Slider min={1} max={5} value={form.databaseImpact} onChange={(_, v) => setForm(f => ({ ...f, databaseImpact: v }))} valueLabelDisplay="auto" marks />
              </FormControl>

              <Typography variant="h6" sx={{ mt: 3, mb: 2, fontSize: '1rem' }}>Detailed Hours (Optional)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                If you have detailed hour estimates, add them here for more precise TTM calculation.
              </Typography>

              <TextField
                label="Backend Hours"
                type="number"
                fullWidth
                value={form.estimatedBackendHours}
                onChange={e => setForm(f => ({ ...f, estimatedBackendHours: parseInt(e.target.value) || 0 }))}
                sx={{ mb: 2 }}
                size="small"
              />

              <TextField
                label="Frontend Hours"
                type="number"
                fullWidth
                value={form.estimatedFrontendHours}
                onChange={e => setForm(f => ({ ...f, estimatedFrontendHours: parseInt(e.target.value) || 0 }))}
                sx={{ mb: 2 }}
                size="small"
              />

              <TextField
                label="QA Hours"
                type="number"
                fullWidth
                value={form.estimatedQAHours}
                onChange={e => setForm(f => ({ ...f, estimatedQAHours: parseInt(e.target.value) || 0 }))}
                sx={{ mb: 2 }}
                size="small"
              />
            </Box>
          )}

        </DialogContent>
        <DialogActions>
          {/* Show wizard navigation for new features, simple buttons for editing */}
          {!editingId ? (
            <>
              <Button onClick={() => {
                setOpenDialog(false);
                setWizardStep(1);
                setForm({
                  name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: '', category: '', workflowStatus: 'Planning',
                  technicalComplexity: 3, dependencyRisk: 3, unknowns: 3, businessValue: 3, effortRequired: 3, requirementsClarity: 3,
                  storyPoints: 5, dependencyCount: 0, frontendImpact: 3, backendImpact: 3, databaseImpact: 3,
                  estimatedBackendHours: 0, estimatedFrontendHours: 0, estimatedQAHours: 0
                });
              }}>
                Cancel
              </Button>
              {wizardStep > 1 && (
                <Button onClick={handleWizardBack}>
                  Back
                </Button>
              )}
              {wizardStep < 3 ? (
                <Button
                  variant="contained"
                  onClick={handleWizardNext}
                  disabled={wizardStep === 1 ? !canProceedToStep2() : !canProceedToStep3()}
                >
                  Next
                </Button>
              ) : (
                <Button variant="contained" onClick={handleAddFeature} disabled={!form.name.trim()}>
                  Add Feature
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={() => {
                setOpenDialog(false);
                setEditingId(null);
                setForm({
                  name: '', desc: '', targetQuarter: '', moscow: '', goal: '', tshirtSize: '', state: '', gapTypes: [], dependencies: '', category: '', workflowStatus: 'Planning',
                  technicalComplexity: 3, dependencyRisk: 3, unknowns: 3, businessValue: 3, effortRequired: 3, requirementsClarity: 3,
                  storyPoints: 5, dependencyCount: 0, frontendImpact: 3, backendImpact: 3, databaseImpact: 3,
                  estimatedBackendHours: 0, estimatedFrontendHours: 0, estimatedQAHours: 0
                });
              }}>Cancel</Button>
              <Button variant="contained" onClick={handleAddFeature}>
                Save Changes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Subtask Analysis Dialog */}
      <SubtaskAnalysisDialog
        open={subtaskAnalysisOpen}
        onClose={() => {
          setSubtaskAnalysisOpen(false);
          setSelectedFeatureForAnalysis(null);
        }}
        feature={selectedFeatureForAnalysis}
        onSubtasksCreated={handleSubtasksCreated}
      />
    </Box>
  );
}
export default DashboardHome;
