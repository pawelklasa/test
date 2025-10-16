import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import SupportIcon from '@mui/icons-material/Support';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '14 days',
      originalPrice: null,
      description: 'Try all features with no commitment',
      features: [
        'Full access to all features',
        '1 team member',
        '3 projects',
        '50 features per project',
        'Basic Jira integration',
        'Email support',
        '500MB storage'
      ],
      limits: '14-day trial period',
      buttonText: 'Start Free Trial',
      buttonVariant: 'outlined',
      featured: false,
      highlight: null
    },
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      originalPrice: null,
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        '10 projects',
        '100 features per project',
        'Basic analytics & insights',
        'All integrations (Jira, Slack)',
        'Email support',
        '1GB storage',
        'Role-based permissions'
      ],
      limits: 'Great for startups and small teams',
      buttonText: 'Choose Starter',
      buttonVariant: 'outlined',
      featured: false,
      highlight: null
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/month',
      originalPrice: '$69',
      description: 'For growing teams that need more power',
      features: [
        'Up to 25 team members',
        'Unlimited projects',
        'Unlimited features',
        'Advanced analytics & insights',
        'Priority support (24/48h)',
        'All integrations + API access',
        '10GB storage',
        'Custom workflows',
        'Advanced role management',
        'Export & reporting tools'
      ],
      limits: 'Perfect for growing companies',
      buttonText: 'Choose Professional',
      buttonVariant: 'contained',
      featured: true,
      highlight: 'MOST POPULAR'
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      originalPrice: null,
      description: 'For large organizations with advanced needs',
      features: [
        'Unlimited team members',
        'Unlimited projects & features',
        'Enterprise analytics suite',
        '24/7 dedicated support',
        'Custom integrations + SSO',
        '100GB storage',
        'Advanced security features',
        'Custom branding',
        'SLA guarantee (99.9%)',
        'Dedicated account manager',
        'White-label options'
      ],
      limits: 'Full enterprise solution',
      buttonText: 'Contact Sales',
      buttonVariant: 'outlined',
      featured: false,
      highlight: 'ENTERPRISE'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 16,
          pb: 10,
          px: 3,
          mb: 8,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 400,
              mb: 4,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            Start free and upgrade as you grow. Cancel anytime.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<SecurityIcon />} 
              label="14-day free trial" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              icon={<SupportIcon />} 
              label="No credit card required" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              icon={<SpeedIcon />} 
              label="Setup in 5 minutes" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
          </Box>
            }}
          >
            Choose the perfect plan for your team. Always know what you'll pay.
          </Typography>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4} alignItems="stretch" justifyContent="center" sx={{ pt: 4, pb: 2 }}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.featured ? '3px solid #667eea' : '1px solid #e0e0e0',
                  transform: plan.featured ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: plan.featured ? 6 : 2,
                  mt: plan.featured ? 0 : 2,
                  '&:hover': {
                    transform: plan.featured ? 'scale(1.08)' : 'scale(1.03)',
                    boxShadow: 8
                  }
                }}
              >
                {plan.featured && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: '#667eea',
                      color: 'white',
                      px: 3,
                      py: 0.75,
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: 1,
                      whiteSpace: 'nowrap',
                      zIndex: 1,
                      boxShadow: 3
                    }}
                  >
                    MOST POPULAR
                  </Box>
                )}
                <CardContent sx={{ p: 4, pt: plan.featured ? 7 : 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    fontWeight={700}
                    color={plan.featured ? 'primary' : 'text.primary'}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {plan.description}
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      variant="h2"
                      component="span"
                      fontWeight={700}
                      sx={{
                        background: plan.featured
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'inherit',
                        WebkitBackgroundClip: plan.featured ? 'text' : 'inherit',
                        WebkitTextFillColor: plan.featured ? 'transparent' : 'inherit'
                      }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="span"
                      color="text.secondary"
                    >
                      {plan.period}
                    </Typography>
                  </Box>
                  <List sx={{ mb: 3, flexGrow: 1 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ py: 1, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon sx={{ color: '#667eea' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant={plan.buttonVariant}
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      ...(plan.featured && {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                        }
                      })
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Have questions? We're here to help.
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'left', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Can I change plans later?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'left', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Do you offer refunds?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We offer a 30-day money-back guarantee for all paid plans. No questions asked.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'left', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  What payment methods do you accept?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'left', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Is there a free trial?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! All paid plans come with a 14-day free trial. No credit card required.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
