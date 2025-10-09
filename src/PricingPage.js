import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function PricingPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h3" color="primary" gutterBottom>Pricing</Typography>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 4 }}>
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, minWidth: 220 }}>
          <Typography variant="h5" color="secondary" gutterBottom>Free</Typography>
          <Typography variant="body2">Basic gap analysis tools<br />Up to 2 projects<br />Community support</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>$0/month</Typography>
        </Box>
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, minWidth: 220 }}>
          <Typography variant="h5" color="secondary" gutterBottom>Pro</Typography>
          <Typography variant="body2">Advanced analytics<br />Unlimited projects<br />Priority support</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>$19/month</Typography>
        </Box>
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, minWidth: 220 }}>
          <Typography variant="h5" color="secondary" gutterBottom>Enterprise</Typography>
          <Typography variant="body2">Custom integrations<br />Dedicated onboarding<br />Enterprise support</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Contact us</Typography>
        </Box>
      </Box>
    </Container>
  );
}
