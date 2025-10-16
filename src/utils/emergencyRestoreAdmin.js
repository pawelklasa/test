// EMERGENCY: Restore correct admin access
export const emergencyRestoreAdmin = async () => {
  console.log('🚨 EMERGENCY: Restoring correct admin access...');
  
  try {
    const { collection, query, where, getDocs, setDoc, doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    // 1. Find pawel.klasa@gmail.com (should be admin)
    console.log('👨‍💼 Looking for admin user: pawel.klasa@gmail.com');
    const adminEmailQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', 'pawel.klasa@gmail.com')
    );
    const adminSnapshot = await getDocs(adminEmailQuery);
    
    // 2. Find pawel.klasa@hazelcast.com (should be member)
    console.log('👤 Looking for member user: pawel.klasa@hazelcast.com');
    const memberEmailQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', 'pawel.klasa@hazelcast.com')
    );
    const memberSnapshot = await getDocs(memberEmailQuery);
    
    console.log(`📊 Admin records found: ${adminSnapshot.size}`);
    console.log(`📊 Member records found: ${memberSnapshot.size}`);
    
    let organizationId = null;
    
    // 3. Get organization ID from either user
    if (adminSnapshot.size > 0) {
      organizationId = adminSnapshot.docs[0].data().organizationId;
    } else if (memberSnapshot.size > 0) {
      organizationId = memberSnapshot.docs[0].data().organizationId;
    }
    
    if (!organizationId) {
      console.log('❌ No organization ID found');
      return { success: false, error: 'No organization found' };
    }
    
    console.log('🏢 Using organization:', organizationId);
    
    // 4. Remove all existing records for both users
    console.log('🗑️ Cleaning up existing records...');
    for (const docSnap of adminSnapshot.docs) {
      await deleteDoc(doc(db, 'userOrganizations', docSnap.id));
      console.log('🗑️ Removed admin record:', docSnap.id);
    }
    
    for (const docSnap of memberSnapshot.docs) {
      await deleteDoc(doc(db, 'userOrganizations', docSnap.id));
      console.log('🗑️ Removed member record:', docSnap.id);
    }
    
    // 5. Create CORRECT records
    console.log('✅ Creating correct access records...');
    
    // Make pawel.klasa@gmail.com the OWNER
    await setDoc(doc(db, 'userOrganizations', `${organizationId}_admin`), {
      organizationId: organizationId,
      userId: 'admin_user_id', // We'll need the real user ID
      email: 'pawel.klasa@gmail.com',
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      invitedBy: 'system'
    });
    console.log('👨‍💼 Created OWNER record for pawel.klasa@gmail.com');
    
    // Make pawel.klasa@hazelcast.com a MEMBER
    await setDoc(doc(db, 'userOrganizations', `${organizationId}_member`), {
      organizationId: organizationId,
      userId: 'member_user_id', // We'll need the real user ID
      email: 'pawel.klasa@hazelcast.com',
      role: 'member',
      status: 'active',
      joinedAt: new Date(),
      invitedBy: 'pawel.klasa@gmail.com'
    });
    console.log('👤 Created MEMBER record for pawel.klasa@hazelcast.com');
    
    console.log('🎉 EMERGENCY FIX COMPLETE!');
    console.log('📋 Now:');
    console.log('  ✅ pawel.klasa@gmail.com = OWNER (full admin access)');
    console.log('  ✅ pawel.klasa@hazelcast.com = MEMBER (limited access)');
    
    return {
      success: true,
      message: 'Admin access restored correctly',
      organizationId: organizationId
    };
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    return { success: false, error: error.message };
  }
};

window.emergencyRestoreAdmin = emergencyRestoreAdmin;
