import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useOrganization } from '../OrganizationContext';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendInvitationEmail } from '../utils/emailService';

const OrganizationUserManagement = () => {
  const { currentOrganization, hasPermission } = useOrganization();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const roles = [
    { value: 'owner', label: 'Owner', icon: <AdminIcon />, description: 'Full access to everything' },
    { value: 'admin', label: 'Admin', icon: <EditIcon />, description: 'Manage users and projects' },
    { value: 'member', label: 'Member', icon: <PersonIcon />, description: 'Create and edit projects' },
    { value: 'viewer', label: 'Viewer', icon: <ViewIcon />, description: 'Read-only access' }
  ];

  const getRoleInfo = (role) => roles.find(r => r.value === role) || roles[2];

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'error';
      case 'admin': return 'warning';
      case 'member': return 'primary';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadMembers();
    }
  }, [currentOrganization]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Load organization members
      const membersQuery = query(
        collection(db, 'userOrganizations'),
        where('organizationId', '==', currentOrganization.id)
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      const membersList = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps
        joinedAt: doc.data().joinedAt?.toDate ? doc.data().joinedAt.toDate() : new Date()
      }));

      setMembers(membersList);
    } catch (error) {
      console.error('Error loading members:', error);
      setError('Failed to load organization members');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation before proceeding
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!hasPermission('manageUsers')) {
      setError('You do not have permission to invite users');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      // Clean the email address
      const cleanedEmail = inviteEmail.trim().toLowerCase();
      
      // Create a pending invitation
      const invitationId = `${cleanedEmail}_${currentOrganization.id}`;
      
      await setDoc(doc(db, 'userOrganizations', invitationId), {
        userId: cleanedEmail, // We'll update this when user signs up
        organizationId: currentOrganization.id,
        role: inviteRole,
        status: 'invited',
        invitedBy: user.uid,
        invitedAt: new Date(),
        joinedAt: null
      });

      // Send actual email invitation
      const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationId}`;
      
      try {
        const emailResult = await sendInvitationEmail(cleanedEmail, {
          organizationName: currentOrganization.name,
          invitedByName: user.displayName || user.email,
          invitationLink,
          role: inviteRole
        });
        
        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult.error);
          setError(`Failed to send invitation email: ${emailResult.error}`);
          return;
        }
        
        console.log('📧 Invitation email sent successfully to:', cleanedEmail);
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        setError(`Failed to send invitation email: ${emailError.message}`);
        return;
      }
      
      setSuccess(`Invitation sent to ${cleanedEmail} as ${getRoleInfo(inviteRole).label}`);
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      loadMembers();
      
    } catch (error) {
      console.error('Error inviting user:', error);
      setError('Failed to send invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRole) return;

    if (!hasPermission('manageUsers')) {
      setError('You do not have permission to update user roles');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'userOrganizations', selectedMember.id), {
        role: newRole,
        updatedAt: new Date(),
        updatedBy: user.uid
      });

      setSuccess(`Updated ${selectedMember.userEmail} role to ${getRoleInfo(newRole).label}`);
      setEditDialogOpen(false);
      setSelectedMember(null);
      setNewRole('');
      loadMembers();
      
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUser = async (member) => {
    if (!hasPermission('manageUsers')) {
      setError('You do not have permission to remove users');
      return;
    }

    if (member.role === 'owner') {
      setError('Cannot remove organization owner');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${member.userEmail} from the organization?`)) {
      setActionLoading(true);
      try {
        await deleteDoc(doc(db, 'userOrganizations', member.id));
        setSuccess(`Removed ${member.userEmail} from organization`);
        loadMembers();
      } catch (error) {
        console.error('Error removing user:', error);
        setError('Failed to remove user');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const openEditDialog = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  if (!currentOrganization) {
    return (
      <Alert severity="warning">
        No organization selected. Please select an organization to manage users.
      </Alert>
    );
  }

  if (!hasPermission('viewUsers')) {
    return (
      <Alert severity="error">
        You do not have permission to view organization users.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Organization Users
        </Typography>
        {hasPermission('manageUsers') && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteDialogOpen(true)}
          >
            Invite User
          </Button>
        )}
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Manage users and their roles in <strong>{currentOrganization.name}</strong>
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

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    {hasPermission('manageUsers') && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon color="action" />
                          <Typography>{member.userEmail}</Typography>
                          {member.userId === user.uid && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getRoleInfo(member.role).icon}
                          label={getRoleInfo(member.role).label}
                          color={getRoleColor(member.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.status === 'active' ? 'Active' : 'Invited'}
                          color={member.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {member.joinedAt ? member.joinedAt.toLocaleDateString() : 'Pending'}
                      </TableCell>
                      {hasPermission('manageUsers') && (
                        <TableCell align="right">
                          {member.role !== 'owner' && (
                            <IconButton
                              onClick={(e) => setMenuAnchor(e.currentTarget)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                          <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={() => setMenuAnchor(null)}
                          >
                            <MenuItem onClick={() => openEditDialog(member)}>
                              <ListItemIcon><EditIcon /></ListItemIcon>
                              <ListItemText>Change Role</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleRemoveUser(member)}>
                              <ListItemIcon><DeleteIcon /></ListItemIcon>
                              <ListItemText>Remove User</ListItemText>
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">
                          No users found in this organization
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              fullWidth
              placeholder="user@example.com"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                label="Role"
              >
                {roles.filter(role => role.value !== 'owner').map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {role.icon}
                      <Box>
                        <Typography>{role.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleInviteUser}
            variant="contained"
            disabled={actionLoading || !inviteEmail || !inviteRole}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box display="flex" flexDirection="column" gap={2} pt={1}>
              <Typography>
                Update role for: <strong>{selectedMember.userEmail}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>New Role</InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="New Role"
                >
                  {roles.filter(role => role.value !== 'owner').map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {role.icon}
                        <Box>
                          <Typography>{role.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            disabled={actionLoading || !newRole}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationUserManagement;
