// Check if specific user has existing projects (causing auto-org creation)
export const checkUserProjects = async (userEmail) => {
  console.log('🔍 Checking projects for user:', userEmail);
  
  try {
    const { getAuth } = await import('firebase/auth');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }
    
    console.log('👤 Current user:', currentUser.email, '| UID:', currentUser.uid);
    
    // Check projects in legacy collection by userId
    console.log('📁 Checking legacy projects by userId...');
    const legacyProjectsQuery = query(
      collection(db, 'projects'),
      where('createdBy', '==', currentUser.uid)
    );
    const legacyProjectsSnapshot = await getDocs(legacyProjectsQuery);
    
    console.log(`📋 Found ${legacyProjectsSnapshot.size} legacy projects by userId:`);
    legacyProjectsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (createdBy: ${data.createdBy})`);
    });
    
    // Check if there are other projects with different createdBy values that might match
    console.log('📁 Checking all legacy projects...');
    const allProjectsQuery = collection(db, 'projects');
    const allProjectsSnapshot = await getDocs(allProjectsQuery);
    
    console.log(`📋 All legacy projects (${allProjectsSnapshot.size} total):`);
    allProjectsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (createdBy: ${data.createdBy})`);
    });
    
    // This will tell us if checkUserHasExistingProjects would return true
    const wouldCreateOrg = legacyProjectsSnapshot.size > 0;
    
    console.log('🎯 Analysis:');
    console.log(`  - User ${currentUser.email} has ${legacyProjectsSnapshot.size} legacy projects`);
    console.log(`  - checkUserHasExistingProjects would return: ${wouldCreateOrg}`);
    console.log(`  - Auto-organization creation would ${wouldCreateOrg ? 'HAPPEN' : 'NOT happen'}`);
    
    if (wouldCreateOrg) {
      console.log('🚨 This explains why they got admin access!');
    } else {
      console.log('🤔 This user should NOT get auto-org creation');
    }
    
    return {
      success: true,
      userEmail: currentUser.email,
      userId: currentUser.uid,
      legacyProjects: legacyProjectsSnapshot.size,
      wouldCreateOrg: wouldCreateOrg,
      projects: legacyProjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        createdBy: doc.data().createdBy
      }))
    };
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    return { success: false, error: error.message };
  }
};

window.checkUserProjects = checkUserProjects;
