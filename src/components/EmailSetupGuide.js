import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Link,
  Chip,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  BugReport as DebugIcon
} from '@mui/icons-material';
import { emailService } from '../utils/emailService';

const EmailSetupGuide = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleTestEmail = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await emailService.sendInvitationEmail(testEmail, {
        organizationName: 'Test Organization',
        invitedByName: 'Test User',
        invitationLink: `${window.location.origin}/accept-invitation?token=test123`,
        role: 'member'
      });

      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Test email sent successfully! Check your inbox.' 
          : `Failed to send: ${result.error}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const steps = [
    {
      label: 'Sign up for EmailJS',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            EmailJS allows you to send emails directly from your React app without a backend server.
          </Typography>
          <Button
            variant="contained"
            href="https://www.emailjs.com/"
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<EmailIcon />}
          >
            Sign up at EmailJS.com
          </Button>
        </Box>
      )
    },
    {
      label: 'Create Email Service',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            1. In your EmailJS dashboard, click "Add New Service"<br/>
            2. Choose your email provider (Gmail, Outlook, etc.)<br/>
            3. Follow the setup instructions<br/>
            4. Copy your <strong>Service ID</strong>
          </Typography>
          <Alert severity="info">
            Example Service ID: <code>service_abc123</code>
          </Alert>
        </Box>
      )
    },
    {
      label: 'Create Email Template',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            1. Go to "Email Templates" and click "Create New Template"<br/>
            2. Design your invitation email template<br/>
            3. Use these template variables:
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            {`{{to_name}} - Recipient's name
{{organization_name}} - Your organization
{{invited_by_name}} - Your name  
{{invitation_link}} - Acceptance link
{{user_role}} - User's role`}
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            4. Copy your <strong>Template ID</strong>
          </Typography>
          <Alert severity="info" sx={{ mt: 1 }}>
            Example Template ID: <code>template_xyz789</code>
          </Alert>
        </Box>
      )
    },
    {
      label: 'Get Public Key',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            1. Go to "Account" → "General"<br/>
            2. Find your <strong>Public Key</strong><br/>
            3. Copy the key
          </Typography>
          <Alert severity="info">
            Example Public Key: <code>user_def456</code>
          </Alert>
        </Box>
      )
    },
    {
      label: 'Configure Environment Variables',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            Create a <code>.env</code> file in your project root with:
          </Typography>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            {`REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id  
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key`}
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Don't commit your <code>.env</code> file to version control!
          </Alert>
        </Box>
      )
    },
    {
      label: 'Test Email Sending',
      content: (
        <Box>
          <Typography variant="body2" paragraph>
            Test that emails are working correctly:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Test Email Address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
              size="small"
              placeholder="your-email@example.com"
            />
            <Button
              variant="contained"
              onClick={handleTestEmail}
              disabled={!testEmail || testing}
              startIcon={testing ? <SettingsIcon /> : <EmailIcon />}
            >
              {testing ? 'Sending...' : 'Send Test'}
            </Button>
          </Box>
          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {testResult.message}
            </Alert>
          )}
        </Box>
      )
    }
  ];

  const isConfigured = emailService.isEmailJSConfigured?.() || false;

  return (
    <>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <EmailIcon color="primary" />
          <Typography variant="h6">
            Email Setup Guide
          </Typography>
          {isConfigured && (
            <Chip 
              icon={<CheckIcon />} 
              label="Configured" 
              color="success" 
              size="small" 
            />
          )}
        </Box>

        {!isConfigured && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Email sending is currently in mock mode. Follow this guide to send real emails.
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
                {step.label}
              </StepLabel>
              <StepContent>
                {step.content}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(index + 1)}
                    sx={{ mr: 1 }}
                    disabled={index === steps.length - 1}
                  >
                    {index === steps.length - 1 ? 'Complete' : 'Next'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={() => setActiveStep(index - 1)}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {isConfigured && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              ✅ EmailJS is configured! Invitation emails will be sent automatically.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export default EmailSetupGuide;
