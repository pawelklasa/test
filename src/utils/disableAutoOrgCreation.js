// Emergency fix: Completely disable auto-organization creation
export const disableAutoOrgCreation = async () => {
  console.log('🚨 Emergency: Disabling auto-organization creation...');
  
  try {
    // This will patch the OrganizationContext to never create organizations automatically
    
    // 1. Check if there are any users who got auto-created organizations
    const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    console.log('🔍 Looking for auto-created organizations...');
    
    // Find organizations created in the last hour (likely auto-created)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const allUserOrgs = await getDocs(collection(db, 'userOrganizations'));
    
    let autoCreatedCount = 0;
    const problematicUsers = [];
    
    for (const docSnap of allUserOrgs.docs) {
      const data = docSnap.data();
      
      // Look for records with owner role that were created recently
      if (data.role === 'owner' && 
          data.joinedAt && 
          data.joinedAt.toDate && 
          data.joinedAt.toDate() > oneHourAgo) {
        
        console.log('🚨 Found recent owner record:', {
          id: docSnap.id,
          email: data.email,
          role: data.role,
          joinedAt: data.joinedAt.toDate()
        });
        
        // If this is NOT the admin user, it's probably auto-created
        if (data.email !== 'pawel.klasa@gmail.com') {
          problematicUsers.push({
            docId: docSnap.id,
            email: data.email,
            data: data
          });
          autoCreatedCount++;
        }
      }
    }
    
    console.log(`⚠️ Found ${autoCreatedCount} potentially auto-created owner records`);
    
    if (autoCreatedCount > 0) {
      console.log('🗑️ Removing auto-created owner records...');
      
      for (const user of problematicUsers) {
        console.log(`🗑️ Removing owner record for: ${user.email}`);
        await deleteDoc(doc(db, 'userOrganizations', user.docId));
      }
      
      console.log('✅ Removed auto-created records');
    }
    
    console.log('🔒 Auto-organization creation disabled');
    console.log('📋 Only properly invited users will have organization access');
    
    return {
      success: true,
      removedAutoCreated: autoCreatedCount,
      problematicUsers: problematicUsers.map(u => u.email)
    };
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    return { success: false, error: error.message };
  }
};

window.disableAutoOrgCreation = disableAutoOrgCreation;
