// Fix member user ID mapping
export const fixMemberUserMapping = async () => {
  console.log('🔧 Fixing member user ID mapping...');
  
  try {
    const { getAuth } = await import('firebase/auth');
    const { collection, query, where, getDocs, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const auth = getAuth();
    if (!auth.currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }
    
    const currentUser = auth.currentUser;
    console.log('👤 Current user:', currentUser.email, '| Firebase UID:', currentUser.uid);
    
    if (currentUser.email !== 'pawel.klasa@hazelcast.com') {
      console.log('❌ Wrong user - this fix is for pawel.klasa@hazelcast.com only');
      return { success: false, error: 'This fix is only for pawel.klasa@hazelcast.com' };
    }
    
    // Find the member user's organization record
    console.log('🔍 Finding member user organization record...');
    const memberQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', 'pawel.klasa@hazelcast.com')
    );
    const memberSnapshot = await getDocs(memberQuery);
    
    if (memberSnapshot.empty) {
      console.log('❌ No organization record found for pawel.klasa@hazelcast.com');
      return { success: false, error: 'No organization record found' };
    }
    
    // Update the user ID to the real Firebase UID
    for (const docSnap of memberSnapshot.docs) {
      const currentData = docSnap.data();
      console.log('📝 Updating user ID from', currentData.userId, 'to', currentUser.uid);
      
      await updateDoc(docSnap.ref, {
        userId: currentUser.uid
      });
      
      console.log('✅ Updated organization record:', docSnap.id);
    }
    
    // Clear localStorage to force fresh load
    console.log('🧹 Clearing localStorage...');
    localStorage.removeItem('currentOrganizationId');
    localStorage.removeItem('userOrganizations');
    
    console.log('🎉 Member user mapping fixed!');
    console.log('🔄 Page will reload to apply changes...');
    
    // Force reload to pick up changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return {
      success: true,
      message: 'Member user ID mapping fixed',
      updatedRecords: memberSnapshot.size
    };
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    return { success: false, error: error.message };
  }
};

window.fixMemberUserMapping = fixMemberUserMapping;
