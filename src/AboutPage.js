import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpeedIcon from '@mui/icons-material/Speed';

export default function AboutPage() {
  const values = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: 50 }} />,
      title: 'Data-Driven',
      description: 'Make informed decisions backed by comprehensive analytics and insights'
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 50 }} />,
      title: 'Collaborative',
      description: 'Built for teams to work together seamlessly on product strategy'
    },
    {
      icon: <LightbulbIcon sx={{ fontSize: 50 }} />,
      title: 'Innovative',
      description: 'Cutting-edge tools to identify and close product gaps faster'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 50 }} />,
      title: 'Efficient',
      description: 'Streamline your workflow and accelerate product development'
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
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            About G.A.P
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 300,
              lineHeight: 1.6
            }}
          >
            Empowering product teams to bridge the gap between vision and execution
          </Typography>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom fontWeight={700} color="primary">
              Our Mission
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              G.A.P is a professional gap analysis platform designed for product owners and teams who want to deliver exceptional results.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              Our platform helps you identify, visualize, and close gaps in your product strategy, ensuring you deliver maximum value to your users and stakeholders.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              With intuitive dashboards, actionable insights, and collaborative tools, G.A.P empowers you to make data-driven decisions and continuously improve your product.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: 400,
                background: 'linear-gradient(135deg, #667eea22 0%, #764ba244 100%)',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h1" sx={{ fontSize: 120, opacity: 0.3 }}>
                📊
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Values Section */}
      <Box sx={{ bgcolor: 'background.default', py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            fontWeight={700}
            sx={{
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Our Core Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ color: '#667eea', mb: 2 }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} textAlign="center">
          <Grid item xs={12} md={4}>
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              500+
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Product Teams
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              10,000+
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Gaps Identified
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              95%
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Customer Satisfaction
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
