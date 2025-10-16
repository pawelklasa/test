import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Email,
  Send,
  Schedule,
  History,
  Settings,
  Notifications,
  MarkunreadMailbox,
  Refresh,
  Add
} from '@mui/icons-material';
import { 
  emailService, 
  sendWelcomeEmail, 
  sendBillingAlert, 
  sendUsageWarning,
  scheduleOnboarding 
} from '../utils/emailService';

/**
 * Email Management Dashboard for controlling automated notifications
 */

const EmailManagementDashboard = ({ organizationId, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [emailHistory, setEmailHistory] = useState([]);
  const [emailPreferences, setEmailPreferences] = useState({});
  const [testEmailDialog, setTestEmailDialog] = useState(false);
  const [announceDialog, setAnnounceDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [announcement, setAnnouncement] = useState({
    title: '',
    description: '',
    benefits: [''],
    learnMoreUrl: ''
  });
  const [stats, setStats] = useState({
    totalSent: 0,
    deliveryRate: 0,
    openRate: 0,
    recentEmails: []
  });

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    if (organizationId && currentUser) {
      loadEmailData();
    }
  }, [organizationId, currentUser]);

  const loadEmailData = async () => {
    setLoading(true);
    try {
      // Load email history
      const history = await emailService.getEmailHistory(organizationId);
      setEmailHistory(history);

      // Load email preferences
      const preferences = await emailService.getEmailPreferences(currentUser.uid);
      setEmailPreferences(preferences);

      // Calculate stats
      const totalSent = history.filter(email => email.status === 'sent').length;
      const totalEmails = history.length;
      const deliveryRate = totalEmails > 0 ? (totalSent / totalEmails) * 100 : 0;

      setStats({
        totalSent,
        deliveryRate,
        openRate: 0, // Would need email tracking to calculate
        recentEmails: history.slice(0, 5)
      });

    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // EMAIL ACTIONS
  // ============================================================================

  const handleSendTestEmail = async () => {
    try {
      const result = await sendWelcomeEmail(
        testEmail,
        currentUser.displayName || 'Test User',
        'Test Organization'
      );

      if (result.success) {
        alert('Test email sent successfully!');
      } else {
        alert('Failed to send test email: ' + result.error);
      }
    } catch (error) {
      alert('Error sending test email: ' + error.message);
    }
    setTestEmailDialog(false);
    setTestEmail('');
  };

  const handleSendAnnouncement = async () => {
    try {
      // This would typically send to all users in the organization
      const result = await emailService.sendFeatureAnnouncement(
        currentUser.email,
        {
          featureTitle: announcement.title,
          description: announcement.description,
          benefits: announcement.benefits.filter(b => b.trim()),
          learnMoreUrl: announcement.learnMoreUrl,
          organizationName: 'Your Organization'
        },
        { organizationId }
      );

      if (result.success) {
        alert('Announcement sent successfully!');
        setAnnouncement({
          title: '',
          description: '',
          benefits: [''],
          learnMoreUrl: ''
        });
      } else {
        alert('Failed to send announcement: ' + result.error);
      }
    } catch (error) {
      alert('Error sending announcement: ' + error.message);
    }
    setAnnounceDialog(false);
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      const result = await emailService.updateEmailPreferences(
        currentUser.uid,
        newPreferences
      );

      if (result.success) {
        setEmailPreferences(newPreferences);
        alert('Email preferences updated successfully!');
      } else {
        alert('Failed to update preferences: ' + result.error);
      }
    } catch (error) {
      alert('Error updating preferences: ' + error.message);
    }
  };

  const handleProcessQueue = async () => {
    try {
      await emailService.processEmailQueue();
      alert('Email queue processed successfully!');
      await loadEmailData(); // Reload data
    } catch (error) {
      alert('Error processing queue: ' + error.message);
    }
  };

  // ============================================================================
  // COMPONENT SECTIONS
  // ============================================================================

  const EmailStatsCards = () => (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Email sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Sent</Typography>
            </Box>
            <Typography variant="h4">{stats.totalSent}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <MarkunreadMailbox sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Delivery Rate</Typography>
            </Box>
            <Typography variant="h4">{stats.deliveryRate.toFixed(1)}%</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Notifications sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Recent Emails</Typography>
            </Box>
            <Typography variant="h4">{stats.recentEmails.length}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              <Schedule sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Queue Status</Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleProcessQueue}
              size="small"
            >
              Process Queue
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const EmailHistoryTable = () => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            Email History
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={loadEmailData}
            size="small"
          >
            Refresh
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Recipient</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent At</TableCell>
                <TableCell>Template</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emailHistory.map((email, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Chip
                      label={email.type || 'unknown'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{email.userEmail}</TableCell>
                  <TableCell>
                    <Chip
                      label={email.status}
                      color={email.status === 'sent' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {email.timestamp ? 
                      new Date(email.timestamp.seconds * 1000).toLocaleString() :
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {email.templateId}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const EmailPreferencesCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
          Email Preferences
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailPreferences.billing || false}
                  onChange={(e) => handleUpdatePreferences({
                    ...emailPreferences,
                    billing: e.target.checked
                  })}
                />
              }
              label="Billing Notifications"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailPreferences.usage_alerts || false}
                  onChange={(e) => handleUpdatePreferences({
                    ...emailPreferences,
                    usage_alerts: e.target.checked
                  })}
                />
              }
              label="Usage Alerts"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailPreferences.announcements || false}
                  onChange={(e) => handleUpdatePreferences({
                    ...emailPreferences,
                    announcements: e.target.checked
                  })}
                />
              }
              label="Feature Announcements"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailPreferences.onboarding || false}
                  onChange={(e) => handleUpdatePreferences({
                    ...emailPreferences,
                    onboarding: e.target.checked
                  })}
                />
              }
              label="Onboarding Emails"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailPreferences.marketing || false}
                  onChange={(e) => handleUpdatePreferences({
                    ...emailPreferences,
                    marketing: e.target.checked
                  })}
                />
              }
              label="Marketing Emails"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const QuickActionsCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Send />}
              onClick={() => setTestEmailDialog(true)}
            >
              Send Test Email
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Notifications />}
              onClick={() => setAnnounceDialog(true)}
            >
              Send Announcement
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Schedule />}
              onClick={handleProcessQueue}
            >
              Process Email Queue
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={() => scheduleOnboarding(currentUser.email, {
                organizationName: 'Test Organization'
              })}
            >
              Test Onboarding Sequence
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // DIALOGS
  // ============================================================================

  const TestEmailDialog = () => (
    <Dialog open={testEmailDialog} onClose={() => setTestEmailDialog(false)}>
      <DialogTitle>Send Test Email</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTestEmailDialog(false)}>Cancel</Button>
        <Button onClick={handleSendTestEmail} variant="contained">
          Send Test
        </Button>
      </DialogActions>
    </Dialog>
  );

  const AnnouncementDialog = () => (
    <Dialog 
      open={announceDialog} 
      onClose={() => setAnnounceDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Send Feature Announcement</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Feature Title"
              value={announcement.title}
              onChange={(e) => setAnnouncement({
                ...announcement,
                title: e.target.value
              })}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={announcement.description}
              onChange={(e) => setAnnouncement({
                ...announcement,
                description: e.target.value
              })}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Benefits
            </Typography>
            {announcement.benefits.map((benefit, index) => (
              <TextField
                key={index}
                fullWidth
                label={`Benefit ${index + 1}`}
                value={benefit}
                onChange={(e) => {
                  const newBenefits = [...announcement.benefits];
                  newBenefits[index] = e.target.value;
                  setAnnouncement({
                    ...announcement,
                    benefits: newBenefits
                  });
                }}
                sx={{ mb: 1 }}
              />
            ))}
            <Button
              size="small"
              onClick={() => setAnnouncement({
                ...announcement,
                benefits: [...announcement.benefits, '']
              })}
            >
              Add Benefit
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Learn More URL"
              type="url"
              value={announcement.learnMoreUrl}
              onChange={(e) => setAnnouncement({
                ...announcement,
                learnMoreUrl: e.target.value
              })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAnnounceDialog(false)}>Cancel</Button>
        <Button onClick={handleSendAnnouncement} variant="contained">
          Send Announcement
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Email Management
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Email Management Dashboard
      </Typography>

      <EmailStatsCards />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <EmailHistoryTable />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <QuickActionsCard />
            </Grid>
            <Grid item xs={12}>
              <EmailPreferencesCard />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <TestEmailDialog />
      <AnnouncementDialog />
    </Box>
  );
};

export default EmailManagementDashboard;
