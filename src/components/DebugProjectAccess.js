import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useProject } from '../ProjectContext';
import { Box, Typography, Paper, Button } from '@mui/material';

const DebugProjectAccess = () => {
  const { projects } = useProject();
  const [debugInfo, setDebugInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from Firebase Auth
    import('firebase/auth').then(({ getAuth }) => {
      const auth = getAuth();
      setUser(auth.currentUser);
      setLoading(false);
      
      if (auth.currentUser) {
        console.log('🔍 DebugProjectAccess: User loaded:', {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName
        });
      }
    });
  }, []);

  const runDebugCheck = async () => {
    if (!user) {
      console.log('❌ No user found for debug check');
      return;
    }

    try {
      console.log('🔍 Running debug check for user:', user.email);
      
      // Check all projects in database
      console.log('📋 Checking all projects...');
      const allProjectsSnapshot = await getDocs(collection(db, 'projects'));
      const allProjects = allProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        userId: doc.data().userId,
        ...doc.data()
      }));
      console.log(`📋 Found ${allProjects.length} total projects:`, allProjects);

      // Check all projectUsers documents
      console.log('👥 Checking all projectUsers...');
      const allProjectUsersSnapshot = await getDocs(collection(db, 'projectUsers'));
      const allProjectUsers = allProjectUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`👥 Found ${allProjectUsers.length} total projectUsers:`, allProjectUsers);

      // Check projectUsers for this specific user
      console.log(`🔍 Checking projectUsers for email: "${user.email}"`);
      const userProjectUsersQuery = query(
        collection(db, 'projectUsers'), 
        where('email', '==', user.email)
      );
      const userProjectUsersSnapshot = await getDocs(userProjectUsersQuery);
      const userProjectUsers = userProjectUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`🔍 Found ${userProjectUsers.length} invitations for ${user.email}:`, userProjectUsers);

      const info = {
        timestamp: new Date().toISOString(),
        currentUser: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        },
        database: {
          totalProjects: allProjects.length,
          totalProjectUsers: allProjectUsers.length,
          userInvitations: userProjectUsers.length
        },
        allProjects: allProjects,
        allProjectUsers: allProjectUsers,
        userProjectUsers: userProjectUsers,
        loadedProjectsFromHook: projects
      };

      setDebugInfo(info);
      console.log('🔍 Complete debug info:', info);
      
    } catch (error) {
      console.error('❌ Debug check error:', error);
      setDebugInfo({ error: error.message, stack: error.stack });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading debug tool...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
          <Typography color="error">❌ No user found - not authenticated</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Project Access Debug Tool
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          User: {user.email} (UID: {user.uid})
        </Typography>
        <Button variant="contained" onClick={runDebugCheck}>
          Run Debug Check
        </Button>
      </Paper>

      {debugInfo && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Debug Results:</Typography>
          <pre style={{ fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default DebugProjectAccess;
