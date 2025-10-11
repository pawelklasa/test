import React, { useState, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
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
import { useTheme } from '../ThemeContext';
import { useProject } from '../ProjectContext';
import { useFeatures } from '../hooks/useFeatures';

function DashboardHome() {
  // Dialog state for Add Feature
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    status: 'Open',
    category: 'Feature',
    assignee: '',
  });

  const { mode } = useTheme();
  const { selectedProject } = useProject();
  const { features, loading, error, addFeature } = useFeatures(selectedProject);

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
        return { bg: '#FDE68A', text: '#F59E0B' };
      case 'In Progress':
        return { bg: '#DBEAFE', text: '#3B82F6' };
      case 'Resolved':
        return { bg: '#A7F3D0', text: '#10B981' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
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

  // Dashboard stats
  const stats = useMemo(() => {
    const filtered = features;
    return {
      total: filtered.length,
      open: filtered.filter(f => f.status === 'Open').length,
      inProgress: filtered.filter(f => f.status === 'In Progress').length,
      resolved: filtered.filter(f => f.status === 'Resolved').length,
      high: filtered.filter(f => f.severity === 'High').length,
    };
  }, [features]);

  // Filter gaps by selected project

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
          <Box key={feature.id} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: getStatusColor(feature.status).bg, border: `1px solid ${getPriorityColor(feature.severity)}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: getStatusColor(feature.status).text }}>{feature.title}</Typography>
            <Typography variant="caption" color="text.secondary">{feature.description}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: getPriorityColor(feature.severity), width: 24, height: 24, fontSize: 14 }}>{feature.severity.charAt(0)}</Avatar>
                <Typography variant="caption" sx={{ fontWeight: 600, color: getPriorityColor(feature.severity) }}>{feature.severity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoreVertIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{feature.createdAt ? new Date(feature.createdAt.seconds ? feature.createdAt.seconds * 1000 : feature.createdAt).toLocaleDateString() : ''}</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      {/* Add Feature Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Add Feature
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the feature"
              autoFocus
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about this feature..."
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.severity}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="Feature">Feature</MenuItem>
                    <MenuItem value="Bug">Bug</MenuItem>
                    <MenuItem value="UX">UX</MenuItem>
                    <MenuItem value="Performance">Performance</MenuItem>
                    <MenuItem value="Documentation">Documentation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Assignee"
                  fullWidth
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Who's responsible?"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveFeature}
                disabled={!formData.title.trim()}
              >
                Add Feature
              </Button>
            </DialogActions>
      </Dialog>
  </Box>
  );
  }
  export default DashboardHome;
