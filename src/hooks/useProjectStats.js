import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useOrganization } from '../OrganizationContext';

export function useProjectStats(projects) {
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (!projects || projects.length === 0 || !currentOrganization?.id) {
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
            const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', project.id, 'features');
            const snapshot = await getDocs(featuresRef);
            
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
  }, [projects, currentOrganization?.id]);

  return {
    projectStats,
    loading
  };
}
