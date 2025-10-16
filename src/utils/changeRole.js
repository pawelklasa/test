// Utility to change user role
// Add this to browser console if needed

export const changeUserRole = async (userEmail, newRole) => {
  const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🔄 Changing role for:', userEmail, 'to:', newRole);
  
  try {
    // Find user in userOrganizations collection
    const userOrgsQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', userEmail.toLowerCase())
    );
    const userOrgsSnapshot = await getDocs(userOrgsQuery);
    
    if (userOrgsSnapshot.empty) {
      console.error('❌ User not found in userOrganizations');
      return false;
    }
    
    // Update all matching records
    const updatePromises = [];
    userOrgsSnapshot.forEach(docSnapshot => {
      const docRef = doc(db, 'userOrganizations', docSnapshot.id);
      updatePromises.push(updateDoc(docRef, { role: newRole }));
      console.log('📝 Updating document:', docSnapshot.id, 'to role:', newRole);
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Role updated successfully. User needs to refresh/re-login.');
    return true;
    
  } catch (error) {
    console.error('❌ Error changing user role:', error);
    return false;
  }
};

// Usage: changeUserRole('pawel.klasa@hazelcast.com', 'member')
window.changeUserRole = changeUserRole;
