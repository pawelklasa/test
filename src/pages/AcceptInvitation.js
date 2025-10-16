import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useOrganization } from '../OrganizationContext';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadUserOrganizations } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  const token = searchParams.get('token');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && token) {
        loadInvitation();
      } else if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      // Check in userOrganizations collection (where invitations are actually stored)
      const invitationDoc = await getDoc(doc(db, 'userOrganizations', token));
      
      if (!invitationDoc.exists()) {
        setError('Invitation not found or has expired');
        setLoading(false);
        return;
      }

      const invitationData = invitationDoc.data();
      
      if (invitationData.status !== 'invited') {
        setError('This invitation has already been used or is no longer valid');
        setLoading(false);
        return;
      }

      setInvitation(invitationData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation) return;

    try {
      setLoading(true);

      // Update the existing invitation record to mark as accepted, preserving the role
      await updateDoc(doc(db, 'userOrganizations', token), {
        userId: user.uid, // Update with actual user ID
        role: invitation.role, // Preserve the role from the invitation
        status: 'active',
        joinedAt: new Date(),
        acceptedBy: user.uid
      });

      setSuccess(`Successfully joined ${invitation.organizationName || 'the organization'}!`);
      
      // Reload user organizations
      await loadUserOrganizations();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Sign In Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please sign in to accept this invitation.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              size="large"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1">
              Loading invitation...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Redirecting to dashboard...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            Organization Invitation
          </Typography>
          
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {invitation.organizationName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You've been invited to join this organization as a <strong>{invitation.role}</strong>
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Your email:</strong> {user.email}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> {invitation.role}
            </Typography>
            <Typography variant="body2">
              <strong>Organization:</strong> {invitation.organizationName}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              onClick={acceptInvitation}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={20} /> : 'Accept Invitation'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AcceptInvitation;
