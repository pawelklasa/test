import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useProjects } from './hooks/useProjects';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [userId, setUserId] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user?.uid);
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Get projects from Firebase
  const { projects, loading, error, addProject, deleteProject } = useProjects(userId);

  // Set first project as selected when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    } else if (projects.length === 0) {
      setSelectedProject(null);
    } else if (selectedProject && !projects.find(p => p.id === selectedProject)) {
      // If selected project was deleted, select the first available
      setSelectedProject(projects[0]?.id || null);
    }
  }, [projects, selectedProject]);

  return (
    <ProjectContext.Provider value={{
      selectedProject,
      setSelectedProject,
      projects,
      loading,
      error,
      addProject,
      deleteProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
