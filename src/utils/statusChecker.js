// Quick status checker for debugging authentication and organization state
export const checkCurrentStatus = async () => {
  console.log('🔍 === CURRENT STATUS CHECK ===');
  
  try {
    // Check Firebase Auth
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    console.log('👤 Firebase Auth Status:');
    if (auth.currentUser) {
      console.log('  ✅ Signed in as:', auth.currentUser.email);
      console.log('  🆔 User ID:', auth.currentUser.uid);
    } else {
      console.log('  ❌ Not signed in');
    }
    
    // Check localStorage
    console.log('💾 localStorage Data:');
    const currentOrgId = localStorage.getItem('currentOrganizationId');
    const userOrgs = localStorage.getItem('userOrganizations');
    
    console.log('  currentOrganizationId:', currentOrgId);
    console.log('  userOrganizations:', userOrgs ? JSON.parse(userOrgs) : 'null');
    
    // Check sessionStorage
    console.log('🔄 sessionStorage Data:');
    const sessionKeys = Object.keys(sessionStorage);
    console.log('  Keys:', sessionKeys);
    sessionKeys.forEach(key => {
      console.log(`  ${key}:`, sessionStorage.getItem(key));
    });
    
    // Check if user has any organization memberships in database
    if (auth.currentUser) {
      console.log('🏢 Database Organization Check:');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const userOrgQuery = query(
        collection(db, 'userOrganizations'),
        where('email', '==', auth.currentUser.email.toLowerCase())
      );
      const snapshot = await getDocs(userOrgQuery);
      
      console.log(`  Found ${snapshot.docs.length} organization memberships:`);
      snapshot.docs.forEach(doc => {
        console.log('  -', doc.id, ':', doc.data());
      });
    }
    
    console.log('🔍 === END STATUS CHECK ===');
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
};

window.checkCurrentStatus = checkCurrentStatus;
