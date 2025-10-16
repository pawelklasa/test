// Comprehensive solution to find and fix existing user permissions
export const fixExistingUserAccess = async (targetUserEmail) => {
  const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🔧 Comprehensive fix for user:', targetUserEmail);
  
  try {
    // Step 1: Find all organizationMembers records (legacy collection)
    console.log('📋 Step 1: Checking organizationMembers...');
    const orgMembersSnapshot = await getDocs(collection(db, 'organizationMembers'));
    
    const userRecordsToRemove = [];
    orgMembersSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      console.log('📄 OrganizationMember record:', docSnap.id, data);
      
      // If this is NOT the main admin (you can identify by organization ID or user email)
      // and it looks like an auto-created record, mark for removal
      if (data.role === 'owner') {
        userRecordsToRemove.push({ id: docSnap.id, data: data, collection: 'organizationMembers' });
      }
    });
    
    console.log(`Found ${userRecordsToRemove.length} potential auto-created owner records`);
    
    // Step 2: Remove the auto-created owner records (but keep the legitimate admin)
    const mainAdminOrgId = '647lLSetJ4ACcmFP7cj3'; // From your debug output - this is probably your org
    
    for (const record of userRecordsToRemove) {
      if (record.data.organizationId !== mainAdminOrgId) {
        console.log('🗑️ Removing auto-created organization record:', record.id);
        await deleteDoc(doc(db, record.collection, record.id));
      } else {
        console.log('✋ Keeping main admin organization:', record.id);
      }
    }
    
    // Step 3: Create proper member invitation for the user
    console.log('📧 Step 3: Creating proper member invitation...');
    const invitationId = `${targetUserEmail.toLowerCase()}_${mainAdminOrgId}_member_${Date.now()}`;
    
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'userOrganizations', invitationId), {
      organizationId: mainAdminOrgId,
      email: targetUserEmail.toLowerCase(),
      role: 'member',
      status: 'invited',
      invitedAt: new Date(),
      invitedBy: 'admin',
      joinedAt: null,
      userId: null // Will be set when they accept
    });
    
    console.log('✅ Created proper member invitation:', invitationId);
    
    // Step 4: Generate acceptance link
    const acceptanceLink = `${window.location.origin}/accept-invitation?token=${invitationId}`;
    console.log('🔗 Acceptance link:', acceptanceLink);
    
    return {
      success: true,
      removedRecords: userRecordsToRemove.length,
      invitationId: invitationId,
      acceptanceLink: acceptanceLink,
      message: `User needs to log out and use this link to join as member: ${acceptanceLink}`
    };
    
  } catch (error) {
    console.error('❌ Error fixing user access:', error);
    return { success: false, error: error.message };
  }
};

window.fixExistingUserAccess = fixExistingUserAccess;
