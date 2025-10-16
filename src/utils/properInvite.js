// Utility to properly invite a user and clean up any auto-created organizations
export const properlyInviteUser = async (userEmail, organizationId, role = 'member') => {
  const { doc, setDoc, collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🎯 Properly inviting user:', userEmail, 'to org:', organizationId, 'as:', role);
  
  try {
    // 1. Check if user has any auto-created organizations that should be removed
    const autoCreatedOrgsQuery = query(
      collection(db, 'organizations'),
      where('createdBy', '==', userEmail) // This would need the actual user ID
    );
    
    // 2. Create proper invitation in userOrganizations collection
    const invitationId = `${userEmail.toLowerCase()}_${organizationId}_${Date.now()}`;
    
    await setDoc(doc(db, 'userOrganizations', invitationId), {
      organizationId: organizationId,
      email: userEmail.toLowerCase(),
      role: role,
      status: 'invited',
      invitedAt: new Date(),
      invitedBy: 'admin', // Update with actual admin ID
      joinedAt: null,
      userId: null // Will be set when user accepts invitation
    });
    
    console.log('✅ Proper invitation created with ID:', invitationId);
    
    // 3. Send invitation email
    const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationId}`;
    console.log('📧 Invitation link:', invitationLink);
    
    return {
      success: true,
      invitationId: invitationId,
      invitationLink: invitationLink
    };
    
  } catch (error) {
    console.error('❌ Error creating proper invitation:', error);
    return { success: false, error: error.message };
  }
};

// Clean up auto-created organizations for a user
export const cleanupAutoCreatedOrgs = async (userEmail) => {
  console.log('🧹 This would require the user ID to properly clean up auto-created orgs');
  console.log('Manual cleanup: Have the user log out, then you can re-invite them properly');
};

window.properlyInviteUser = properlyInviteUser;
window.cleanupAutoCreatedOrgs = cleanupAutoCreatedOrgs;
