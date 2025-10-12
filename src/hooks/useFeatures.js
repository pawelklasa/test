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

const updateFeature = async (featureId, featureData) => {
    try {
      await updateDoc(doc(db, 'features', featureId), {
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

  useEffect(() => {
    if (!projectId) {
      setFeatures([]);
      setLoading(false);
      return;
    }

  const featuresRef = collection(db, 'features');
  const q = query(featuresRef, where('projectId', '==', projectId));
  const unsubscribe = onSnapshot(q,
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
  }, [projectId]);

  const addFeature = async (featureData) => {
    try {
      if (!projectId) {
        throw new Error('No project selected');
      }
      const docRef = await addDoc(collection(db, 'features'), {
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
      await deleteDoc(doc(db, 'features', featureId));
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
  updateFeature
  };
}
