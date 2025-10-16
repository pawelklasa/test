import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc 
} from 'firebase/firestore';

export const fixPavUser = async () => {
  const userEmail = 'pavuxtesting@gmail.com';
  
  try {
    console.log('=== Checking pavuxtesting@gmail.com user state ===');
    
    // 1. Check userOrganizations collection
    const userOrgsQuery = query(
      collection(db, 'userOrganizations'), 
      where('email', '==', userEmail)
    );
    const userOrgsSnapshot = await getDocs(userOrgsQuery);
    
    console.log('UserOrganizations found:', userOrgsSnapshot.size);
    userOrgsSnapshot.forEach(doc => {
      console.log('UserOrg:', doc.id, doc.data());
    });
    
    // 2. Check organizationMembers collection
    const orgMembersQuery = query(
      collection(db, 'organizationMembers'), 
      where('email', '==', userEmail)
    );
    const orgMembersSnapshot = await getDocs(orgMembersQuery);
    
    console.log('OrganizationMembers found:', orgMembersSnapshot.size);
    orgMembersSnapshot.forEach(doc => {
      console.log('OrgMember:', doc.id, doc.data());
    });
    
    // 3. Find the main organization (should be pawel.klasa@gmail.com's org)
    const mainOrgQuery = query(
      collection(db, 'userOrganizations'), 
      where('email', '==', 'pawel.klasa@gmail.com')
    );
    const mainOrgSnapshot = await getDocs(mainOrgQuery);
    
    let mainOrgId = null;
    if (!mainOrgSnapshot.empty) {
      mainOrgId = mainOrgSnapshot.docs[0].data().organizationId;
      console.log('Main organization ID:', mainOrgId);
    }
    
    // 4. If pavuxtesting user has no proper membership, fix it
    if (userOrgsSnapshot.empty && mainOrgId) {
      console.log('Adding pavuxtesting@gmail.com to main organization as member...');
      
      // Add to userOrganizations
      await addDoc(collection(db, 'userOrganizations'), {
        email: userEmail,
        organizationId: mainOrgId,
        role: 'member',
        createdAt: new Date()
      });
      
      // Add to organizationMembers
      await addDoc(collection(db, 'organizationMembers'), {
        organizationId: mainOrgId,
        email: userEmail,
        role: 'member',
        status: 'accepted',
        invitedAt: new Date(),
        acceptedAt: new Date()
      });
      
      console.log('✅ Fixed pavuxtesting@gmail.com membership');
    } else {
      console.log('User already has organization membership');
    }
    
    return true;
  } catch (error) {
    console.error('Error fixing pav user:', error);
    return false;
  }
};
