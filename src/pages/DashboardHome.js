import { useState } from 'react';
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

function DashboardHome() {
  const { mode } = useTheme();
  const [gaps, setGaps] = useState([
    { id: 1, title: 'Mobile App Offline Mode', severity: 'High', status: 'Open', category: 'Feature', assignee: 'Sarah Johnson', createdAt: '2024-01-15', description: 'Users need ability to access core features without internet connection' },
    { id: 2, title: 'API Documentation Updates', severity: 'Medium', status: 'In Progress', category: 'Documentation', assignee: 'Mike Chen', createdAt: '2024-01-14', description: 'API docs need examples and better descriptions' },
    { id: 3, title: 'User Onboarding Simplification', severity: 'High', status: 'Open', category: 'UX', assignee: 'Emily Davis', createdAt: '2024-01-13', description: 'Reduce steps in initial user setup flow' },
    { id: 4, title: 'Payment Gateway Integration', severity: 'High', status: 'In Progress', category: 'Feature', assignee: 'Alex Kumar', createdAt: '2024-01-12', description: 'Add Stripe payment processing' },
    { id: 5, title: 'Performance Monitoring Dashboard', severity: 'Medium', status: 'Open', category: 'Performance', assignee: 'Sarah Johnson', createdAt: '2024-01-10', description: 'Real-time performance metrics dashboard' },
    { id: 6, title: 'Dark Mode Support', severity: 'Low', status: 'Open', category: 'Feature', assignee: 'Mike Chen', createdAt: '2024-01-09', description: 'Add dark mode theme option' },
  ]);

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
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }]);
      handleCloseDialog();
    }
  };

  const stats = {
    total: gaps.length,
    open: gaps.filter(g => g.status === 'Open').length,
    inProgress: gaps.filter(g => g.status === 'In Progress').length,
    resolved: gaps.filter(g => g.status === 'Resolved').length,
    high: gaps.filter(g => g.severity === 'High').length,
    medium: gaps.filter(g => g.severity === 'Medium').length,
    low: gaps.filter(g => g.severity === 'Low').length,
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
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Stats Section - Top Row */}
        <Grid item xs={12} md={3}>
          <Box sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Gaps
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
                {stats.total}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 20, color: '#10B981' }} />
              <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
                +12% this month
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={4}>
              <Box sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                height: '100%'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Open</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#F59E0B' }}>{stats.open}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                height: '100%'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>In Progress</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#3B82F6' }}>{stats.inProgress}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                height: '100%'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Resolved</Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#10B981' }}>{stats.resolved}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* Priority Breakdown */}
        <Grid item xs={12} md={4}>
          <Box sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Priority Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                    <Typography variant="body2">High</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.high}</Typography>
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    <Typography variant="body2">Medium</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.medium}</Typography>
                </Box>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                    <Typography variant="body2">Low</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.low}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Box sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            height: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {gaps.slice(0, 3).map((gap) => (
                <Box key={gap.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                    {gap.assignee?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {gap.assignee}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {gap.status} • {gap.category}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Box sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ py: 1.5 }}
            >
              Create New Gap
            </Button>
          </Box>
        </Grid>

        {/* All Gaps List */}
        <Grid item xs={12}>
          <Box sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Gaps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {gaps.length} total
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {gaps.map((gap) => {
                const statusColors = getStatusColor(gap.status);
                return (
                  <Box
                    key={gap.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: mode === 'dark' ? '0 4px 12px rgba(99, 102, 241, 0.15)' : '0 4px 12px rgba(99, 102, 241, 0.1)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: getPriorityColor(gap.severity),
                          mt: 1,
                          flexShrink: 0
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {gap.title}
                          </Typography>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: statusColors.bg,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: statusColors.text, fontWeight: 600 }}>
                              {gap.status}
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {gap.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: getPriorityColor(gap.severity),
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {gap.severity}
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary">•</Typography>

                          <Typography variant="caption" color="text.secondary">
                            {gap.category}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">•</Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                              {gap.assignee?.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {gap.assignee}
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary">•</Typography>

                          <Typography variant="caption" color="text.secondary">
                            {gap.createdAt}
                          </Typography>
                        </Box>
                      </Box>

                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Grid>
      </Grid>

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
