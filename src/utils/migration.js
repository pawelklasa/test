import { collection, doc, getDoc, setDoc, getDocs, writeBatch, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const migrateUserDataToOrganization = async (userId, organizationId) => {
  const batch = writeBatch(db);
  
  try {
    console.log('Starting data migration for user:', userId, 'to organization:', organizationId);
    
    // 1. Migrate Projects
    const userProjectsQuery = query(
      collection(db, 'projects'),
      where('createdBy', '==', userId)
    );
    const projectsSnapshot = await getDocs(userProjectsQuery);
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      
      // Create new project under organization
      const newProjectRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id);
      batch.set(newProjectRef, {
        ...projectData,
        migratedFrom: `projects/${projectDoc.id}`,
        migratedAt: new Date()
      });
      
      // 2. Migrate Features for this project
      const featuresSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'features'));
      for (const featureDoc of featuresSnapshot.docs) {
        const featureData = featureDoc.data();
        const newFeatureRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id, 'features', featureDoc.id);
        batch.set(newFeatureRef, featureData);
      }
      
      // 3. Migrate Categories for this project
      const categoriesSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'categories'));
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data();
        const newCategoryRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id, 'categories', categoryDoc.id);
        batch.set(newCategoryRef, categoryData);
      }
      
      // 4. Migrate Integrations for this project
      try {
        const integrationsSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'integrations'));
        for (const integrationDoc of integrationsSnapshot.docs) {
          const integrationData = integrationDoc.data();
          const newIntegrationRef = doc(db, 'organizations', organizationId, 'projects', projectDoc.id, 'integrations', integrationDoc.id);
          batch.set(newIntegrationRef, integrationData);
        }
      } catch (error) {
        console.log('No integrations to migrate for project:', projectDoc.id);
      }
    }
    
    // Commit the batch
    await batch.commit();
    console.log('Data migration completed successfully');
    
    return {
      success: true,
      projectsMigrated: projectsSnapshot.size,
      message: `Successfully migrated ${projectsSnapshot.size} projects to organization`
    };
    
  } catch (error) {
    console.error('Error during data migration:', error);
    throw error;
  }
};

export const createDefaultOrganizationForUser = async (user) => {
  try {
    // Check if user already has organizations
    const membershipsQuery = query(
      collection(db, 'userOrganizations'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );
    const membershipsSnapshot = await getDocs(membershipsQuery);
    
    if (membershipsSnapshot.size > 0) {
      console.log('User already has organizations');
      return null;
    }
    
    // Create default organization
    const orgDoc = doc(collection(db, 'organizations'));
    const orgData = {
      name: user.displayName ? `${user.displayName}'s Organization` : `${user.email?.split('@')[0]}'s Organization`,
      createdAt: new Date(),
      createdBy: user.uid,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      plan: 'starter',
      settings: {
        allowInvitations: true,
        defaultRole: 'member'
      }
    };
    
    await setDoc(orgDoc, orgData);
    
    // Add user as owner in userOrganizations collection
    await setDoc(doc(db, 'userOrganizations', `${orgDoc.id}_${user.uid}`), {
      organizationId: orgDoc.id,
      userId: user.uid,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      invitedBy: user.uid
    });
    
    // Migrate existing data
    await migrateUserDataToOrganization(user.uid, orgDoc.id);
    
    return orgDoc.id;
    
  } catch (error) {
    console.error('Error creating default organization:', error);
    throw error;
  }
};
