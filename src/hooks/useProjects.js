import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useOrganization } from '../OrganizationContext';

export function useProjects(user) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (!user || !currentOrganization) {
      console.log('❌ No user or organization found, setting empty projects');
      setProjects([]);
      setLoading(false);
      return;
    }

    console.log('🔍 useProjects: Starting project load for organization:', {
      organizationId: currentOrganization.id,
      organizationName: currentOrganization.name,
      userRole: currentOrganization.role,
      refreshTrigger: refreshTrigger
    });

    const loadOrganizationProjects = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading projects for organization:', currentOrganization.id);

        // Load projects from organization subcollection
        const orgProjectsRef = collection(db, 'organizations', currentOrganization.id, 'projects');
        const projectsSnapshot = await getDocs(orgProjectsRef);
        
        console.log('📋 Found', projectsSnapshot.size, 'organization projects');
        
        const projectsList = [];
        projectsSnapshot.forEach((doc) => {
          const projectData = doc.data();
          console.log('📋 Project found:', { id: doc.id, name: projectData.name });
          
          projectsList.push({
            id: doc.id,
            ...projectData,
            // Convert timestamps to dates for display
            createdAt: projectData.createdAt?.toDate ? projectData.createdAt.toDate() : projectData.createdAt,
            updatedAt: projectData.updatedAt?.toDate ? projectData.updatedAt.toDate() : projectData.updatedAt
          });
        });

        console.log('✅ Final projects list:', projectsList.map(p => ({ id: p.id, name: p.name })));
        setProjects(projectsList);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading organization projects:', err);
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationProjects();
  }, [user, currentOrganization, refreshTrigger]);

  const addProject = async (projectData) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      console.log('➕ Adding project to organization:', currentOrganization.id);
      const orgProjectsRef = collection(db, 'organizations', currentOrganization.id, 'projects');
      const docRef = await addDoc(orgProjectsRef, {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        organizationId: currentOrganization.id
      });
      
      console.log('✅ Project added with ID:', docRef.id);
      setRefreshTrigger(prev => prev + 1);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      console.log('🔄 Updating project:', projectId);
      const projectRef = doc(db, 'organizations', currentOrganization.id, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Project updated');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      console.log('🗑️ Deleting project:', projectId);
      const projectRef = doc(db, 'organizations', currentOrganization.id, 'projects', projectId);
      await deleteDoc(projectRef);
      
      console.log('✅ Project deleted');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      throw error;
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects: () => setRefreshTrigger(prev => prev + 1)
  };
}
