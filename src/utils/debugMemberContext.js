// Debug member organization context
export const debugMemberContext = async () => {
  console.log('🔍 Debugging member organization context...');
  
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (!auth.currentUser) {
      console.log('❌ No user signed in');
      return { success: false, error: 'No user signed in' };
    }
    
    console.log('👤 Current user:', auth.currentUser.email);
    
    // Check localStorage
    console.log('💾 localStorage data:');
    const currentOrgId = localStorage.getItem('currentOrganizationId');
    const userOrgs = localStorage.getItem('userOrganizations');
    
    console.log('  currentOrganizationId:', currentOrgId);
    console.log('  userOrganizations:', userOrgs);
    
    if (userOrgs) {
      try {
        const parsedOrgs = JSON.parse(userOrgs);
        console.log('  📋 Parsed organizations:', parsedOrgs);
      } catch (e) {
        console.log('  ❌ Failed to parse userOrganizations');
      }
    }
    
    // Check what React context would show
    console.log('🧠 React Context Check:');
    console.log('  Note: Check React DevTools for OrganizationContext values');
    console.log('  Look for: currentOrganization, userRole, organizations');
    
    // Force reload organization data
    console.log('🔄 To force reload organization data, run: forceReloadOrg()');
    
    return {
      success: true,
      user: auth.currentUser.email,
      orgId: currentOrgId,
      hasUserOrgs: !!userOrgs
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return { success: false, error: error.message };
  }
};

// Force reload organization data
export const forceReloadOrg = () => {
  console.log('🔄 Forcing organization data reload...');
  
  // Clear cached data
  localStorage.removeItem('currentOrganizationId');
  localStorage.removeItem('userOrganizations');
  
  // Reload page to trigger fresh organization load
  window.location.reload();
};

window.debugMemberContext = debugMemberContext;
window.forceReloadOrg = forceReloadOrg;
