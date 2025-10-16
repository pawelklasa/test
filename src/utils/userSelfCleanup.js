// Self-cleanup for users to fix their own access issues
export const userSelfCleanup = async () => {
  console.log('🔄 User self-cleanup starting...');
  
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (!auth.currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }
    
    const userEmail = auth.currentUser.email;
    console.log('👤 Current user:', userEmail);
    
    // Step 1: Clear all localStorage and sessionStorage
    console.log('🧹 Clearing all browser storage...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 2: Clear any cached organization data
    console.log('🗑️ Clearing organization cache...');
    const keysToRemove = [
      'currentOrganizationId',
      'userOrganizations',
      'organizationMembers',
      'userRole',
      'organizations'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Step 3: Sign out completely
    console.log('🚪 Signing out...');
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    
    // Step 4: Force page reload to clear all React state
    console.log('🔄 Forcing complete page reload...');
    
    // Clear any remaining cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }
    
    // Force reload with cache clearing
    window.location.href = window.location.origin + '/?clearCache=true';
    
    return { 
      success: true, 
      message: 'User signed out and cache cleared. Page will reload.' 
    };
    
  } catch (error) {
    console.error('❌ Self-cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

// Admin function to remove user from organization (requires owner permissions)
export const adminRemoveUser = async (userEmail, organizationId) => {
  console.log('👨‍💼 Admin removing user:', userEmail, 'from org:', organizationId);
  
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (!auth.currentUser) {
      throw new Error('No admin user signed in');
    }
    
    console.log('👨‍💼 Admin user:', auth.currentUser.email);
    
    const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    let removedCount = 0;
    
    // Remove from userOrganizations
    const userOrgQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', userEmail.toLowerCase()),
      where('organizationId', '==', organizationId)
    );
    
    const userOrgSnapshot = await getDocs(userOrgQuery);
    for (const docSnap of userOrgSnapshot.docs) {
      await deleteDoc(doc(db, 'userOrganizations', docSnap.id));
      removedCount++;
      console.log('🗑️ Removed userOrganization:', docSnap.id);
    }
    
    console.log(`✅ Removed ${removedCount} records for ${userEmail}`);
    
    return {
      success: true,
      removedCount,
      message: `Removed ${removedCount} organization memberships for ${userEmail}`
    };
    
  } catch (error) {
    console.error('❌ Admin removal failed:', error);
    return { success: false, error: error.message };
  }
};

window.userSelfCleanup = userSelfCleanup;
window.adminRemoveUser = adminRemoveUser;
