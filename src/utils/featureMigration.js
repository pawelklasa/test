import { collection, doc, getDoc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export const migrateFeaturesToNestedStructure = async (organizationId) => {
  console.log('🔄 Starting feature migration to nested structure...', { organizationId });
  
  try {
    let migratedFeatures = 0;
    let errorCount = 0;
    const migrationLog = [];

    // 1. Get all features from the old flat structure
    console.log('📋 Getting features from old flat structure...');
    const oldFeaturesRef = collection(db, 'organizations', organizationId, 'features');
    const oldFeaturesSnapshot = await getDocs(oldFeaturesRef);
    
    console.log(`📋 Found ${oldFeaturesSnapshot.size} features in old structure`);
    
    if (oldFeaturesSnapshot.size === 0) {
      return {
        success: true,
        message: 'No features found in old structure to migrate',
        migratedFeatures: 0,
        errorCount: 0,
        migrationLog: []
      };
    }

    // Group features by projectId
    const featuresByProject = {};
    oldFeaturesSnapshot.docs.forEach(doc => {
      const featureData = doc.data();
      const projectId = featureData.projectId;
      
      if (!projectId) {
        console.log(`⚠️ Feature ${doc.id} has no projectId, skipping`);
        errorCount++;
        migrationLog.push(`⚠️ Feature ${featureData.name || doc.id} has no projectId - skipped`);
        return;
      }
      
      if (!featuresByProject[projectId]) {
        featuresByProject[projectId] = [];
      }
      
      featuresByProject[projectId].push({
        id: doc.id,
        data: featureData
      });
    });

    console.log(`📊 Features grouped by ${Object.keys(featuresByProject).length} projects`);

    // 2. For each project, migrate its features to the nested structure
    for (const [projectId, features] of Object.entries(featuresByProject)) {
      console.log(`🔧 Migrating ${features.length} features for project ${projectId}...`);
      
      // Check if project exists in organization
      const projectRef = doc(db, 'organizations', organizationId, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (!projectDoc.exists()) {
        console.log(`⚠️ Project ${projectId} not found in organization, skipping its features`);
        errorCount += features.length;
        migrationLog.push(`⚠️ Project ${projectId} not found - skipped ${features.length} features`);
        continue;
      }

      const projectName = projectDoc.data().name || projectId;
      let projectMigrated = 0;

      // Migrate each feature for this project
      for (const feature of features) {
        try {
          // Create feature in new nested structure
          const newFeatureRef = doc(db, 'organizations', organizationId, 'projects', projectId, 'features', feature.id);
          
          // Check if already exists
          const existingFeatureDoc = await getDoc(newFeatureRef);
          if (existingFeatureDoc.exists()) {
            console.log(`ℹ️ Feature ${feature.data.name || feature.id} already exists in nested structure`);
            migrationLog.push(`ℹ️ ${feature.data.name || feature.id} already in nested structure`);
            continue;
          }

          // Copy to new location
          await setDoc(newFeatureRef, feature.data);
          
          // Delete from old location
          const oldFeatureRef = doc(db, 'organizations', organizationId, 'features', feature.id);
          await deleteDoc(oldFeatureRef);
          
          migratedFeatures++;
          projectMigrated++;
          
          console.log(`✅ Migrated feature: ${feature.data.name || feature.id}`);
          
        } catch (error) {
          console.error(`❌ Error migrating feature ${feature.id}:`, error);
          errorCount++;
          migrationLog.push(`❌ Failed to migrate ${feature.data.name || feature.id}: ${error.message}`);
        }
      }
      
      migrationLog.push(`✅ Project "${projectName}": migrated ${projectMigrated} features`);
    }
    
    const summary = {
      success: true,
      message: `Successfully migrated ${migratedFeatures} features to nested structure`,
      migratedFeatures,
      errorCount,
      migrationLog,
      projectsProcessed: Object.keys(featuresByProject).length
    };
    
    console.log('✅ Feature migration completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('❌ Error during feature migration:', error);
    throw error;
  }
};

export const fixOrganizationName = async (organizationId, newName) => {
  console.log('🔧 Fixing organization name...', { organizationId, newName });
  
  try {
    const orgRef = doc(db, 'organizations', organizationId);
    const orgDoc = await getDoc(orgRef);
    
    if (!orgDoc.exists()) {
      throw new Error('Organization not found');
    }
    
    await setDoc(orgRef, {
      ...orgDoc.data(),
      name: newName,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Organization name updated');
    return { success: true, message: `Organization name updated to "${newName}"` };
    
  } catch (error) {
    console.error('❌ Error fixing organization name:', error);
    throw error;
  }
};
