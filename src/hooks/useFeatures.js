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
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useOrganization } from '../OrganizationContext';

const updateFeature = async (organizationId, projectId, featureId, featureData) => {
    try {
      await updateDoc(doc(db, 'organizations', organizationId, 'projects', projectId, 'features', featureId), {
        ...featureData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

export function useFeatures(projectId) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (!projectId || !currentOrganization?.id) {
      setFeatures([]);
      setLoading(false);
      return;
    }

    // Features are stored in organizations/{orgId}/projects/{projectId}/features/
    const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', projectId, 'features');
    const unsubscribe = onSnapshot(featuresRef,
      (snapshot) => {
        const featuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeatures(featuresData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, currentOrganization?.id]);

  const addFeature = async (featureData) => {
    try {
      if (!projectId || !currentOrganization?.id) {
        throw new Error('No project or organization selected');
      }
      const docRef = await addDoc(collection(db, 'organizations', currentOrganization.id, 'projects', projectId, 'features'), {
        ...featureData,
        projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteFeature = async (featureId) => {
    try {
      if (!currentOrganization?.id || !projectId) {
        throw new Error('No organization or project selected');
      }
      await deleteDoc(doc(db, 'organizations', currentOrganization.id, 'projects', projectId, 'features', featureId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
  features,
  loading,
  error,
  addFeature,
  deleteFeature,
  updateFeature: (featureId, featureData) => updateFeature(currentOrganization?.id, projectId, featureId, featureData)
  };
}
