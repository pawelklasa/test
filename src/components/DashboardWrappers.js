import React from 'react';
import { useOrganization } from '../OrganizationContext';
import { useAuth } from '../hooks/useAuth';
import AnalyticsDashboard from './AnalyticsDashboard';
import UserTrackingDashboard from './UserTrackingDashboard';
import EmailManagementDashboard from './EmailManagementDashboard';
import UsageLimitsDashboard from './UsageLimitsDashboard';

// Wrapper components that inject organization context

export const AnalyticsDashboardWrapper = () => {
  const { currentOrganization } = useOrganization();
  return <AnalyticsDashboard organizationId={currentOrganization?.id} />;
};

export const UserTrackingDashboardWrapper = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  return (
    <UserTrackingDashboard 
      organizationId={currentOrganization?.id} 
      currentUser={user} 
    />
  );
};

export const EmailManagementDashboardWrapper = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  return (
    <EmailManagementDashboard 
      organizationId={currentOrganization?.id} 
      currentUser={user} 
    />
  );
};

export const UsageLimitsDashboardWrapper = () => {
  const { currentOrganization } = useOrganization();
  return <UsageLimitsDashboard organizationId={currentOrganization?.id} />;
};
