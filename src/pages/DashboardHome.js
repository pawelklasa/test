import { useState, useMemo } from 'react';
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

function DashboardHome() {
  const { mode } = useTheme();
  const { selectedProject } = useProject();
  const [gaps, setGaps] = useState([
    { id: 1, projectId: '1', title: 'Mobile App Offline Mode', severity: 'High', status: 'Open', category: 'Feature', assignee: 'Sarah Johnson', createdAt: '2024-01-15', description: 'Users need ability to access core features without internet connection' },
    { id: 2, projectId: '1', title: 'API Documentation Updates', severity: 'Medium', status: 'In Progress', category: 'Documentation', assignee: 'Mike Chen', createdAt: '2024-01-14', description: 'API docs need examples and better descriptions' },
    { id: 3, projectId: '1', title: 'User Onboarding Simplification', severity: 'High', status: 'Open', category: 'UX', assignee: 'Emily Davis', createdAt: '2024-01-13', description: 'Reduce steps in initial user setup flow' },
    { id: 4, projectId: '1', title: 'Payment Gateway Integration', severity: 'High', status: 'In Progress', category: 'Feature', assignee: 'Alex Kumar', createdAt: '2024-01-12', description: 'Add Stripe payment processing' },
    { id: 5, projectId: '1', title: 'Performance Monitoring Dashboard', severity: 'Medium', status: 'Open', category: 'Performance', assignee: 'Sarah Johnson', createdAt: '2024-01-10', description: 'Real-time performance metrics dashboard' },
    { id: 6, projectId: '1', title: 'Dark Mode Support', severity: 'Low', status: 'Open', category: 'Feature', assignee: 'Mike Chen', createdAt: '2024-01-09', description: 'Add dark mode theme option' },
    { id: 7, projectId: '2', title: 'Push Notification Support', severity: 'High', status: 'Open', category: 'Feature', assignee: 'John Smith', createdAt: '2024-01-15', description: 'Implement push notifications for mobile app' },
    { id: 8, projectId: '2', title: 'App Store Optimization', severity: 'Medium', status: 'In Progress', category: 'Marketing', assignee: 'Lisa Wong', createdAt: '2024-01-14', description: 'Improve app store listing and screenshots' },
    { id: 9, projectId: '3', title: 'Rate Limiting Implementation', severity: 'High', status: 'Open', category: 'Security', assignee: 'David Lee', createdAt: '2024-01-13', description: 'Add rate limiting to prevent API abuse' },
    { id: 10, projectId: '3', title: 'API Performance Optimization', severity: 'Medium', status: 'In Progress', category: 'Performance', assignee: 'Maria Garcia', createdAt: '2024-01-12', description: 'Optimize slow API endpoints' },
  ]);

  // Filter gaps by selected project
  const filteredGaps = useMemo(() => {
    return gaps.filter(gap => gap.projectId === selectedProject);
  }, [gaps, selectedProject]);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    status: 'Open',
    category: 'Feature',
    assignee: ''
  });

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'Medium',
      status: 'Open',
      category: 'Feature',
      assignee: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveGap = () => {
    if (formData.title.trim()) {
      setGaps([...gaps, {
        id: Date.now(),
        projectId: selectedProject,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }]);
      handleCloseDialog();
    }
  };

  const stats = {
    total: filteredGaps.length,
    open: filteredGaps.filter(g => g.status === 'Open').length,
    inProgress: filteredGaps.filter(g => g.status === 'In Progress').length,
    resolved: filteredGaps.filter(g => g.status === 'Resolved').length,
    high: filteredGaps.filter(g => g.severity === 'High').length,
    medium: filteredGaps.filter(g => g.severity === 'Medium').length,
    low: filteredGaps.filter(g => g.severity === 'Low').length,
  };

  const getPriorityColor = (severity) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    if (mode === 'dark') {
      switch (status) {
        case 'Open': return { bg: 'rgba(251, 191, 36, 0.1)', text: '#FCD34D' };
        case 'In Progress': return { bg: 'rgba(96, 165, 250, 0.1)', text: '#60A5FA' };
        case 'Resolved': return { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ADE80' };
        default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94A3B8' };
      }
    } else {
      switch (status) {
        case 'Open': return { bg: '#FEF3C7', text: '#92400E' };
        case 'In Progress': return { bg: '#DBEAFE', text: '#1E40AF' };
        case 'Resolved': return { bg: '#D1FAE5', text: '#065F46' };
        default: return { bg: '#F3F4F6', text: '#374151' };
      }
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', px: 3, py: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        {/* Stats Section - Top Row */}
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
          <Typography variant="caption" color="text.secondary">
            Total Gaps
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
            {stats.total}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981' }} />
            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
              +12%
            </Typography>
          </Box>
        </Box>

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
            New Gap
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* High Priority Gaps */}
        <Box sx={{
          flex: { xs: '1 1 100%', lg: '1' },
          minWidth: { xs: '100%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              High Priority
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#EF4444' }} />
              <Typography variant="caption" color="text.secondary">
                {stats.high}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflow: 'auto' }}>
            {filteredGaps.filter(g => g.severity === 'High').map((gap) => {
              const statusColors = getStatusColor(gap.status);
              return (
                <Box
                  key={gap.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: mode === 'dark' ? '0 2px 8px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: '#EF4444',
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gap.title}
                        </Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.75,
                            bgcolor: statusColors.bg,
                            flexShrink: 0
                          }}
                        >
                          <Typography variant="caption" sx={{ color: statusColors.text, fontWeight: 600, fontSize: '0.65rem' }}>
                            {gap.status}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {gap.assignee} • {gap.category}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* In Progress Gaps */}
        <Box sx={{
          flex: { xs: '1 1 100%', lg: '1' },
          minWidth: { xs: '100%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              In Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6' }} />
              <Typography variant="caption" color="text.secondary">
                {stats.inProgress}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflow: 'auto' }}>
            {filteredGaps.filter(g => g.status === 'In Progress').map((gap) => {
              const statusColors = getStatusColor(gap.status);
              return (
                <Box
                  key={gap.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: mode === 'dark' ? '0 2px 8px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: getPriorityColor(gap.severity),
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gap.title}
                        </Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.75,
                            bgcolor: statusColors.bg,
                            flexShrink: 0
                          }}
                        >
                          <Typography variant="caption" sx={{ color: statusColors.text, fontWeight: 600, fontSize: '0.65rem' }}>
                            {gap.status}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {gap.assignee} • {gap.category}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Open Gaps */}
        <Box sx={{
          flex: { xs: '1 1 100%', lg: '1' },
          minWidth: { xs: '100%', lg: 0 },
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Open
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F59E0B' }} />
              <Typography variant="caption" color="text.secondary">
                {stats.open}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflow: 'auto' }}>
            {filteredGaps.filter(g => g.status === 'Open').map((gap) => {
              const statusColors = getStatusColor(gap.status);
              return (
                <Box
                  key={gap.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: mode === 'dark' ? '0 2px 8px rgba(99, 102, 241, 0.15)' : '0 2px 8px rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: getPriorityColor(gap.severity),
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {gap.title}
                        </Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 0.75,
                            bgcolor: statusColors.bg,
                            flexShrink: 0
                          }}
                        >
                          <Typography variant="caption" sx={{ color: statusColors.text, fontWeight: 600, fontSize: '0.65rem' }}>
                            {gap.status}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {gap.assignee} • {gap.category}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Add Gap Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Create New Gap
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the gap"
              autoFocus
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about this gap..."
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
            onClick={handleSaveGap}
            disabled={!formData.title.trim()}
          >
            Create Gap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardHome;
