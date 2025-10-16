// Debug new user signin and role assignment
export const debugNewUserSignin = async () => {
  console.log('🔍 === DEBUGGING NEW USER SIGNIN ===');
  
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (!auth.currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }
    
    const user = auth.currentUser;
    console.log('👤 Current User:', user.email, '| UID:', user.uid);
    
    // Check if user has existing projects
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    console.log('📊 Checking for existing projects...');
    const projectsQuery = query(
      collection(db, 'projects'),
      where('createdBy', '==', user.uid)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    console.log(`📁 Found ${projectsSnapshot.size} existing projects`);
    
    // Check userOrganizations memberships
    console.log('🏢 Checking organization memberships...');
    const membershipsQuery = query(
      collection(db, 'userOrganizations'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );
    const membershipsSnapshot = await getDocs(membershipsQuery);
    console.log(`👥 Found ${membershipsSnapshot.size} active memberships:`);
    
    membershipsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - Org: ${data.organizationId} | Role: ${data.role} | Status: ${data.status}`);
    });
    
    // Check what the OrganizationContext would do
    console.log('🧠 Simulating OrganizationContext logic...');
    
    if (membershipsSnapshot.empty) {
      console.log('📋 No memberships found');
      
      if (projectsSnapshot.size > 0) {
        console.log('⚠️ Would create default org (user has existing projects)');
      } else {
        console.log('✅ Would NOT create default org (no existing projects)');
        console.log('✅ User should see "No organizations" state');
      }
    } else {
      console.log('📋 User has memberships - would load organizations');
    }
    
    // Check what role the user currently has in the UI
    console.log('🎭 Checking current UI state...');
    const currentOrgId = localStorage.getItem('currentOrganizationId');
    console.log('💾 localStorage currentOrganizationId:', currentOrgId);
    
    // Try to access OrganizationContext if available
    try {
      // This will only work if we're in the React context
      console.log('🔄 OrganizationContext state would need to be checked in React DevTools');
    } catch (e) {
      console.log('ℹ️ Cannot access React context from console');
    }
    
    console.log('🔍 === END DEBUG ===');
    
    return {
      success: true,
      user: user.email,
      existingProjects: projectsSnapshot.size,
      activeMemberships: membershipsSnapshot.size,
      memberships: membershipsSnapshot.docs.map(doc => doc.data()),
      shouldCreateOrg: membershipsSnapshot.empty && projectsSnapshot.size > 0,
      currentOrgId: currentOrgId
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return { success: false, error: error.message };
  }
};

window.debugNewUserSignin = debugNewUserSignin;
