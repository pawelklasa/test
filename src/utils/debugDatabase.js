import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export const debugDatabaseStructure = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.log('❌ No user logged in');
    return { error: 'No user logged in' };
  }

  console.log('🔍 Starting database debug for user:', user.uid, user.email);
  
  const results = {
    userId: user.uid,
    userEmail: user.email,
    oldProjects: [],
    organizations: [],
    organizationProjects: [],
    allCollections: []
  };

  try {
    // 1. Check for projects in old structure by userId
    console.log('📋 Checking old projects structure (projects where userId = current user)...');
    try {
      const oldProjectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid)
      );
      const oldProjectsSnapshot = await getDocs(oldProjectsQuery);
      results.oldProjects = oldProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`📋 Found ${results.oldProjects.length} projects in old structure`);
    } catch (error) {
      console.log('⚠️ Error checking old projects:', error);
      results.oldProjectsError = error.message;
    }

    // 2. Check for projects by email (in case userId is stored as email)
    console.log('📧 Checking old projects structure (projects where userId = email)...');
    try {
      const emailProjectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.email)
      );
      const emailProjectsSnapshot = await getDocs(emailProjectsQuery);
      const emailProjects = emailProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      results.oldProjects = [...results.oldProjects, ...emailProjects];
      console.log(`📧 Found ${emailProjects.length} projects by email in old structure`);
    } catch (error) {
      console.log('⚠️ Error checking email projects:', error);
    }

    // 3. Check all projects (to see if there are any at all)
    console.log('📂 Checking ALL projects in old structure...');
    try {
      const allProjectsSnapshot = await getDocs(collection(db, 'projects'));
      const allProjects = allProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().userId,
        name: doc.data().name,
        createdAt: doc.data().createdAt
      }));
      results.allOldProjects = allProjects;
      console.log(`📂 Found ${allProjects.length} total projects in old structure`);
      
      // Show first few projects for debugging
      if (allProjects.length > 0) {
        console.log('🔍 Sample projects:', allProjects.slice(0, 3));
      }
    } catch (error) {
      console.log('⚠️ Error checking all projects:', error);
    }

    // 4. Check organizations
    console.log('🏢 Checking organizations...');
    try {
      const organizationsSnapshot = await getDocs(collection(db, 'organizations'));
      results.organizations = organizationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`🏢 Found ${results.organizations.length} organizations`);
    } catch (error) {
      console.log('⚠️ Error checking organizations:', error);
      results.organizationsError = error.message;
    }

    // 5. Check projects in organizations
    console.log('🏗️ Checking projects in organizations...');
    for (const org of results.organizations) {
      try {
        const orgProjectsSnapshot = await getDocs(
          collection(db, 'organizations', org.id, 'projects')
        );
        const orgProjects = orgProjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          organizationId: org.id,
          organizationName: org.name,
          ...doc.data()
        }));
        results.organizationProjects = [...results.organizationProjects, ...orgProjects];
        console.log(`🏗️ Found ${orgProjects.length} projects in org ${org.name}`);
      } catch (error) {
        console.log(`⚠️ Error checking projects in org ${org.name}:`, error);
      }
    }

    // 6. Check user organization memberships
    console.log('👥 Checking user organization memberships...');
    try {
      const userOrgsQuery = query(
        collection(db, 'userOrganizations'),
        where('userId', '==', user.uid)
      );
      const userOrgsSnapshot = await getDocs(userOrgsQuery);
      results.userMemberships = userOrgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`👥 Found ${results.userMemberships.length} user memberships`);
    } catch (error) {
      console.log('⚠️ Error checking user memberships:', error);
    }

    // 7. Check if there's a default organization for this user
    console.log('🔍 Looking for user-specific organization...');
    const userSpecificOrgs = results.organizations.filter(org => 
      org.name?.includes(user.email) || 
      org.createdBy === user.uid ||
      org.ownerId === user.uid
    );
    results.userSpecificOrgs = userSpecificOrgs;
    console.log(`🔍 Found ${userSpecificOrgs.length} user-specific organizations`);

  } catch (error) {
    console.error('❌ Error during database debug:', error);
    results.error = error.message;
  }

  console.log('📊 Debug Results Summary:');
  console.log('- Old projects found:', results.oldProjects.length);
  console.log('- Organizations found:', results.organizations.length);
  console.log('- Organization projects found:', results.organizationProjects.length);
  console.log('- User memberships:', results.userMemberships?.length || 0);
  console.log('- User-specific orgs:', results.userSpecificOrgs?.length || 0);

  return results;
};

export const manualDataRecovery = async (sourceStructure = 'auto') => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user logged in');
  }

  console.log('🚀 Starting manual data recovery...');
  
  // First run debug to understand the data structure
  const debugResults = await debugDatabaseStructure();
  
  // Based on debug results, determine recovery strategy
  let recoveryPlan = [];
  
  if (debugResults.allOldProjects?.length > 0) {
    // There are projects in old structure, but maybe not owned by current user
    const possibleUserProjects = debugResults.allOldProjects.filter(project => 
      project.userId === user.uid || 
      project.userId === user.email ||
      project.name?.toLowerCase().includes('test') ||
      project.name?.toLowerCase().includes('demo')
    );
    
    if (possibleUserProjects.length > 0) {
      recoveryPlan.push({
        type: 'recover_possible_projects',
        projects: possibleUserProjects,
        description: `Found ${possibleUserProjects.length} possible user projects`
      });
    }
  }
  
  if (debugResults.organizationProjects?.length > 0) {
    recoveryPlan.push({
      type: 'projects_already_in_orgs',
      projects: debugResults.organizationProjects,
      description: `Found ${debugResults.organizationProjects.length} projects already in organizations`
    });
  }
  
  return {
    debugResults,
    recoveryPlan,
    recommendations: generateRecoveryRecommendations(debugResults)
  };
};

const generateRecoveryRecommendations = (debugResults) => {
  const recommendations = [];
  
  if (debugResults.oldProjects?.length === 0 && debugResults.allOldProjects?.length === 0) {
    recommendations.push({
      type: 'no_old_data',
      message: 'No projects found in old structure. Data may have been already migrated or never existed.',
      action: 'Check if you\'re logged in with the correct account'
    });
  }
  
  if (debugResults.organizationProjects?.length > 0) {
    recommendations.push({
      type: 'data_in_orgs',
      message: `Found ${debugResults.organizationProjects.length} projects in organizations`,
      action: 'Projects may already be in the organization structure'
    });
  }
  
  if (debugResults.organizations?.length === 0) {
    recommendations.push({
      type: 'no_organizations',
      message: 'No organizations found',
      action: 'Create a default organization first'
    });
  }
  
  if (debugResults.userMemberships?.length === 0) {
    recommendations.push({
      type: 'no_memberships',
      message: 'User is not a member of any organizations',
      action: 'Add user to an organization or create a default one'
    });
  }
  
  return recommendations;
};
