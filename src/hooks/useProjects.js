import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export function useProjects(userId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addProject = async (projectData) => {
    try {
      console.log('Adding project with userId:', userId);
      console.log('Project data:', projectData);

      if (!userId) {
        throw new Error('User is not authenticated');
      }

      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId,
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
