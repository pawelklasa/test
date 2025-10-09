import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupsIcon from '@mui/icons-material/Groups';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: '80px', // Account for navbar
  boxSizing: 'border-box',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
  }
}));

const FloatingCard = styled(Card)(({ theme, delay }) => ({
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[20],
  }
}));

const AnimatedBox = styled(Box)(({ delay }) => ({
  animation: `${fadeInUp} 0.8s ease-out forwards`,
  animationDelay: `${delay}s`,
  opacity: 0,
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  '& .stat-number': {
    fontSize: '3rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
}));

const FeatureIcon = styled(Box)(({ theme, color }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
  '& svg': {
    fontSize: '2.5rem',
    color: color,
  }
}));

function LandingPage({ onGetStarted, onLogin }) {
  const features = [
    {
      icon: <TimelineIcon />,
      title: 'Visual Gap Analysis',
      description: 'Identify product gaps with intuitive visual tools that make complex data simple to understand.',
      color: '#667eea'
    },
    {
      icon: <InsightsIcon />,
      title: 'Actionable Insights',
      description: 'Transform raw data into strategic insights that drive product decisions and growth.',
      color: '#f093fb'
    },
    {
      icon: <GroupsIcon />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your team to prioritize and close gaps faster.',
      color: '#4facfe'
    },
    {
      icon: <SpeedIcon />,
      title: 'Real-time Tracking',
      description: 'Monitor progress and measure impact with real-time analytics and reporting.',
      color: '#43e97b'
    },
    {
      icon: <CheckCircleIcon />,
      title: 'Smart Prioritization',
      description: 'AI-powered recommendations help you focus on what matters most.',
      color: '#fa709a'
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Growth Metrics',
      description: 'Track improvements and showcase ROI with comprehensive metrics.',
      color: '#fee140'
    },
    {
      icon: <BarChartIcon />,
      title: 'Data Visualization',
      description: 'Interactive charts and dashboards to visualize your product gaps and trends.',
      color: '#9c27b0'
    },
    {
      icon: <AutorenewIcon />,
      title: 'Automated Workflows',
      description: 'Automate repetitive tasks and streamline your gap analysis process.',
      color: '#00acc1'
    },
    {
      icon: <IntegrationInstructionsIcon />,
      title: 'Integration Hub',
      description: 'Connect with your favorite tools and sync data seamlessly across platforms.',
      color: '#ff6f00'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center' }}>
                <AnimatedBox delay={0}>
                  <Typography
                    variant="h1"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      mb: 2,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    Close the Gap Between Vision & Reality
                  </Typography>
                </AnimatedBox>

                <AnimatedBox delay={0.2}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255,255,255,0.95)',
                      mb: 4,
                      fontWeight: 300,
                      fontSize: { xs: '1.1rem', md: '1.5rem' },
                      maxWidth: '800px',
                      mx: 'auto'
                    }}
                  >
                    The most intuitive gap analysis platform for product teams who want to build better, faster.
                  </Typography>
                </AnimatedBox>

                <AnimatedBox delay={0.4}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onGetStarted}
                      sx={{
                        bgcolor: 'white',
                        color: '#667eea',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={onLogin}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </AnimatedBox>

                <AnimatedBox delay={0.6}>
                  <Box sx={{ display: 'flex', gap: 3, mt: 4, color: 'white', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" /> No credit card required
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" /> Free 14-day trial
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" /> Cancel anytime
                    </Typography>
                  </Box>
                </AnimatedBox>

                <AnimatedBox delay={0.8}>
                  <Box sx={{ display: 'flex', gap: 4, mt: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <FloatingCard delay={0} sx={{ width: { xs: '100%', sm: '300px' }, maxWidth: '350px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">📊 Gap Identified</Typography>
                        <Typography variant="body2" color="text.secondary">
                          3 critical product gaps detected in user onboarding flow
                        </Typography>
                      </CardContent>
                    </FloatingCard>

                    <FloatingCard delay={1} sx={{ width: { xs: '100%', sm: '300px' }, maxWidth: '350px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="secondary">✨ Insight Generated</Typography>
                        <Typography variant="body2" color="text.secondary">
                          AI recommends prioritizing mobile experience improvements
                        </Typography>
                      </CardContent>
                    </FloatingCard>
                  </Box>
                </AnimatedBox>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4} md={4}>
              <StatBox>
                <Typography className="stat-number">10x</Typography>
                <Typography variant="h6" color="text.secondary">Faster Analysis</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <StatBox>
                <Typography className="stat-number">95%</Typography>
                <Typography variant="h6" color="text.secondary">User Satisfaction</Typography>
              </StatBox>
            </Grid>
            <Grid item xs={12} sm={4} md={4}>
              <StatBox>
                <Typography className="stat-number">500+</Typography>
                <Typography variant="h6" color="text.secondary">Product Teams</Typography>
              </StatBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.default', py: 10, px: { xs: 2, sm: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', px: 2 }}>
              Powerful features designed to help product teams identify gaps, make data-driven decisions, and ship better products.
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Grid
              container
              spacing={4}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 4
              }}
            >
              {features.map((feature, index) => (
                <Box key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease',
                      boxShadow: 3,
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: 6,
                      }
                    }}
                  >
                    <CardContent sx={{
                      p: 4,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}>
                      <Box sx={{ mb: 2 }}>
                        <FeatureIcon color={feature.color}>
                          {feature.icon}
                        </FeatureIcon>
                      </Box>
                      <Typography
                        variant="h5"
                        gutterBottom
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          mb: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2
            }}
          >
            Ready to Transform Your Product Strategy?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4
            }}
          >
            Join hundreds of product teams already using G.A.P to build better products.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onGetStarted}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }
            }}
          >
            Start Your Free Trial
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
