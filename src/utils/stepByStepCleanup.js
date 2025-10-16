// Step-by-step user cleanup - handles permissions correctly
export const stepByStepUserCleanup = async (userEmail) => {
  console.log('🔄 Step-by-step cleanup for:', userEmail);
  
  try {
    // Step 1: Clear current session completely
    console.log('🧹 Step 1: Clearing current session...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Step 2: Check if user is signed in
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (auth.currentUser) {
      console.log('👤 Current user:', auth.currentUser.email);
      
      // If this is the user we're trying to clean up, they need to sign out
      if (auth.currentUser.email === userEmail) {
        console.log('🚪 This user needs to sign out completely');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        console.log('✅ User signed out');
        
        // Force reload to clear all state
        console.log('🔄 Forcing page reload...');
        window.location.reload();
        return { success: true, message: 'User signed out - page will reload' };
      }
    }
    
    // Step 3: If we're here, we're signed in as someone else (likely admin)
    console.log('👨‍💼 Signed in as different user - can proceed with cleanup');
    
    // Step 4: Remove user from organizations (requires admin permissions)
    const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const removedRecords = [];
    
    // Remove from userOrganizations
    console.log('🗑️ Removing from userOrganizations...');
    const userOrgQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', userEmail.toLowerCase())
    );
    const userOrgSnapshot = await getDocs(userOrgQuery);
    
    for (const docSnap of userOrgSnapshot.docs) {
      console.log('🗑️ Removing:', docSnap.id);
      await deleteDoc(doc(db, 'userOrganizations', docSnap.id));
      removedRecords.push({ collection: 'userOrganizations', id: docSnap.id });
    }
    
    console.log(`✅ Cleanup complete. Removed ${removedRecords.length} records.`);
    console.log('📋 Next: Ask the user to sign out and sign back in');
    
    return {
      success: true,
      removedRecords: removedRecords,
      message: `Removed ${removedRecords.length} organization memberships. User should sign out and sign back in.`
    };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

window.stepByStepUserCleanup = stepByStepUserCleanup;
