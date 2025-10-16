// Fix user record by document ID
export const fixUserRoleByDocId = async (docId, newRole = 'member') => {
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🔧 Fixing user role for document:', docId, 'to role:', newRole);
  
  try {
    const docRef = doc(db, 'userOrganizations', docId);
    await updateDoc(docRef, { 
      role: newRole,
      updatedAt: new Date()
    });
    
    console.log('✅ Role updated successfully for doc:', docId);
    return true;
  } catch (error) {
    console.error('❌ Error updating role:', error);
    return false;
  }
};

// Create a proper invitation record if missing
export const createProperInvitationRecord = async (userEmail, organizationId, role = 'member') => {
  const { doc, setDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🆕 Creating proper invitation record for:', userEmail);
  
  try {
    // Generate a proper invitation ID
    const invitationId = `${userEmail.toLowerCase()}_${organizationId}_${Date.now()}`;
    
    await setDoc(doc(db, 'userOrganizations', invitationId), {
      organizationId: organizationId,
      email: userEmail.toLowerCase(),
      role: role,
      status: 'invited',
      invitedAt: new Date(),
      invitedBy: 'admin',  // You can update this with actual admin ID
      joinedAt: null,
      userId: null  // Will be filled when user accepts
    });
    
    console.log('✅ Proper invitation record created:', invitationId);
    return invitationId;
  } catch (error) {
    console.error('❌ Error creating invitation record:', error);
    return null;
  }
};

window.fixUserRoleByDocId = fixUserRoleByDocId;
window.createProperInvitationRecord = createProperInvitationRecord;
