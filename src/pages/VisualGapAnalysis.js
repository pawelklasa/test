import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';

function VisualGapAnalysis() {
  const [gaps, setGaps] = useState([
    { id: 1, title: 'Mobile App Feature', description: 'Need to add offline mode for mobile users', severity: 'High', status: 'Open', category: 'Feature', assignee: 'Sarah Johnson' },
    { id: 2, title: 'API Documentation', description: 'API endpoints need better documentation with examples', severity: 'Medium', status: 'In Progress', category: 'Documentation', assignee: 'Mike Chen' },
    { id: 3, title: 'User Onboarding Flow', description: 'Simplify the initial user setup process', severity: 'High', status: 'Open', category: 'UX', assignee: 'Emily Davis' }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingGap, setEditingGap] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    status: 'Open',
    category: 'Feature',
    assignee: ''
  });

  const handleOpenDialog = (gap = null) => {
    if (gap) {
      setEditingGap(gap);
      setFormData({
        title: gap.title,
        description: gap.description || '',
        severity: gap.severity,
        status: gap.status,
        category: gap.category || 'Feature',
        assignee: gap.assignee || ''
      });
    } else {
      setEditingGap(null);
      setFormData({
        title: '',
        description: '',
        severity: 'Medium',
        status: 'Open',
        category: 'Feature',
        assignee: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGap(null);
    setFormData({
      title: '',
      description: '',
      severity: 'Medium',
      status: 'Open',
      category: 'Feature',
      assignee: ''
    });
  };

  const handleSaveGap = () => {
    if (formData.title.trim()) {
      if (editingGap) {
        // Update existing gap
        setGaps(gaps.map(gap =>
          gap.id === editingGap.id
            ? { ...gap, ...formData }
            : gap
        ));
      } else {
        // Add new gap
        setGaps([...gaps, {
          id: Date.now(),
          ...formData
        }]);
      }
      handleCloseDialog();
    }
  };

  const handleDeleteGap = (id) => {
    setGaps(gaps.filter(gap => gap.id !== id));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'default';
      case 'In Progress': return 'primary';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            Visual Gap Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Identify and visualize product gaps with intuitive tools
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
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

      {/* Gap Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {gaps.length}
              </Typography>
              <Typography variant="body2">Total Gaps</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f093fb', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {gaps.filter(g => g.severity === 'High').length}
              </Typography>
              <Typography variant="body2">High Priority</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#43e97b', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {gaps.filter(g => g.status === 'In Progress').length}
              </Typography>
              <Typography variant="body2">In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4facfe', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {gaps.filter(g => g.status === 'Resolved').length}
              </Typography>
              <Typography variant="body2">Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gaps List */}
      <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Identified Gaps ({gaps.length})
        </Typography>
        <Box sx={{ mt: 3 }}>
          {gaps.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No gaps identified yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Add Your First Gap
              </Button>
            </Box>
          ) : (
            gaps.map((gap) => (
              <Card key={gap.id} sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
                        {gap.title}
                      </Typography>
                      {gap.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {gap.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip label={gap.severity} color={getSeverityColor(gap.severity)} size="small" />
                        <Chip label={gap.status} color={getStatusColor(gap.status)} variant="outlined" size="small" />
                        <Chip label={gap.category} size="small" variant="outlined" />
                        {gap.assignee && (
                          <Chip
                            label={gap.assignee}
                            size="small"
                            sx={{ bgcolor: '#f5f5f5' }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => handleOpenDialog(gap)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteGap(gap.id)} color="error" size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Paper>

      {/* Add/Edit Gap Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingGap ? 'Edit Gap' : 'Add New Gap'}
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
            {editingGap ? 'Update Gap' : 'Add Gap'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VisualGapAnalysis;
