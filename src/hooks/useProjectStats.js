import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

export function useProjectStats(projects) {
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projects || projects.length === 0) {
      setProjectStats({});
      setLoading(false);
      return;
    }

    const loadProjectStats = async () => {
      try {
        setLoading(true);
        const stats = {};

        // Load stats for each project
        for (const project of projects) {
          try {
            const featuresRef = collection(db, 'features');
            const q = query(featuresRef, where('projectId', '==', project.id));
            const snapshot = await getDocs(q);
            
            const features = snapshot.docs.map(doc => doc.data());
            const totalFeatures = features.length;
            const completedFeatures = features.filter(f => f.workflowStatus === 'Done').length;
            const completionPercentage = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;

            stats[project.id] = {
              totalFeatures,
              completedFeatures,
              completionPercentage
            };
          } catch (error) {
            console.error(`Error loading stats for project ${project.id}:`, error);
            stats[project.id] = {
              totalFeatures: 0,
              completedFeatures: 0,
              completionPercentage: 0
            };
          }
        }

        setProjectStats(stats);
        setLoading(false);
      } catch (error) {
        console.error('Error loading project stats:', error);
        setLoading(false);
      }
    };

    loadProjectStats();
  }, [projects]);

  return {
    projectStats,
    loading
  };
}
