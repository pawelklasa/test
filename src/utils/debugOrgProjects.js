// Debug organization projects access
export const debugOrgProjects = async () => {
  console.log('🔍 Debugging organization projects access...');
  
  try {
    const { getAuth } = await import('firebase/auth');
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const auth = getAuth();
    if (!auth.currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }
    
    console.log('👤 Current user:', auth.currentUser.email);
    
    // Get current organization from localStorage
    const currentOrgId = localStorage.getItem('currentOrganizationId');
    console.log('🏢 Current organization ID:', currentOrgId);
    
    if (!currentOrgId) {
      console.log('❌ No organization ID found');
      return { success: false, error: 'No organization found' };
    }
    
    // Check projects in organization subcollection
    console.log('📁 Checking projects in organization subcollection...');
    const orgProjectsRef = collection(db, 'organizations', currentOrgId, 'projects');
    const orgProjectsSnapshot = await getDocs(orgProjectsRef);
    
    console.log(`📋 Found ${orgProjectsSnapshot.size} projects in organization subcollection:`);
    orgProjectsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (created by: ${data.createdBy})`);
    });
    
    // Check legacy projects collection (if any)
    console.log('📁 Checking legacy projects collection...');
    const legacyProjectsRef = collection(db, 'projects');
    const legacyProjectsSnapshot = await getDocs(legacyProjectsRef);
    
    console.log(`📋 Found ${legacyProjectsSnapshot.size} projects in legacy collection:`);
    legacyProjectsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (created by: ${data.createdBy})`);
    });
    
    return {
      success: true,
      organizationId: currentOrgId,
      organizationProjects: orgProjectsSnapshot.size,
      legacyProjects: legacyProjectsSnapshot.size,
      user: auth.currentUser.email
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return { success: false, error: error.message };
  }
};

window.debugOrgProjects = debugOrgProjects;
