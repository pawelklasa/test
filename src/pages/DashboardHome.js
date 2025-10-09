import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function DashboardHome() {
  const [gaps, setGaps] = useState([
    { id: 1, title: 'Mobile App Offline Mode', severity: 'High', status: 'Open', category: 'Feature', assignee: 'Sarah Johnson', createdAt: '2024-01-15' },
    { id: 2, title: 'API Documentation Updates', severity: 'Medium', status: 'In Progress', category: 'Documentation', assignee: 'Mike Chen', createdAt: '2024-01-14' },
    { id: 3, title: 'User Onboarding Simplification', severity: 'High', status: 'Open', category: 'UX', assignee: 'Emily Davis', createdAt: '2024-01-13' },
    { id: 4, title: 'Payment Gateway Integration', severity: 'High', status: 'In Progress', category: 'Feature', assignee: 'Alex Kumar', createdAt: '2024-01-12' },
    { id: 5, title: 'Performance Monitoring Dashboard', severity: 'Medium', status: 'Open', category: 'Performance', assignee: 'Sarah Johnson', createdAt: '2024-01-10' },
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
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
      case 'In Progress': return { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' };
      case 'Resolved': return { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' };
      default: return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
  };

  const getPriorityDot = (severity) => {
    switch (severity) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827', letterSpacing: '-0.02em' }}>
          Good morning 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280' }}>
          Here's what's happening with your product today
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F3F4F6',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
          }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2, fontWeight: 500 }}>
              Total Gaps
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              {stats.total}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                +12% from last month
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F3F4F6',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
          }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2, fontWeight: 500 }}>
              Open
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              {stats.open}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Awaiting action
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F3F4F6',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
          }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2, fontWeight: 500 }}>
              In Progress
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
              {stats.inProgress}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Being worked on
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F3F4F6',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
          }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2, fontWeight: 500 }}>
              High Priority
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#EF4444', mb: 1 }}>
              {stats.high}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Needs attention
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Recent Gaps Table */}
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 3,
        border: '1px solid #F3F4F6',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 3,
          borderBottom: '1px solid #F3F4F6'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            Recent Gaps
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              bgcolor: '#111827',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1F2937',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            Add Gap
          </Button>
        </Box>

        {/* Table Content */}
        <Box>
          {gaps.map((gap, index) => {
            const statusColors = getStatusColor(gap.status);
            return (
              <Box
                key={gap.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 3,
                  borderBottom: index < gaps.length - 1 ? '1px solid #F3F4F6' : 'none',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: '#FAFAFA'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                  {/* Priority Indicator */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getPriorityDot(gap.severity),
                      flexShrink: 0
                    }}
                  />

                  {/* Title & Category */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{
                      fontWeight: 600,
                      color: '#111827',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {gap.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      {gap.category}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 120 }}>
                    <Box sx={{
                      display: 'inline-flex',
                      px: 2,
                      py: 0.5,
                      borderRadius: 6,
                      bgcolor: statusColors.bg,
                      border: `1px solid ${statusColors.border}`
                    }}>
                      <Typography variant="caption" sx={{
                        color: statusColors.text,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}>
                        {gap.status}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Assignee */}
                  <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5, minWidth: 150 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#667eea', fontSize: '0.75rem' }}>
                      {gap.assignee?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                      {gap.assignee}
                    </Typography>
                  </Box>

                  {/* Date */}
                  <Typography variant="body2" sx={{ color: '#9CA3AF', minWidth: 100, display: { xs: 'none', sm: 'block' } }}>
                    {gap.createdAt}
                  </Typography>
                </Box>

                {/* Actions */}
                <IconButton size="small" sx={{ color: '#9CA3AF' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Box>

        {/* View All Footer */}
        <Box sx={{
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid #F3F4F6',
          bgcolor: '#FAFAFA'
        }}>
          <Button sx={{ textTransform: 'none', color: '#6B7280', fontWeight: 500 }}>
            View all gaps
          </Button>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F3F4F6',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
              Team Activity
            </Typography>
            <AvatarGroup max={4} sx={{ mb: 2, justifyContent: 'flex-start' }}>
              <Avatar sx={{ bgcolor: '#667eea' }}>SJ</Avatar>
              <Avatar sx={{ bgcolor: '#f093fb' }}>MC</Avatar>
              <Avatar sx={{ bgcolor: '#4facfe' }}>ED</Avatar>
              <Avatar sx={{ bgcolor: '#43e97b' }}>AK</Avatar>
            </AvatarGroup>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              4 team members active today
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F3F4F6',
            height: '100%'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                  {((stats.resolved / stats.total) * 100 || 0).toFixed(0)}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Completion Rate
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
                  2.3
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  Avg. Days to Close
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Add Gap Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Add New Gap
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Gap Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Mobile App Offline Mode"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the gap in detail..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={formData.severity}
                    label="Severity"
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
                    <MenuItem value="Closed">Closed</MenuItem>
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
                    <MenuItem value="Security">Security</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Assignee"
                  fullWidth
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveGap}
            disabled={!formData.title.trim()}
            sx={{
              bgcolor: '#111827',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1F2937', boxShadow: 'none' }
            }}
          >
            Add Gap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardHome;
