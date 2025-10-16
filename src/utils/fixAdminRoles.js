// Direct fix for backwards admin permissions
export const fixAdminRoles = async () => {
  console.log('🔧 Fixing admin roles - making pawel.klasa@gmail.com the admin');
  
  try {
    const { collection, query, where, getDocs, setDoc, doc, deleteDoc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    // Find any existing organization
    console.log('🔍 Finding organization...');
    const allOrgsQuery = query(collection(db, 'userOrganizations'));
    const allOrgsSnapshot = await getDocs(allOrgsQuery);
    
    let orgId = null;
    if (allOrgsSnapshot.size > 0) {
      orgId = allOrgsSnapshot.docs[0].data().organizationId;
      console.log('🏢 Found organization:', orgId);
    } else {
      console.log('❌ No organizations found');
      return { success: false, error: 'No organization found' };
    }
    
    // Delete ALL existing user organization records
    console.log('🗑️ Removing all existing user organization records...');
    for (const docSnap of allOrgsSnapshot.docs) {
      await deleteDoc(docSnap.ref);
      console.log('🗑️ Deleted:', docSnap.id);
    }
    
    // Create correct records
    console.log('✅ Creating correct admin/member records...');
    
    // Make pawel.klasa@gmail.com the OWNER/ADMIN
    const adminDocId = `${orgId}_admin`;
    await setDoc(doc(db, 'userOrganizations', adminDocId), {
      organizationId: orgId,
      userId: 'gmail_user_id', // Will be updated when they sign in
      email: 'pawel.klasa@gmail.com',
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      invitedBy: 'system'
    });
    console.log('👨‍💼 Created OWNER record for pawel.klasa@gmail.com');
    
    // Make pawel.klasa@hazelcast.com a MEMBER
    const memberDocId = `${orgId}_member`;  
    await setDoc(doc(db, 'userOrganizations', memberDocId), {
      organizationId: orgId,
      userId: 'hazelcast_user_id', // Will be updated when they sign in
      email: 'pawel.klasa@hazelcast.com',
      role: 'member',
      status: 'active',
      joinedAt: new Date(),
      invitedBy: 'pawel.klasa@gmail.com'
    });
    console.log('👤 Created MEMBER record for pawel.klasa@hazelcast.com');
    
    console.log('🎉 ROLES FIXED!');
    console.log('📋 Current setup:');
    console.log('  ✅ pawel.klasa@gmail.com = OWNER (admin access)');
    console.log('  ✅ pawel.klasa@hazelcast.com = MEMBER (limited access)');
    console.log('');
    console.log('🔄 Both users need to sign out and sign back in now!');
    
    return {
      success: true,
      message: 'Admin roles fixed successfully',
      orgId: orgId
    };
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    return { success: false, error: error.message };
  }
};

window.fixAdminRoles = fixAdminRoles;
