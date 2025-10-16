import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Paper
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useOrganization } from '../OrganizationContext';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const OrganizationSettings = () => {
  const { currentOrganization, hasPermission, loadUserOrganizations } = useOrganization();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalProjects: 0,
    totalFeatures: 0,
    storageUsed: 0
  });

  useEffect(() => {
    if (currentOrganization) {
      setOrganizationName(currentOrganization.name || '');
      setOrganizationDescription(currentOrganization.description || '');
      loadOrganizationStats();
    }
  }, [currentOrganization]);

  const loadOrganizationStats = async () => {
    if (!currentOrganization) return;

    try {
      // Load members count
      const membersQuery = query(
        collection(db, 'userOrganizations'),
        where('organizationId', '==', currentOrganization.id),
        where('status', '==', 'active')
      );
      const membersSnapshot = await getDocs(membersQuery);

      // Load projects count
      const projectsSnapshot = await getDocs(
        collection(db, 'organizations', currentOrganization.id, 'projects')
      );

      // Load features count across all projects
      let totalFeatures = 0;
      for (const projectDoc of projectsSnapshot.docs) {
        const featuresSnapshot = await getDocs(
          collection(db, 'organizations', currentOrganization.id, 'projects', projectDoc.id, 'features')
        );
        totalFeatures += featuresSnapshot.size;
      }

      setStats({
        totalMembers: membersSnapshot.size,
        totalProjects: projectsSnapshot.size,
        totalFeatures: totalFeatures,
        storageUsed: Math.round((totalFeatures * 2.5 + projectsSnapshot.size * 1.2) * 100) / 100 // Estimated MB
      });

    } catch (error) {
      console.error('Error loading organization stats:', error);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!hasPermission('manageOrganization')) {
      setError('You do not have permission to update organization settings');
      return;
    }

    if (!organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'organizations', currentOrganization.id), {
        name: organizationName.trim(),
        description: organizationDescription.trim(),
        updatedAt: new Date(),
        updatedBy: user.uid
      });

      // Reload organization data
      await loadUserOrganizations();
      
      setSuccess('Organization settings updated successfully');
    } catch (error) {
      console.error('Error updating organization:', error);
      setError('Failed to update organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    // This would be a complex operation that requires careful handling
    // For now, just show a warning
    setError('Organization deletion is not yet implemented. Please contact support.');
    setDeleteDialogOpen(false);
  };

  if (!currentOrganization) {
    return (
      <Alert severity="warning">
        No organization selected. Please select an organization to manage settings.
      </Alert>
    );
  }

  if (!hasPermission('viewOrganization')) {
    return (
      <Alert severity="error">
        You do not have permission to view organization settings.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Organization Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Manage settings and information for <strong>{currentOrganization.name}</strong>
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Organization Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Organization Information
              </Typography>
              
              <Box component="form" noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      disabled={!hasPermission('manageOrganization')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={organizationDescription}
                      onChange={(e) => setOrganizationDescription(e.target.value)}
                      disabled={!hasPermission('manageOrganization')}
                      multiline
                      rows={3}
                      placeholder="Describe your organization..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Organization ID:</strong> {currentOrganization.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {currentOrganization.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>

                {hasPermission('manageOrganization') && (
                  <Box mt={3}>
                    <Button
                      variant="contained"
                      onClick={handleUpdateOrganization}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Updating...' : 'Update Organization'}
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Organization Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Usage Statistics
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Team Members" 
                    secondary={`${stats.totalMembers} active members`}
                  />
                  <ListItemSecondaryAction>
                    <Chip icon={<PeopleIcon />} label={stats.totalMembers} color="primary" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Projects" 
                    secondary={`${stats.totalProjects} total projects`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={stats.totalProjects} color="secondary" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Features" 
                    secondary={`${stats.totalFeatures} features across all projects`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={stats.totalFeatures} color="success" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Storage Used" 
                    secondary={`~${stats.storageUsed} MB estimated`}
                  />
                  <ListItemSecondaryAction>
                    <Chip icon={<StorageIcon />} label={`${stats.storageUsed} MB`} />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Billing Information Placeholder */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Billing & Subscription
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>Current Plan:</strong> Free Trial
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Billing integration coming soon! You'll be able to manage subscriptions, view usage, and upgrade plans.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        {hasPermission('manageOrganization') && currentOrganization.ownerId === user.uid && (
          <Grid item xs={12}>
            <Card sx={{ border: 1, borderColor: 'error.main' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Danger Zone
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  These actions are irreversible. Please proceed with caution.
                </Typography>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Organization
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Delete Organization Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error">Delete Organization</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">This action cannot be undone!</Typography>
          </Alert>
          <Typography paragraph>
            Deleting this organization will permanently remove:
          </Typography>
          <ul>
            <li>All projects and features ({stats.totalProjects} projects, {stats.totalFeatures} features)</li>
            <li>All team members and their access ({stats.totalMembers} members)</li>
            <li>All organization data and settings</li>
            <li>Billing and subscription information</li>
          </ul>
          <Typography variant="body2" color="text.secondary">
            This feature is not yet implemented for safety reasons. Please contact support if you need to delete an organization.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteOrganization} 
            color="error" 
            variant="contained"
            disabled
          >
            Delete Organization
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationSettings;
