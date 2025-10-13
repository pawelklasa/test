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

    // Listen to the categories document for this project
    const categoriesDocRef = doc(db, 'projectCategories', projectId);
    
    const unsubscribe = onSnapshot(categoriesDocRef, (docSnapshot) => {
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

    return () => unsubscribe();
  }, [projectId]);

  const addCategory = async (categoryName) => {
    if (!projectId || !categoryName.trim()) return;
    
    try {
      const trimmedName = categoryName.trim();
      if (categories.includes(trimmedName)) return;

      const newCategories = [...categories, trimmedName];
      const categoriesDocRef = doc(db, 'projectCategories', projectId);
      
      await setDoc(categoriesDocRef, {
        categories: newCategories,
        updatedAt: serverTimestamp()
      }, { merge: true });

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
