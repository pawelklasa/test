import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { createDefaultOrganizationForUser } from './utils/migration';
import { sendInvitationEmail } from './utils/emailService';

// Check if user has existing projects that would warrant creating a default organization
const checkUserHasExistingProjects = async (userId) => {
  try {
    const projectsQuery = query(
      collection(db, 'projects'),
      where('createdBy', '==', userId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    return projectsSnapshot.size > 0;
  } catch (error) {
    console.error('Error checking for existing projects:', error);
    return false;
  }
};

const OrganizationContext = createContext();

export { OrganizationContext };

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      setUser(user);
      if (user) {
        await loadUserOrganizations(user.uid);
      } else {
        setCurrentOrganization(null);
        setUserOrganizations([]);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Load organizations for the current user
  const loadUserOrganizations = async (userId) => {
    try {
      // Get user's organization memberships from userOrganizations collection
      const membershipsQuery = query(
        collection(db, 'userOrganizations'),
        where('userId', '==', userId),
        where('status', '==', 'active') // Only load active memberships
      );
      const membershipsSnapshot = await getDocs(membershipsQuery);
      
      // Only create default organization for users who have existing projects/data to migrate
      if (membershipsSnapshot.empty) {
        // Check if user has existing projects that need migration
        const hasExistingData = await checkUserHasExistingProjects(userId);
        if (hasExistingData) {
          console.log('Creating default organization for existing user with data');
          const orgId = await createDefaultOrganizationForUser({ uid: userId });
          if (orgId) {
            // Reload after creating organization
            return loadUserOrganizations(userId);
          }
        } else {
          console.log('No organizations found for user, and no existing data to migrate');
          // Don't create default organization - user needs to be properly invited
          return;
        }
      }
      
      const organizations = [];
      for (const membershipDoc of membershipsSnapshot.docs) {
        const membership = membershipDoc.data();

        
        // Get organization details
        const orgDoc = await getDoc(doc(db, 'organizations', membership.organizationId));
        if (orgDoc.exists()) {
          organizations.push({
            id: orgDoc.id,
            ...orgDoc.data(),
            role: membership.role,
            joinedAt: membership.joinedAt
          });
        }
      }

      setUserOrganizations(organizations);
      
      // Set current organization (first one for now, or from localStorage)
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const savedOrg = organizations.find(org => org.id === savedOrgId);
      const defaultOrg = savedOrg || organizations[0];
      
      if (defaultOrg) {
        setCurrentOrganization(defaultOrg);
        setUserRole(defaultOrg.role);
        localStorage.setItem('currentOrganizationId', defaultOrg.id);
      }
    } catch (error) {
      console.error('Error loading user organizations:', error);
    }
  };

  // Create a new organization
  const createOrganization = async (organizationData) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      // Create organization document
      const orgDoc = doc(collection(db, 'organizations'));
      const orgData = {
        ...organizationData,
        createdAt: new Date(),
        createdBy: user.uid,
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        plan: 'starter'
      };
      
      await setDoc(orgDoc, orgData);

      // Add user as owner to organization members
      await setDoc(doc(db, 'organizationMembers', `${orgDoc.id}_${user.uid}`), {
        organizationId: orgDoc.id,
        userId: user.uid,
        role: 'owner',
        joinedAt: new Date(),
        invitedBy: user.uid
      });

      // Reload organizations
      await loadUserOrganizations(user.uid);

      return orgDoc.id;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  // Switch current organization
  const switchOrganization = (organization) => {
    setCurrentOrganization(organization);
    setUserRole(organization.role);
    localStorage.setItem('currentOrganizationId', organization.id);
  };

  // Update organization
  const updateOrganization = async (organizationId, updates) => {
    try {
      await updateDoc(doc(db, 'organizations', organizationId), updates);
      
      // Update local state
      setCurrentOrganization(prev => ({ ...prev, ...updates }));
      setUserOrganizations(prev => prev.map(org => 
        org.id === organizationId ? { ...org, ...updates } : org
      ));
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  // Invite user to organization
  const inviteUser = async (email, role = 'member') => {
    if (!currentOrganization) throw new Error('No current organization');
    
    try {
      // Create invitation document in userOrganizations collection with a generated ID
      const inviteDoc = doc(collection(db, 'userOrganizations'));
      const invitationId = inviteDoc.id;
      
      await setDoc(inviteDoc, {
        organizationId: currentOrganization.id,
        organizationName: currentOrganization.name,
        email: email.toLowerCase(),
        role,
        invitedBy: user.uid,
        invitedAt: new Date(),
        status: 'invited' // Changed from 'pending' to 'invited' to match AcceptInvitation logic
      });

      // Send email invitation
      const invitationLink = `${window.location.origin}/accept-invitation?token=${invitationId}`;
      
      try {
        await sendInvitationEmail(email, {
          organizationName: currentOrganization.name,
          invitedByName: user.displayName || user.email,
          invitationLink,
          role
        });
        
        console.log(`📧 Invitation email sent to ${email} for role ${role}`);
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Continue with the invitation creation even if email fails
      }
      
      return invitationId;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  };

  // Check user permissions
  const hasPermission = (permission) => {
    if (!userRole) return false;
    
    const permissions = {
      owner: [
        'read', 'write', 'admin', 'billing', 'invite', 'delete', 
        'manageBilling', 'manageOrganization', 'viewOrganization',
        'manageUsers', 'viewUsers'
      ],
      admin: [
        'read', 'write', 'admin', 'invite', 
        'viewOrganization', 'manageUsers', 'viewUsers'
      ],
      member: [
        'read', 'write', 'viewOrganization', 'viewUsers'
      ],
      viewer: [
        'read', 'viewOrganization', 'viewUsers'
      ]
    };
    
    return permissions[userRole]?.includes(permission) || false;
  };

  const value = {
    user,
    currentOrganization,
    userOrganizations,
    userRole,
    loading,
    createOrganization,
    switchOrganization,
    updateOrganization,
    inviteUser,
    hasPermission,
    loadUserOrganizations: () => loadUserOrganizations(user?.uid)
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
