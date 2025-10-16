import { collection, doc, getDoc, setDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export const recoverSpecificProjects = async (projectIds, organizationId) => {
  console.log('🔄 Starting targeted project recovery...', { projectIds, organizationId });
  
  try {
    let recoveredProjects = 0;
    let recoveredFeatures = 0;
    let recoveredCategories = 0;
    let recoveredIntegrations = 0;

    for (const projectId of projectIds) {
      console.log(`📋 Recovering project: ${projectId}`);
      
      // Get the project from old structure
      const oldProjectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!oldProjectDoc.exists()) {
        console.log(`⚠️ Project ${projectId} not found in old structure`);
        continue;
      }
      
      const projectData = oldProjectDoc.data();
      console.log(`📋 Found project: ${projectData.name}`);
      
      // Create new project under organization
      const newProjectRef = doc(db, 'organizations', organizationId, 'projects', projectId);
      
      // Check if project already exists in organization
      const existingProjectDoc = await getDoc(newProjectRef);
      if (!existingProjectDoc.exists()) {
        await setDoc(newProjectRef, {
          ...projectData,
          recoveredFrom: `projects/${projectId}`,
          recoveredAt: new Date(),
          organizationId: organizationId,
          // Update the userId to current user to ensure ownership
          userId: getAuth().currentUser.uid
        });
        recoveredProjects++;
        console.log(`✅ Project ${projectData.name} recovered`);
      } else {
        console.log(`⚠️ Project ${projectData.name} already exists in organization`);
      }
      
      // Recover Features for this project
      console.log(`🔧 Recovering features for project ${projectId}...`);
      try {
        const oldFeaturesSnapshot = await getDocs(collection(db, 'projects', projectId, 'features'));
        console.log(`🔧 Found ${oldFeaturesSnapshot.size} features for project ${projectId}`);
        
        for (const featureDoc of oldFeaturesSnapshot.docs) {
          const featureData = featureDoc.data();
          const newFeatureRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'features', featureDoc.id);
          
          const existingFeatureDoc = await getDoc(newFeatureRef);
          if (!existingFeatureDoc.exists()) {
            await setDoc(newFeatureRef, featureData);
            recoveredFeatures++;
          }
        }
      } catch (error) {
        console.log(`⚠️ No features to recover for project ${projectId}:`, error.message);
      }
      
      // Recover Categories for this project
      console.log(`📂 Recovering categories for project ${projectId}...`);
      try {
        const oldCategoriesSnapshot = await getDocs(collection(db, 'projects', projectId, 'categories'));
        console.log(`📂 Found ${oldCategoriesSnapshot.size} categories for project ${projectId}`);
        
        for (const categoryDoc of oldCategoriesSnapshot.docs) {
          const categoryData = categoryDoc.data();
          const newCategoryRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'categories', categoryDoc.id);
          
          const existingCategoryDoc = await getDoc(newCategoryRef);
          if (!existingCategoryDoc.exists()) {
            await setDoc(newCategoryRef, categoryData);
            recoveredCategories++;
          }
        }
      } catch (error) {
        console.log(`⚠️ No categories to recover for project ${projectId}:`, error.message);
      }
      
      // Recover Integrations for this project
      console.log(`🔗 Recovering integrations for project ${projectId}...`);
      try {
        const oldIntegrationsSnapshot = await getDocs(collection(db, 'projects', projectId, 'integrations'));
        console.log(`🔗 Found ${oldIntegrationsSnapshot.size} integrations for project ${projectId}`);
        
        for (const integrationDoc of oldIntegrationsSnapshot.docs) {
          const integrationData = integrationDoc.data();
          const newIntegrationRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'integrations', integrationDoc.id);
          
          const existingIntegrationDoc = await getDoc(newIntegrationRef);
          if (!existingIntegrationDoc.exists()) {
            await setDoc(newIntegrationRef, integrationData);
            recoveredIntegrations++;
          }
        }
      } catch (error) {
        console.log(`⚠️ No integrations to recover for project ${projectId}:`, error.message);
      }
    }
    
    const summary = {
      success: true,
      projectsRecovered: recoveredProjects,
      featuresRecovered: recoveredFeatures,
      categoriesRecovered: recoveredCategories,
      integrationsRecovered: recoveredIntegrations,
      message: `Successfully recovered ${recoveredProjects} projects with ${recoveredFeatures} features, ${recoveredCategories} categories, and ${recoveredIntegrations} integrations`
    };
    
    console.log('✅ Targeted recovery completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('❌ Error during targeted recovery:', error);
    throw error;
  }
};

export const fixOrganizationMembership = async (userId, organizationId) => {
  console.log('🔧 Fixing organization membership...', { userId, organizationId });
  
  try {
    // Add user to organization members
    const membershipRef = doc(db, 'userOrganizations', `${userId}_${organizationId}`);
    await setDoc(membershipRef, {
      userId: userId,
      organizationId: organizationId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date()
    });
    
    // Update organization to ensure proper ownership
    const orgRef = doc(db, 'organizations', organizationId);
    const orgDoc = await getDoc(orgRef);
    
    if (orgDoc.exists()) {
      await setDoc(orgRef, {
        ...orgDoc.data(),
        ownerId: userId,
        members: [userId],
        updatedAt: new Date()
      }, { merge: true });
    }
    
    console.log('✅ Organization membership fixed');
    return { success: true };
  } catch (error) {
    console.error('❌ Error fixing organization membership:', error);
    throw error;
  }
};
