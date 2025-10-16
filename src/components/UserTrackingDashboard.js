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
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  Timeline,
  Mouse,
  AccessTime,
  DeviceHub,
  LocationOn,
  Settings
} from '@mui/icons-material';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { stripeAnalytics, trackPageView, trackFeatureClick } from '../utils/stripeAnalytics';

/**
 * Advanced User Behavior Tracking & Analytics
 */

const UserTrackingDashboard = ({ organizationId, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [trackingData, setTrackingData] = useState({
    sessions: [],
    pageViews: [],
    featureUsage: [],
    activeUsers: 0,
    conversionFunnel: {},
    userJourneys: []
  });

  // ============================================================================
  // TRACKING INITIALIZATION
  // ============================================================================

  useEffect(() => {
    if (trackingEnabled && organizationId && currentUser?.uid) {
      initializeTracking();
      loadTrackingData();
    }
  }, [organizationId, currentUser, trackingEnabled]);

  const initializeTracking = () => {
    // Track page view when component mounts
    trackPageView(organizationId, currentUser.uid, 'user_tracking_dashboard', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });

    // Set up page visibility tracking
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up click tracking
    document.addEventListener('click', handleGlobalClick);
    
    // Track session start
    trackSessionStart();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleGlobalClick);
    };
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleVisibilityChange = () => {
    if (document.hidden) {
      trackPageView(organizationId, currentUser.uid, 'page_hidden', {
        timestamp: new Date().toISOString(),
        hiddenAt: Date.now()
      });
    } else {
      trackPageView(organizationId, currentUser.uid, 'page_visible', {
        timestamp: new Date().toISOString(),
        visibleAt: Date.now()
      });
    }
  };

  const handleGlobalClick = (event) => {
    if (!trackingEnabled) return;

    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    const className = target.className;
    const id = target.id;
    const text = target.textContent?.substring(0, 50);

    // Track button clicks, link clicks, and significant interactions
    if (tagName === 'button' || tagName === 'a' || className.includes('clickable')) {
      trackFeatureClick(organizationId, currentUser.uid, 'ui_interaction', {
        element: tagName,
        className,
        id,
        text,
        timestamp: new Date().toISOString(),
        coordinates: { x: event.clientX, y: event.clientY }
      });
    }
  };

  const trackSessionStart = () => {
    const sessionId = `session_${currentUser.uid}_${Date.now()}`;
    
    stripeAnalytics.trackSession(organizationId, currentUser.uid, {
      sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    });

    // Store session ID for later use
    window.currentSessionId = sessionId;
  };

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      // Load recent sessions
      const sessionsQuery = query(
        collection(db, 'user_sessions'),
        where('organizationId', '==', organizationId),
        orderBy('startTime', 'desc'),
        limit(50)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load usage analytics
      const usageData = await stripeAnalytics.getUsageAnalytics(organizationId, 7);
      
      // Process conversion funnel data
      const funnelData = await calculateConversionFunnel();
      
      // Calculate active users
      const activeUsers = await calculateActiveUsers();

      setTrackingData({
        sessions,
        pageViews: extractPageViews(usageData),
        featureUsage: extractFeatureUsage(usageData),
        activeUsers,
        conversionFunnel: funnelData,
        userJourneys: sessions.slice(0, 10) // Top 10 recent journeys
      });

    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  const extractPageViews = (usageData) => {
    return usageData
      .filter(item => item.feature?.includes('page_view'))
      .map(item => ({
        page: item.feature.replace('page_view_', ''),
        views: item.totalUsage,
        date: item.date
      }));
  };

  const extractFeatureUsage = (usageData) => {
    return usageData
      .filter(item => item.feature?.includes('feature_'))
      .map(item => ({
        feature: item.feature.replace('feature_', ''),
        usage: item.totalUsage,
        date: item.date
      }));
  };

  const calculateConversionFunnel = async () => {
    try {
      // Define funnel steps
      const funnelSteps = [
        'landing_page',
        'sign_up',
        'onboarding_complete',
        'first_project',
        'active_user'
      ];

      const funnel = {};
      
      for (const step of funnelSteps) {
        const stepQuery = query(
          collection(db, 'usage_analytics'),
          where('organizationId', '==', organizationId),
          where('feature', '==', step)
        );
        const stepSnapshot = await getDocs(stepQuery);
        funnel[step] = stepSnapshot.size;
      }

      return funnel;
    } catch (error) {
      console.error('Error calculating conversion funnel:', error);
      return {};
    }
  };

  const calculateActiveUsers = async () => {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const activeQuery = query(
        collection(db, 'usage_analytics'),
        where('organizationId', '==', organizationId),
        where('timestamp', '>=', last24Hours)
      );
      
      const activeSnapshot = await getDocs(activeQuery);
      const uniqueUsers = new Set();
      
      activeSnapshot.docs.forEach(doc => {
        uniqueUsers.add(doc.data().userId);
      });

      return uniqueUsers.size;
    } catch (error) {
      console.error('Error calculating active users:', error);
      return 0;
    }
  };

  // ============================================================================
  // COMPONENT SECTIONS
  // ============================================================================

  const TrackingControls = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tracking Controls
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={trackingEnabled}
                  onChange={(e) => setTrackingEnabled(e.target.checked)}
                />
              }
              label="Enable User Tracking"
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Switch
                  checked={realTimeEnabled}
                  onChange={(e) => setRealTimeEnabled(e.target.checked)}
                />
              }
              label="Real-time Updates"
            />
          </Grid>
        </Grid>
        {!trackingEnabled && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            User tracking is disabled. Enable it to see analytics data.
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const ActiveUsersCard = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <DeviceHub sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h6">Active Users (24h)</Typography>
        </Box>
        <Typography variant="h3" color="success.main">
          {trackingData.activeUsers}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Unique users in the last 24 hours
        </Typography>
      </CardContent>
    </Card>
  );

  const PageViewsTable = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Visibility sx={{ mr: 1, verticalAlign: 'middle' }} />
          Page Views (Last 7 days)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Page</TableCell>
                <TableCell align="right">Views</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackingData.pageViews.map((page, index) => (
                <TableRow key={index}>
                  <TableCell>{page.page}</TableCell>
                  <TableCell align="right">{page.views}</TableCell>
                  <TableCell align="right">{page.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const FeatureUsageTable = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Mouse sx={{ mr: 1, verticalAlign: 'middle' }} />
          Feature Usage
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell>
                <TableCell align="right">Usage Count</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackingData.featureUsage.map((feature, index) => (
                <TableRow key={index}>
                  <TableCell>{feature.feature}</TableCell>
                  <TableCell align="right">{feature.usage}</TableCell>
                  <TableCell align="right">{feature.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const SessionsTable = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
          Recent Sessions
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackingData.sessions.slice(0, 10).map((session, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {session.sessionId?.substring(0, 12)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{session.userId?.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {session.duration ? `${Math.round(session.duration / 1000)}s` : 'Active'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={session.actions?.length || 0} 
                      variant="outlined" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          User Tracking Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Tracking Dashboard
      </Typography>
      
      <TrackingControls />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ActiveUsersCard />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <PageViewsTable />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FeatureUsageTable />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SessionsTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserTrackingDashboard;
