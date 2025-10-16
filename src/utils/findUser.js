// Enhanced debugging utility to find user records across collections
export const findUserEverywhere = async (userEmail) => {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🔍 Searching for user everywhere:', userEmail);
  
  try {
    // 1. Check userOrganizations by email
    console.log('📋 Checking userOrganizations by email...');
    const userOrgsQuery = query(
      collection(db, 'userOrganizations'),
      where('email', '==', userEmail.toLowerCase())
    );
    const userOrgsSnapshot = await getDocs(userOrgsQuery);
    
    console.log(`Found ${userOrgsSnapshot.size} records by email`);
    userOrgsSnapshot.forEach(doc => {
      console.log('📄 Email match - Doc ID:', doc.id, 'Data:', doc.data());
    });
    
    // 2. Check all userOrganizations records
    console.log('📋 Checking all userOrganizations records...');
    const allUserOrgsSnapshot = await getDocs(collection(db, 'userOrganizations'));
    
    console.log(`Total userOrganizations records: ${allUserOrgsSnapshot.size}`);
    allUserOrgsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === userEmail.toLowerCase() || 
          (data.userId && data.userId.includes && data.userId.includes(userEmail.toLowerCase()))) {
        console.log('📄 Found related record - Doc ID:', doc.id, 'Data:', data);
      }
    });
    
    // 3. Check organizationMembers (old collection)
    console.log('📋 Checking organizationMembers (legacy)...');
    try {
      const orgMembersSnapshot = await getDocs(collection(db, 'organizationMembers'));
      console.log(`Total organizationMembers records: ${orgMembersSnapshot.size}`);
      orgMembersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log('📄 OrganizationMembers - Doc ID:', doc.id, 'Data:', data);
      });
    } catch (error) {
      console.log('No organizationMembers collection found');
    }
    
    // 4. Check invitations collection
    console.log('📋 Checking invitations collection...');
    try {
      const invitationsSnapshot = await getDocs(collection(db, 'invitations'));
      console.log(`Total invitations records: ${invitationsSnapshot.size}`);
      invitationsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email === userEmail.toLowerCase()) {
          console.log('📄 Found invitation - Doc ID:', doc.id, 'Data:', data);
        }
      });
    } catch (error) {
      console.log('No invitations collection found');
    }
    
  } catch (error) {
    console.error('❌ Error searching for user:', error);
  }
};

// Usage: findUserEverywhere('pawel.klasa@hazelcast.com')
window.findUserEverywhere = findUserEverywhere;
