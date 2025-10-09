import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const stats = {
    total: gaps.length,
    open: gaps.filter(g => g.status === 'Open').length,
    inProgress: gaps.filter(g => g.status === 'In Progress').length,
    resolved: gaps.filter(g => g.status === 'Resolved').length,
    high: gaps.filter(g => g.severity === 'High').length,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your product gaps
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#667eea',
            '&:hover': { bgcolor: '#5568d3' },
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Add New Gap
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Gaps
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#667eea', mb: 1 }}>
                {stats.total}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: '#43e97b' }} />
                <Typography variant="caption" sx={{ color: '#43e97b' }}>
                  +12% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Open
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f093fb', mb: 1 }}>
                {stats.open}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: '#f093fb' }} />
                <Typography variant="caption" sx={{ color: '#f093fb' }}>
                  Needs attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#4facfe', mb: 1 }}>
                {stats.inProgress}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Being worked on
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                High Priority
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#fa709a', mb: 1 }}>
                {stats.high}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#fa709a' }}>
                  Urgent attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Gaps */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Gaps
          </Typography>
          <Button size="small" sx={{ textTransform: 'none' }}>
            View All
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {gaps.slice(0, 5).map((gap) => (
            <Card key={gap.id} sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                      {gap.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip label={gap.severity} color={getSeverityColor(gap.severity)} size="small" />
                      <Chip label={gap.status} variant="outlined" size="small" />
                      <Chip label={gap.category} size="small" variant="outlined" />
                      {gap.assignee && (
                        <Chip label={gap.assignee} size="small" sx={{ bgcolor: '#f5f5f5' }} />
                      )}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {gap.createdAt}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      {/* Gap Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              By Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Open</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.open}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.open / stats.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#f093fb' }
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">In Progress</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.inProgress}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.inProgress / stats.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#4facfe' }
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Resolved</Typography>
                  <Typography variant="body2" fontWeight={600}>{stats.resolved}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.resolved / stats.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#43e97b' }
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              By Severity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">High</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {gaps.filter(g => g.severity === 'High').length}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(gaps.filter(g => g.severity === 'High').length / stats.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#fa709a' }
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Medium</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {gaps.filter(g => g.severity === 'Medium').length}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(gaps.filter(g => g.severity === 'Medium').length / stats.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#fee140' }
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Low</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {gaps.filter(g => g.severity === 'Low').length}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(gaps.filter(g => g.severity === 'Low').length / stats.total) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#43e97b' }
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Gap Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Add New Gap
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveGap}
            disabled={!formData.title.trim()}
            sx={{ bgcolor: '#667eea', '&:hover': { bgcolor: '#5568d3' } }}
          >
            Add Gap
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardHome;
