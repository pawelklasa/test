import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Business as BusinessIcon,
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
    <Box sx={{ p: 3 }}>
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

      {/* Stats Cards */}
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
            Team Members
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {stats.totalMembers}
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
            Projects
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            {stats.totalProjects}
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
            Features
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
            {stats.totalFeatures}
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
            Storage Used
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
            {stats.storageUsed} MB
          </Typography>
        </Box>
      </Box>

      {/* Organization Information */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BusinessIcon />
          Organization Information
        </Typography>

        <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            disabled={!hasPermission('manageOrganization')}
            required
          />

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

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            <strong>Organization ID:</strong> {currentOrganization.id}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            <strong>Created:</strong> {currentOrganization.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
          </Typography>

          {hasPermission('manageOrganization') && (
            <Box mt={1}>
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
      </Box>

      {/* Billing Information */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
          Billing & Subscription
        </Typography>

        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
          <strong>Current Plan:</strong> Free Trial
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.85rem' }}>
          Billing integration coming soon! You'll be able to manage subscriptions, view usage, and upgrade plans.
        </Typography>
      </Box>

      {/* Danger Zone */}
      {hasPermission('manageOrganization') && currentOrganization.ownerId === user.uid && (
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 2,
          borderColor: 'error.main',
          borderRadius: '4px'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'error.main', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningIcon />
            Danger Zone
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
            These actions are irreversible. Please proceed with caution.
          </Typography>

          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            size="small"
          >
            Delete Organization
          </Button>
        </Box>
      )}

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
