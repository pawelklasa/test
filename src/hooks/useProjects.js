import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export function useProjects(user) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      console.log('❌ No user found, setting empty projects');
      setProjects([]);
      setLoading(false);
      return;
    }

    console.log('🔍 useProjects: Starting project load for user:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    const loadAllUserProjects = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading projects for user:', user);
        const allProjects = new Map(); // Use Map to avoid duplicates

        // 1. Load projects owned by the user
        console.log('📋 Step 1: Loading owned projects...');
        console.log(`📋 Searching for userId: "${user.uid}"`);
        const ownedProjectsRef = collection(db, 'projects');
        const ownedQuery = query(ownedProjectsRef, where('userId', '==', user.uid));
        const ownedSnapshot = await getDocs(ownedQuery);
        
        console.log(`📋 Found ${ownedSnapshot.docs.length} owned projects`);
        ownedSnapshot.docs.forEach((doc, index) => {
          const projectData = {
            id: doc.id,
            ...doc.data(),
            userRole: 'Owner' // Mark as owner
          };
          console.log(`📋 Owned project ${index + 1}:`, {
            id: projectData.id,
            name: projectData.name,
            userId: projectData.userId
          });
          allProjects.set(doc.id, projectData);
        });

        // 2. Load projects where user is invited as team member
        console.log('👥 Step 2: Loading invited projects...');
        console.log(`👥 Searching for email: "${user.email}"`);
        const projectUsersRef = collection(db, 'projectUsers');
        const invitedQuery = query(projectUsersRef, where('email', '==', user.email));
        const invitedSnapshot = await getDocs(invitedQuery);
        
        console.log(`👥 Found ${invitedSnapshot.docs.length} project invitations for ${user.email}`);
        
        // Log all invitations found
        invitedSnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`👥 Invitation ${index + 1}:`, {
            id: doc.id,
            email: data.email,
            projectId: data.projectId,
            role: data.role,
            status: data.status,
            invitedAt: data.invitedAt
          });
        });

        // 3. Load the actual project data for invited projects
        for (const inviteDoc of invitedSnapshot.docs) {
          const inviteData = inviteDoc.data();
          const { projectId, role, status } = inviteData;
          
          console.log(`Processing invite: Project ${projectId}, Role ${role}, Status ${status}`);
          
          if (!allProjects.has(projectId) && status === 'Active') {
            try {
              // Load the project document by ID
              const projectDocRef = doc(db, 'projects', projectId);
              const projectSnapshot = await getDoc(projectDocRef);
              
              if (projectSnapshot.exists()) {
                allProjects.set(projectId, {
                  id: projectSnapshot.id,
                  ...projectSnapshot.data(),
                  userRole: role // Mark with invited role
                });
                console.log(`✅ Added invited project: ${projectSnapshot.data().name}`);
              } else {
                console.log(`❌ Project ${projectId} not found`);
              }
            } catch (err) {
              console.error(`Error loading project ${projectId}:`, err);
            }
          }
        }

        console.log(`📊 Total projects loaded: ${allProjects.size}`);
        const projectsArray = Array.from(allProjects.values());
        console.log('📊 Final projects array:', projectsArray);
        setProjects(projectsArray);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error loading projects:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadAllUserProjects();
  }, [user]);

  const addProject = async (projectData) => {
    try {
      console.log('Adding project with user:', user);
      console.log('Project data:', projectData);

      if (!user) {
        throw new Error('User is not authenticated');
      }

      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Project created with ID:', docRef.id);
      return { id: docRef.id, success: true };
    } catch (err) {
      console.error('Error adding project:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting project:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    deleteProject
  };
}
