// Force session cleanup and check current user state
export const forceSessionCleanup = async () => {
  console.log('🧹 Force cleaning user session...');
  
  try {
    // 1. Clear localStorage
    console.log('🗑️ Clearing localStorage...');
    localStorage.clear();
    
    // 2. Clear sessionStorage
    console.log('🗑️ Clearing sessionStorage...');
    sessionStorage.clear();
    
    // 3. Sign out from Firebase
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth();
    
    if (auth.currentUser) {
      console.log('👋 Signing out current user:', auth.currentUser.email);
      await signOut(auth);
    }
    
    // 4. Clear any cached organization context
    console.log('🔄 Forcing page reload...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return { success: true, message: 'Session cleaned, page will reload' };
    
  } catch (error) {
    console.error('❌ Error cleaning session:', error);
    return { success: false, error: error.message };
  }
};

// Check what organization context the current user has
export const checkCurrentUserContext = async () => {
  console.log('🔍 Checking current user context...');
  
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ No current user logged in');
      return { loggedIn: false };
    }
    
    console.log('👤 Current user:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    
    // Check localStorage for cached org data
    const cachedOrgId = localStorage.getItem('currentOrganizationId');
    console.log('💾 Cached organization ID:', cachedOrgId);
    
    // Check what organizations this user actually has access to
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    // Check userOrganizations
    const userOrgsQuery = query(
      collection(db, 'userOrganizations'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );
    const userOrgsSnapshot = await getDocs(userOrgsQuery);
    
    console.log('📋 Active userOrganizations for current user:');
    const userOrgs = [];
    userOrgsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('📄', doc.id, data);
      userOrgs.push({ id: doc.id, ...data });
    });
    
    // Check organizationMembers (legacy)
    const orgMembersQuery = query(
      collection(db, 'organizationMembers'),
      where('userId', '==', user.uid)
    );
    const orgMembersSnapshot = await getDocs(orgMembersQuery);
    
    console.log('📋 OrganizationMembers for current user:');
    const orgMembers = [];
    orgMembersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('📄', doc.id, data);
      orgMembers.push({ id: doc.id, ...data });
    });
    
    return {
      loggedIn: true,
      user: { uid: user.uid, email: user.email },
      cachedOrgId,
      userOrganizations: userOrgs,
      organizationMembers: orgMembers
    };
    
  } catch (error) {
    console.error('❌ Error checking user context:', error);
    return { error: error.message };
  }
};

window.forceSessionCleanup = forceSessionCleanup;
window.checkCurrentUserContext = checkCurrentUserContext;
