import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useOrganization } from '../OrganizationContext';
import { getAuth } from 'firebase/auth';

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    period: 'per month',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      '10 projects',
      '100 features per project',
      'Basic analytics',
      'Email support',
      'Standard integrations',
      '1GB storage'
    ],
    limits: {
      members: 5,
      projects: 10,
      featuresPerProject: 100,
      storage: 1024 // MB
    },
    popular: false,
    color: 'primary'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    period: 'per month',
    description: 'For growing teams that need more power',
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      'Unlimited features',
      'Advanced analytics & insights',
      'Priority support',
      'All integrations (Jira, Slack, etc.)',
      '10GB storage',
      'Custom workflows',
      'Role-based permissions'
    ],
    limits: {
      members: 25,
      projects: -1, // unlimited
      featuresPerProject: -1, // unlimited
      storage: 10240 // MB
    },
    popular: true,
    color: 'secondary'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'per month',
    description: 'For large organizations with advanced needs',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited features',
      'Enterprise analytics',
      '24/7 dedicated support',
      'Custom integrations',
      '100GB storage',
      'Advanced security features',
      'SSO integration',
      'Custom branding',
      'SLA guarantee'
    ],
    limits: {
      members: -1, // unlimited
      projects: -1, // unlimited
      featuresPerProject: -1, // unlimited
      storage: 102400 // MB
    },
    popular: false,
    color: 'primary'
  }
];

const SubscriptionManagement = () => {
  const { currentOrganization, hasPermission } = useOrganization();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState({
    plan: 'free',
    status: 'active',
    renewsAt: null,
    usage: {
      members: 1,
      projects: 2,
      features: 53,
      storage: 2.5
    }
  });

  // Simulated current plan data
  useEffect(() => {
    // In a real app, this would fetch from Stripe/Firebase
    setCurrentSubscription({
      plan: 'free',
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      usage: {
        members: currentOrganization?.memberCount || 1,
        projects: 2,
        features: 53,
        storage: 2.5
      }
    });
  }, [currentOrganization]);

  const handleUpgradeClick = (plan) => {
    if (!hasPermission('manageBilling')) {
      setError('You do not have permission to manage billing');
      return;
    }
    setSelectedPlan(plan);
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      // In a real app, this would integrate with Stripe
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful upgrade
      setCurrentSubscription({
        ...currentSubscription,
        plan: selectedPlan.id,
        status: 'active',
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      
      setUpgradeDialogOpen(false);
      setSelectedPlan(null);
      
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to upgrade subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlanDetails = () => {
    if (currentSubscription.plan === 'free' || currentSubscription.plan === 'trial') {
      return {
        name: 'Free Trial',
        price: 0,
        features: ['1 team member', '3 projects', '50 features per project', 'Basic support'],
        limits: { members: 1, projects: 3, featuresPerProject: 50, storage: 500 }
      };
    }
    return pricingPlans.find(plan => plan.id === currentSubscription.plan);
  };

  const currentPlan = getCurrentPlanDetails();
  const isUsageNearLimit = (current, limit) => {
    if (limit === -1) return false; // unlimited
    return current / limit > 0.8; // 80% threshold
  };

  if (!currentOrganization) {
    return (
      <Alert severity="warning">
        No organization selected. Please select an organization to manage billing.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Current Subscription Status - Stats Cards Style */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{
          flex: '1 1 auto',
          minWidth: '200px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Current Plan
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {currentPlan?.name || 'Free Trial'}
          </Typography>
          <Chip
            label={currentSubscription.status === 'trial' ? 'Free Trial' : currentSubscription.status}
            color={currentSubscription.status === 'active' ? 'success' : 'warning'}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Monthly Price
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
            ${currentPlan?.price || 0}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Members
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: isUsageNearLimit(currentSubscription.usage.members, currentPlan?.limits?.members) ? '#F59E0B' : 'text.primary' }}>
            {currentSubscription.usage.members} / {currentPlan?.limits?.members === -1 ? '∞' : currentPlan?.limits?.members}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Projects
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: isUsageNearLimit(currentSubscription.usage.projects, currentPlan?.limits?.projects) ? '#F59E0B' : 'text.primary' }}>
            {currentSubscription.usage.projects} / {currentPlan?.limits?.projects === -1 ? '∞' : currentPlan?.limits?.projects}
          </Typography>
        </Box>

        <Box sx={{
          flex: '1 1 auto',
          minWidth: '150px',
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
            Storage
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: isUsageNearLimit(currentSubscription.usage.storage, currentPlan?.limits?.storage) ? '#F59E0B' : '#3B82F6' }}>
            {currentSubscription.usage.storage} MB
          </Typography>
        </Box>
      </Box>

      {/* Trial/Renewal Info */}
      {(currentSubscription.trialEndsAt || currentSubscription.renewsAt) && (
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '4px',
          mb: 3
        }}>
          {currentSubscription.trialEndsAt && (
            <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
              Trial ends: {currentSubscription.trialEndsAt.toLocaleDateString()}
            </Typography>
          )}
          {currentSubscription.renewsAt && (
            <Typography variant="body2" color="text.secondary">
              Renews: {currentSubscription.renewsAt.toLocaleDateString()}
            </Typography>
          )}
        </Box>
      )}

      {/* Pricing Plans */}
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
        Available Plans
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {pricingPlans.map((plan) => (
          <Box
            key={plan.id}
            sx={{
              flex: '1 1 300px',
              p: 2,
              bgcolor: 'background.paper',
              border: plan.popular ? 2 : 1,
              borderColor: plan.popular ? 'secondary.main' : 'divider',
              borderRadius: '4px',
              position: 'relative'
            }}
          >
            {plan.popular && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              >
                MOST POPULAR
              </Box>
            )}

            <Box textAlign="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {plan.name}
              </Typography>
              <Box display="flex" alignItems="baseline" justifyContent="center" mt={1}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: plan.popular ? 'secondary.main' : 'primary.main' }}>
                  ${plan.price}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {plan.period}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" mt={1}>
                {plan.description}
              </Typography>
            </Box>

            <List dense sx={{ mb: 2 }}>
              {plan.features.map((feature, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckIcon color="success" sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    primaryTypographyProps={{ variant: 'body2', fontSize: '0.85rem' }}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              fullWidth
              variant={plan.popular ? 'contained' : 'outlined'}
              color={plan.color}
              onClick={() => handleUpgradeClick(plan)}
              disabled={currentSubscription.plan === plan.id}
              size="small"
            >
              {currentSubscription.plan === plan.id ? 'Current Plan' : 'Upgrade'}
            </Button>
          </Box>
        ))}
      </Box>

      {/* Integration Notice */}
      <Box sx={{
        p: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: '4px'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SecurityIcon />
          Secure Billing Integration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a preview of the billing system. In production, this will integrate with Stripe for secure payment processing.
          All transactions will be encrypted and PCI compliant. You'll be able to manage payment methods, view invoices,
          and track usage in real-time.
        </Typography>
      </Box>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upgrade Subscription</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <>
              <Typography paragraph>
                You're about to upgrade to the <strong>{selectedPlan.name}</strong> plan.
              </Typography>
              
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="h6">{selectedPlan.name}</Typography>
                <Typography variant="h4" color="primary">${selectedPlan.price}<Typography component="span" variant="body2">/month</Typography></Typography>
                <Typography variant="body2" color="text.secondary">{selectedPlan.description}</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Your subscription will be active immediately, and you'll be billed monthly. 
                You can cancel or change your plan at any time.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpgradeConfirm} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 'Confirm Upgrade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagement;
