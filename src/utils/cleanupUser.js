// Utility to clean up auto-created organizations for existing users
export const cleanupExistingUser = async (userEmail) => {
  const { collection, query, where, getDocs, deleteDoc, doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🧹 Cleaning up existing user:', userEmail);
  
  try {
    // 1. Find all organizations where this user is the owner
    const orgsQuery = query(
      collection(db, 'organizations'),
      where('createdBy', '==', userEmail) // This might need the actual user ID
    );
    
    // 2. Check userOrganizations for any records with this email
    const userOrgsQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', userEmail.toLowerCase())
    );
    const userOrgsSnapshot = await getDocs(userOrgsQuery);
    
    console.log(`Found ${userOrgsSnapshot.size} userOrganizations records for ${userEmail}`);
    
    // 3. Check organizationMembers (legacy) for this user
    const orgMembersSnapshot = await getDocs(collection(db, 'organizationMembers'));
    const userMemberRecords = [];
    
    orgMembersSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      // We'll need to match by user ID, which we don't have from email alone
      console.log('📄 Found organizationMembers record:', docSnap.id, data);
      userMemberRecords.push({ id: docSnap.id, data: data });
    });
    
    return {
      userOrganizations: userOrgsSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })),
      organizationMembers: userMemberRecords
    };
    
  } catch (error) {
    console.error('❌ Error cleaning up user:', error);
    return null;
  }
};

// Remove a specific user organization record
export const removeUserOrgRecord = async (docId, collection = 'userOrganizations') => {
  const { doc, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🗑️ Removing user org record:', docId, 'from collection:', collection);
  
  try {
    await deleteDoc(doc(db, collection, docId));
    console.log('✅ Record removed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error removing record:', error);
    return false;
  }
};

// Get current user's Firebase Auth ID
export const getCurrentUserId = () => {
  const auth = require('firebase/auth').getAuth();
  const user = auth.currentUser;
  if (user) {
    console.log('👤 Current user ID:', user.uid, 'Email:', user.email);
    return { uid: user.uid, email: user.email };
  } else {
    console.log('❌ No current user found');
    return null;
  }
};

window.cleanupExistingUser = cleanupExistingUser;
window.removeUserOrgRecord = removeUserOrgRecord;
window.getCurrentUserId = getCurrentUserId;
