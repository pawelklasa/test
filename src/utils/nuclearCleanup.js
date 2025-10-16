// Nuclear option - completely remove user from all organizations
export const nuclearUserCleanup = async (userEmail, userId = null) => {
  const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('☢️ NUCLEAR CLEANUP for:', userEmail);
  console.log('⚠️ This will remove ALL organization memberships for this user');
  
  try {
    let actualUserId = userId;
    
    // If no userId provided, try to get it from Firebase Auth
    if (!actualUserId) {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      if (auth.currentUser && auth.currentUser.email === userEmail) {
        actualUserId = auth.currentUser.uid;
        console.log('🎯 Found user ID:', actualUserId);
      }
    }
    
    const removedRecords = [];
    
    // 1. Remove ALL userOrganizations records for this user
    console.log('🗑️ Removing userOrganizations records...');
    
    // By email
    const emailQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', userEmail.toLowerCase())
    );
    const emailSnapshot = await getDocs(emailQuery);
    
    for (const docSnap of emailSnapshot.docs) {
      console.log('🗑️ Removing userOrg by email:', docSnap.id);
      await deleteDoc(doc(db, 'userOrganizations', docSnap.id));
      removedRecords.push({ collection: 'userOrganizations', id: docSnap.id, method: 'email' });
    }
    
    // By userId if available
    if (actualUserId) {
      const userIdQuery = query(
        collection(db, 'userOrganizations'),
        where('userId', '==', actualUserId)
      );
      const userIdSnapshot = await getDocs(userIdQuery);
      
      for (const docSnap of userIdSnapshot.docs) {
        console.log('🗑️ Removing userOrg by userId:', docSnap.id);
        await deleteDoc(doc(db, 'userOrganizations', docSnap.id));
        removedRecords.push({ collection: 'userOrganizations', id: docSnap.id, method: 'userId' });
      }
    }
    
    // 2. Remove ALL organizationMembers records for this user
    console.log('🗑️ Removing organizationMembers records...');
    
    if (actualUserId) {
      const orgMembersQuery = query(
        collection(db, 'organizationMembers'),
        where('userId', '==', actualUserId)
      );
      const orgMembersSnapshot = await getDocs(orgMembersQuery);
      
      for (const docSnap of orgMembersSnapshot.docs) {
        console.log('🗑️ Removing organizationMember:', docSnap.id);
        await deleteDoc(doc(db, 'organizationMembers', docSnap.id));
        removedRecords.push({ collection: 'organizationMembers', id: docSnap.id, method: 'userId' });
      }
    }
    
    console.log(`✅ Nuclear cleanup complete. Removed ${removedRecords.length} records.`);
    console.log('📋 Removed records:', removedRecords);
    
    // 3. Sign out user and clear session
    console.log('👋 Signing out user...');
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth();
    if (auth.currentUser) {
      await signOut(auth);
    }
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('🔄 User completely removed. They can now be re-invited properly.');
    
    return {
      success: true,
      removedRecords: removedRecords,
      message: 'User completely removed from all organizations. They should log out and be re-invited.'
    };
    
  } catch (error) {
    console.error('❌ Nuclear cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

window.nuclearUserCleanup = nuclearUserCleanup;
