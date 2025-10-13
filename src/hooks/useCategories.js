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
    console.log('useCategories useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.log('No projectId, using default categories');
      setCategories(defaultCategories);
      setLoading(false);
      return;
    }

    // Listen to the categories document for this project
    const categoriesDocRef = doc(db, 'projectCategories', projectId);
    console.log('Setting up Firebase listener for:', categoriesDocRef.path);
    
    const unsubscribe = onSnapshot(categoriesDocRef, (docSnapshot) => {
      console.log('Firebase snapshot received. Exists:', docSnapshot.exists());
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log('Categories data from Firebase:', data);
        setCategories(data.categories || defaultCategories);
      } else {
        console.log('No categories document exists, creating one with defaults');
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

    return () => unsubscribe();
  }, [projectId]);

  const addCategory = async (categoryName) => {
    console.log('addCategory called with:', { projectId, categoryName });
    
    if (!projectId || !categoryName.trim()) {
      console.log('addCategory early return - missing projectId or categoryName');
      return;
    }
    
    try {
      const trimmedName = categoryName.trim();
      if (categories.includes(trimmedName)) {
        console.log('Category already exists:', trimmedName);
        return;
      }

      const newCategories = [...categories, trimmedName];
      console.log('Adding category to Firebase. Old categories:', categories, 'New categories:', newCategories);
      
      const categoriesDocRef = doc(db, 'projectCategories', projectId);
      
      await setDoc(categoriesDocRef, {
        categories: newCategories,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('Successfully saved to Firebase');
      
      // Update local state immediately for better UX
      setCategories(newCategories);
      console.log('Local state updated');
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
