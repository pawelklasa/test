const admin = require('firebase-admin');

// This script helps debug the projectUsers collection
async function debugProjectUsers() {
  try {
    console.log('🔍 Checking projectUsers collection...');
    
    const db = admin.firestore();
    
    // Get all projectUsers documents
    const projectUsersSnapshot = await db.collection('projectUsers').get();
    console.log(`Found ${projectUsersSnapshot.docs.length} projectUsers documents`);
    
    projectUsersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('📋 ProjectUser document:', {
        id: doc.id,
        email: data.email,
        projectId: data.projectId,
        role: data.role,
        status: data.status,
        invitedAt: data.invitedAt
      });
    });
    
    // Check specifically for pawel.klasa@hazelcast.com
    const pawelInvites = await db.collection('projectUsers')
      .where('email', '==', 'pawel.klasa@hazelcast.com')
      .get();
      
    console.log(`Found ${pawelInvites.docs.length} invitations for pawel.klasa@hazelcast.com`);
    
    pawelInvites.docs.forEach(doc => {
      const data = doc.data();
      console.log('✅ Pawel invitation:', {
        id: doc.id,
        email: data.email,
        projectId: data.projectId,
        role: data.role,
        status: data.status,
        invitedAt: data.invitedAt
      });
    });
    
    // Also check all projects
    const projectsSnapshot = await db.collection('projects').get();
    console.log(`Found ${projectsSnapshot.docs.length} projects total`);
    
    projectsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('📁 Project:', {
        id: doc.id,
        name: data.name,
        userId: data.userId
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Note: This would need Firebase Admin SDK initialized
// debugProjectUsers();

module.exports = { debugProjectUsers };
