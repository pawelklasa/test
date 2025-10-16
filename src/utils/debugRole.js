// Temporary utility to debug and fix user roles
// Run this in browser console if needed

export const debugUserRole = async (userEmail) => {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const { db } = await import('../firebase');
  
  console.log('🔍 Debugging user role for:', userEmail);
  
  // Check userOrganizations collection
  const userOrgsQuery = query(
    collection(db, 'userOrganizations'),
    where('email', '==', userEmail.toLowerCase())
  );
  const userOrgsSnapshot = await getDocs(userOrgsQuery);
  
  console.log('📋 UserOrganizations records:');
  userOrgsSnapshot.forEach(doc => {
    console.log('Doc ID:', doc.id);
    console.log('Data:', doc.data());
  });
  
  // Check by userId if we can find it
  const userByIdQuery = query(
    collection(db, 'userOrganizations'),
    where('userId', '!=', null)
  );
  const userByIdSnapshot = await getDocs(userByIdQuery);
  
  console.log('📋 All UserOrganizations with userId:');
  userByIdSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.email === userEmail.toLowerCase()) {
      console.log('FOUND BY EMAIL - Doc ID:', doc.id);
      console.log('Data:', data);
    }
  });
};

// Call this in console: debugUserRole('pawel.klasa@hazelcast.com')
window.debugUserRole = debugUserRole;
