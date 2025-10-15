import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { populateHazelcastFeatures } from './populateFeatures.js';
import { hazelcastFeaturesPartTwo } from './populateFeaturesPartTwo.js';
import { hazelcastFeaturesPartThree } from './populateFeaturesPartThree.js';
import { addCategoryIfNotExists, addFeatureToProject } from './populateFeatures.js';

// Function to find Test project ID
export const findTestProjectId = async () => {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('name', '==', 'Test'));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const project = snapshot.docs[0];
      return project.id;
    } else {
      console.error('Test project not found!');
      return null;
    }
  } catch (error) {
    console.error('Error finding Test project:', error);
    return null;
  }
};

// Function to populate features from part 2
export const populatePartTwo = async (projectId) => {
  console.log('Adding Part 2 features...');
  
  for (const [categoryName, features] of Object.entries(hazelcastFeaturesPartTwo)) {
    console.log(`Adding category: ${categoryName}`);
    await addCategoryIfNotExists(projectId, categoryName);
    
    for (const feature of features) {
      await addFeatureToProject(projectId, {
        ...feature,
        category: categoryName
      });
    }
  }
};

// Function to populate features from part 3
export const populatePartThree = async (projectId) => {
  console.log('Adding Part 3 features...');
  
  for (const [categoryName, features] of Object.entries(hazelcastFeaturesPartThree)) {
    console.log(`Adding category: ${categoryName}`);
    await addCategoryIfNotExists(projectId, categoryName);
    
    for (const feature of features) {
      await addFeatureToProject(projectId, {
        ...feature,
        category: categoryName
      });
    }
  }
};

// Main function to populate all Hazelcast features
export const populateAllHazelcastFeatures = async (projectId) => {
  console.log('Starting Hazelcast feature population...');
  
  if (!projectId) {
    console.error('No project ID provided');
    return;
  }
  
  console.log(`Using project ID: ${projectId}`);
  
  try {
    // Add Part 1 features
    await populateHazelcastFeatures(projectId);
    
    // Add Part 2 features
    await populatePartTwo(projectId);
    
    // Add Part 3 features
    await populatePartThree(projectId);
    
    console.log('Successfully populated all Hazelcast features!');
    console.log('Summary:');
    console.log('- SEARCH & NAVIGATION: 4 features');
    console.log('- CLUSTER MANAGEMENT: 6 features');
    console.log('- MEMBER MANAGEMENT: 7 features');
    console.log('- DATA STRUCTURES: 6 features');
    console.log('- DASHBOARD: 8 features');
    console.log('- JET PIPELINE MANAGEMENT: 5 features');
    console.log('- DEVELOPER TOOLS: 4 features');
    console.log('- BUSINESS INTELLIGENCE: 5 features');
    console.log('- INTEGRATIONS: 5 features');
    console.log('- DEMO DASHBOARDS: 5 features');
    console.log('- PARTITION MANAGEMENT: 4 features');
    console.log('- AI ASSISTANCE: 3 features');
    console.log('- DIAGNOSTIC TOOLS: 4 features');
    console.log('- ALERTING & LOGGING: 4 features');
    console.log('- CONFIGURATION: 4 features');
    console.log('- AGENT MANAGEMENT: 4 features');
    console.log('- RESPONSIVE DESIGN: 4 features');
    console.log('- INTERACTIVE FEATURES: 5 features');
    console.log('- CHART ENHANCEMENTS: 5 features');
    console.log('Total: 92 features across 19 categories');
    
  } catch (error) {
    console.error('Error during feature population:', error);
  }
};
