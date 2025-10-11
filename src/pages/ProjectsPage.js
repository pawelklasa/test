import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import { useTheme } from '../ThemeContext';
import { useProject } from '../ProjectContext';

function ProjectsPage() {
  const { mode } = useTheme();
  const { projects, loading, addProject, deleteProject } = useProject();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProjectForMenu, setSelectedProjectForMenu] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    color: '#6366F1'
  });

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      color: '#6366F1'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveProject = async () => {
    console.log('handleSaveProject called');
    console.log('Form data:', formData);
    console.log('addProject function:', typeof addProject);

    if (formData.name.trim()) {
      console.log('Creating project...');
      const result = await addProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        color: formData.color,
        gaps: 0
      });

      console.log('Result:', result);

      if (result.success) {
        console.log('Project created successfully:', result.id);
        handleCloseDialog();
      } else {
        console.error('Failed to create project:', result.error);
        alert('Failed to create project: ' + result.error);
      }
    } else {
      console.log('Project name is empty');
    }
  };

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProjectForMenu(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProjectForMenu(null);
  };

  const handleDeleteProject = async () => {
    if (selectedProjectForMenu) {
      await deleteProject(selectedProjectForMenu.id);
      handleMenuClose();
    }
  };

  const getStatusColor = (status) => {
    if (mode === 'dark') {
      switch (status) {
        case 'Active': return { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ADE80' };
        case 'Planning': return { bg: 'rgba(251, 191, 36, 0.1)', text: '#FCD34D' };
        case 'On Hold': return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94A3B8' };
        default: return { bg: 'rgba(96, 165, 250, 0.1)', text: '#60A5FA' };
      }
    } else {
      switch (status) {
        case 'Active': return { bg: '#D1FAE5', text: '#065F46' };
        case 'Planning': return { bg: '#FEF3C7', text: '#92400E' };
        case 'On Hold': return { bg: '#F3F4F6', text: '#374151' };
        default: return { bg: '#DBEAFE', text: '#1E40AF' };
      }
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', px: 3, py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ fontWeight: 600 }}
        >
          New Project
        </Button>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first project to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create Project
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
        {projects.map((project) => {
          const statusColors = getStatusColor(project.status);
          return (
            <Grid item xs={12} sm={6} lg={4} key={project.id}>
                <Card
                  sx={{
                    minWidth: 300,
                    maxWidth: 300,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: mode === 'dark' ? '0 8px 16px rgba(99, 102, 241, 0.15)' : '0 8px 16px rgba(99, 102, 241, 0.1)',
                    }
                  }}
                >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${project.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: project.color,
                      }}
                    >
                      <FolderIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, project)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        bgcolor: statusColors.bg,
                        color: statusColors.text,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Chip
                      label={`${project.gaps} gaps`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {project.createdAt ?
                      `Created: ${new Date(project.createdAt.seconds * 1000).toLocaleDateString()}`
                      : 'Recently created'}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" fullWidth variant="outlined">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        </Grid>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Create New Project
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Project Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              autoFocus
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project..."
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Project Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                  <Box
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: 'pointer',
                      border: formData.color === color ? '3px solid' : '2px solid transparent',
                      borderColor: formData.color === color ? 'text.primary' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProject}
            disabled={!formData.name.trim()}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteProject} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Project
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default ProjectsPage;
