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
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  Mouse,
  AccessTime
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
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px',
      mb: 3
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2 }}>
        Tracking Controls
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={trackingEnabled}
              onChange={(e) => setTrackingEnabled(e.target.checked)}
            />
          }
          label="Enable User Tracking"
        />
        <FormControlLabel
          control={
            <Switch
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
            />
          }
          label="Real-time Updates"
        />
      </Box>
      {!trackingEnabled && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          User tracking is disabled. Enable it to see analytics data.
        </Alert>
      )}
    </Box>
  );

  const ActiveUsersCard = () => (
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
        Active Users (24h)
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
        {trackingData.activeUsers}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
        Unique users in the last 24 hours
      </Typography>
    </Box>
  );

  const PageViewsTable = () => (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Visibility />
        Page Views (Last 7 days)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Page</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Views</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackingData.pageViews.map((page, index) => (
              <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontSize: '0.85rem' }}>{page.page}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{page.views}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{page.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const FeatureUsageTable = () => (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Mouse />
        Feature Usage
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Usage Count</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackingData.featureUsage.map((feature, index) => (
              <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontSize: '0.85rem' }}>{feature.feature}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{feature.usage}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{feature.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const SessionsTable = () => (
    <Box sx={{
      p: 2,
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: '4px'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccessTime />
        Recent Sessions
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Session ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackingData.sessions.slice(0, 10).map((session, index) => (
              <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {session.sessionId?.substring(0, 12)}...
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>{session.userId?.substring(0, 8)}...</TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>
                  {session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>
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
    </Box>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Loading tracking data...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <TrackingControls />

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <ActiveUsersCard />

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
            Total Sessions
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {trackingData.sessions.length}
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
            Page Views
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>
            {trackingData.pageViews.reduce((sum, p) => sum + p.views, 0)}
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
            Feature Interactions
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
            {trackingData.featureUsage.reduce((sum, f) => sum + f.usage, 0)}
          </Typography>
        </Box>
      </Box>

      {/* Tables */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <PageViewsTable />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 400px' }}>
            <FeatureUsageTable />
          </Box>

          <Box sx={{ flex: '1 1 400px' }}>
            <SessionsTable />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserTrackingDashboard;
