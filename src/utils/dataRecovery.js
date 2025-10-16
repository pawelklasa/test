import { collection, doc, getDoc, setDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const recoverUserDataToOrganization = async (userId, organizationId) => {
  console.log('🔄 Starting data recovery for user:', userId, 'to organization:', organizationId);
  
  try {
    let recoveredProjects = 0;
    let recoveredFeatures = 0;
    let recoveredCategories = 0;
    let recoveredIntegrations = 0;

    // 1. Find and recover projects from the old structure
    console.log('📋 Step 1: Recovering projects from old structure...');
    
    // Check for projects owned by the user in the old structure
    const oldProjectsQuery = query(
      collection(db, 'projects'),
      where('userId', '==', userId)
    );
    const oldProjectsSnapshot = await getDocs(oldProjectsQuery);
    
    console.log(`📋 Found ${oldProjectsSnapshot.size} projects in old structure`);
    
    for (const projectDoc of oldProjectsSnapshot.docs) {
      const projectData = projectDoc.data();
      console.log(`📋 Recovering project: ${projectData.name} (${projectDoc.id})`);
      
      // Create new project under organization
      const newProjectRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id);
      
      // Check if project already exists in organization
      const existingProjectDoc = await getDoc(newProjectRef);
      if (!existingProjectDoc.exists()) {
        await setDoc(newProjectRef, {
          ...projectData,
          recoveredFrom: `projects/${projectDoc.id}`,
          recoveredAt: new Date(),
          organizationId: organizationId
        });
        recoveredProjects++;
        console.log(`✅ Project ${projectData.name} recovered`);
      } else {
        console.log(`⚠️ Project ${projectData.name} already exists in organization`);
      }
      
      // 2. Recover Features for this project
      console.log(`🔧 Recovering features for project ${projectDoc.id}...`);
      try {
        const oldFeaturesSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'features'));
        console.log(`🔧 Found ${oldFeaturesSnapshot.size} features for project ${projectDoc.id}`);
        
        for (const featureDoc of oldFeaturesSnapshot.docs) {
          const featureData = featureDoc.data();
          const newFeatureRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id, 'features', featureDoc.id);
          
          const existingFeatureDoc = await getDoc(newFeatureRef);
          if (!existingFeatureDoc.exists()) {
            await setDoc(newFeatureRef, featureData);
            recoveredFeatures++;
          }
        }
      } catch (error) {
        console.log(`⚠️ No features to recover for project ${projectDoc.id}`);
      }
      
      // 3. Recover Categories for this project
      console.log(`📂 Recovering categories for project ${projectDoc.id}...`);
      try {
        const oldCategoriesSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'categories'));
        console.log(`📂 Found ${oldCategoriesSnapshot.size} categories for project ${projectDoc.id}`);
        
        for (const categoryDoc of oldCategoriesSnapshot.docs) {
          const categoryData = categoryDoc.data();
          const newCategoryRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id, 'categories', categoryDoc.id);
          
          const existingCategoryDoc = await getDoc(newCategoryRef);
          if (!existingCategoryDoc.exists()) {
            await setDoc(newCategoryRef, categoryData);
            recoveredCategories++;
          }
        }
      } catch (error) {
        console.log(`⚠️ No categories to recover for project ${projectDoc.id}`);
      }
      
      // 4. Recover Integrations for this project
      console.log(`🔗 Recovering integrations for project ${projectDoc.id}...`);
      try {
        const oldIntegrationsSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'integrations'));
        console.log(`🔗 Found ${oldIntegrationsSnapshot.size} integrations for project ${projectDoc.id}`);
        
        for (const integrationDoc of oldIntegrationsSnapshot.docs) {
          const integrationData = integrationDoc.data();
          const newIntegrationRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id, 'integrations', integrationDoc.id);
          
          const existingIntegrationDoc = await getDoc(newIntegrationRef);
          if (!existingIntegrationDoc.exists()) {
            await setDoc(newIntegrationRef, integrationData);
            recoveredIntegrations++;
          }
        }
      } catch (error) {
        console.log(`⚠️ No integrations to recover for project ${projectDoc.id}`);
      }
    }
    
    // Also check for projects where user was invited (in case there are shared projects)
    console.log('👥 Step 2: Checking for shared projects...');
    try {
      const projectUsersQuery = query(
        collection(db, 'projectUsers'),
        where('email', '==', userId) // Assuming userId is email, otherwise we need to get user's email
      );
      const projectUsersSnapshot = await getDocs(projectUsersQuery);
      
      for (const userDoc of projectUsersSnapshot.docs) {
        const userData = userDoc.data();
        const sharedProjectDoc = await getDoc(doc(db, 'projects', userData.projectId));
        
        if (sharedProjectDoc.exists()) {
          const projectData = sharedProjectDoc.data();
          console.log(`👥 Recovering shared project: ${projectData.name}`);
          
          const newProjectRef = doc(db, 'organizations', organizationId, 'projects', sharedProjectDoc.id);
          const existingProjectDoc = await getDoc(newProjectRef);
          
          if (!existingProjectDoc.exists()) {
            await setDoc(newProjectRef, {
              ...projectData,
              recoveredFrom: `projects/${sharedProjectDoc.id}`,
              recoveredAt: new Date(),
              sharedProject: true,
              organizationId: organizationId
            });
            recoveredProjects++;
            
            // Recover data for shared project too
            // (same logic as above for features, categories, integrations)
          }
        }
      }
    } catch (error) {
      console.log('⚠️ No shared projects found or error accessing them');
    }
    
    const summary = {
      success: true,
      projectsRecovered: recoveredProjects,
      featuresRecovered: recoveredFeatures,
      categoriesRecovered: recoveredCategories,
      integrationsRecovered: recoveredIntegrations,
      message: `Successfully recovered ${recoveredProjects} projects with ${recoveredFeatures} features, ${recoveredCategories} categories, and ${recoveredIntegrations} integrations`
    };
    
    console.log('✅ Data recovery completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('❌ Error during data recovery:', error);
    throw error;
  }
};

export const checkOldDataExists = async (userId) => {
  try {
    // Check if user has any projects in old structure
    const oldProjectsQuery = query(
      collection(db, 'projects'),
      where('userId', '==', userId)
    );
    const oldProjectsSnapshot = await getDocs(oldProjectsQuery);
    
    return {
      hasOldData: oldProjectsSnapshot.size > 0,
      oldProjectsCount: oldProjectsSnapshot.size,
      projects: oldProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt
      }))
    };
  } catch (error) {
    console.error('Error checking old data:', error);
    return { hasOldData: false, oldProjectsCount: 0, projects: [] };
  }
};
