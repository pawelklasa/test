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
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const defaultCategories = ['General', 'UI/UX', 'Backend', 'Database', 'Integration'];

export const useCategories = (projectId) => {
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setCategories(defaultCategories);
      setLoading(false);
      return;
    }

    // Listen to both the projectCategories document AND the individual categories collection
    const categoriesDocRef = doc(db, 'projectCategories', projectId);
    const categoriesCollectionRef = collection(db, 'categories');
    const categoriesQuery = query(categoriesCollectionRef, where('projectId', '==', projectId));
    
    // First check for individual categories in the categories collection
    const unsubscribeCollection = onSnapshot(categoriesQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Extract category names from individual category documents
        const categoryNames = snapshot.docs.map(doc => doc.data().name);
        const uniqueCategories = [...new Set(categoryNames)]; // Remove duplicates
        setCategories(uniqueCategories);
        setLoading(false);
      } else {
        // If no individual categories, fall back to checking projectCategories document
        const unsubscribeDoc = onSnapshot(categoriesDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setCategories(data.categories || defaultCategories);
          } else {
            // If no categories document exists, create one with defaults
            setDoc(categoriesDocRef, {
              categories: defaultCategories,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setCategories(defaultCategories);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching categories:', error);
          setCategories(defaultCategories);
          setLoading(false);
        });
        
        return unsubscribeDoc;
      }
    }, (error) => {
      console.error('Error fetching categories collection:', error);
      setCategories(defaultCategories);
      setLoading(false);
    });

    return () => {
      unsubscribeCollection();
    };
  }, [projectId]);

  const addCategory = async (categoryName) => {
    if (!projectId || !categoryName.trim()) return;
    
    try {
      const trimmedName = categoryName.trim();
      if (categories.includes(trimmedName)) return;

      // Add to both the projectCategories document and individual categories collection
      const newCategories = [...categories, trimmedName];
      const categoriesDocRef = doc(db, 'projectCategories', projectId);
      
      // Update the projectCategories document
      await setDoc(categoriesDocRef, {
        categories: newCategories,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Also add as individual category document for consistency with AutoPopulate
      const categoriesCollectionRef = collection(db, 'categories');
      await addDoc(categoriesCollectionRef, {
        name: trimmedName,
        projectId: projectId,
        createdAt: serverTimestamp()
      });

      // Update local state immediately for better UX
      setCategories(newCategories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const removeCategory = async (categoryName) => {
    if (!projectId || !categoryName) return;
    
    try {
      const newCategories = categories.filter(cat => cat !== categoryName);
      const categoriesDocRef = doc(db, 'projectCategories', projectId);
      
      await setDoc(categoriesDocRef, {
        categories: newCategories,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update local state immediately for better UX
      setCategories(newCategories);
    } catch (error) {
      console.error('Error removing category:', error);
    }
  };

  return {
    categories,
    addCategory,
    removeCategory,
    loading
  };
};
