import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Send,
  Schedule,
  History,
  Settings,
  Notifications,
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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
          Total Sent
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {stats.totalSent}
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
          Delivery Rate
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
          {stats.deliveryRate.toFixed(1)}%
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
          Recent Emails
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
          {stats.recentEmails.length}
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
          Email Queue
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleProcessQueue}
          size="small"
          fullWidth
          sx={{ mt: 1 }}
        >
          Process
        </Button>
      </Box>
    </Box>
  );

  const EmailHistoryTable = () => (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <History />
          Email History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadEmailData}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Sent At</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Template</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emailHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No email history available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              emailHistory.map((email, index) => (
                <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
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
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {email.templateId}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const EmailPreferencesCard = () => (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Settings />
        Email Preferences
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
      </Box>
    </Box>
  );

  const QuickActionsCard = () => (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
        Quick Actions
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Send />}
          onClick={() => setTestEmailDialog(true)}
        >
          Send Test Email
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Notifications />}
          onClick={() => setAnnounceDialog(true)}
        >
          Send Announcement
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Schedule />}
          onClick={handleProcessQueue}
        >
          Process Email Queue
        </Button>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          onClick={() => scheduleOnboarding(currentUser.email, {
            organizationName: 'Test Organization'
          })}
        >
          Test Onboarding
        </Button>
      </Box>
    </Box>
  );

  // ============================================================================
  // DIALOGS
  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Loading email data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Cards */}
      <EmailStatsCards />

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <EmailHistoryTable />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <QuickActionsCard />
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <EmailPreferencesCard />
          </Box>
        </Box>
      </Box>

      {/* Test Email Dialog */}
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

      {/* Announcement Dialog */}
      <Dialog 
        open={announceDialog} 
        onClose={() => setAnnounceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Feature Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Feature Title"
            value={announcement.title}
            onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={announcement.description}
            onChange={(e) => setAnnouncement(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Benefits:</Typography>
          {announcement.benefits.map((benefit, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Benefit ${index + 1}`}
              value={benefit}
              onChange={(e) => {
                const newBenefits = [...announcement.benefits];
                newBenefits[index] = e.target.value;
                setAnnouncement(prev => ({ ...prev, benefits: newBenefits }));
              }}
              sx={{ mb: 1 }}
            />
          ))}
          <Button 
            onClick={() => setAnnouncement(prev => ({ 
              ...prev, 
              benefits: [...prev.benefits, ''] 
            }))}
            sx={{ mb: 2 }}
          >
            Add Benefit
          </Button>
          <TextField
            fullWidth
            label="Learn More URL (optional)"
            value={announcement.learnMoreUrl}
            onChange={(e) => setAnnouncement(prev => ({ ...prev, learnMoreUrl: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnounceDialog(false)}>Cancel</Button>
          <Button onClick={handleSendAnnouncement} variant="contained">
            Send Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailManagementDashboard;
