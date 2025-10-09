import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h3" color="primary" gutterBottom>About G.A.P</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        G.A.P is a professional gap analysis app designed for product owners and teams. Our platform helps you identify, visualize, and close gaps in your product strategy, ensuring you deliver maximum value to your users and stakeholders.
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        With intuitive dashboards, actionable insights, and collaborative tools, G.A.P empowers you to make data-driven decisions and continuously improve your product.
      </Typography>
    </Container>
  );
}
