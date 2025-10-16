import { useState, useEffect, useCallback, useContext } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import EmailIcon from '@mui/icons-material/Email';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useTheme } from './ThemeContext';
import { useProject } from './ProjectContext';
import './utils/fixAdminRoles'; // Import role fix utility
import './utils/fixGmailUserMapping'; // Import Gmail user mapping fix
import './utils/debugOrgProjects'; // Import organization projects debug
import './utils/debugMemberContext'; // Import member context debug
import './utils/fixMemberUserMapping'; // Import member user mapping fix
import './utils/disableAutoOrgCreation'; // Import auto-org creation disabler
import './utils/checkUserProjects'; // Import user projects checker
import { useOrganization } from './OrganizationContext';
import { trackSearchUsed } from './services/analytics';

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

const menuItems = [
  { text: 'Projects', icon: <FolderIcon />, path: '/dashboard/projects' },
  { text: 'Time to Market', icon: <AccessTimeIcon />, path: '/dashboard/ttl' },
  { text: 'Portfolio Roadmap', icon: <TimelineIcon />, path: '/dashboard/roadmap' },
  { text: 'Feature Lifecycle', icon: <AutorenewIcon />, path: '/dashboard/lifecycle' },
  { text: 'Jira Integration', icon: <IntegrationInstructionsIcon />, path: '/dashboard/jira', adminOnly: true },
  { text: 'Team Management', icon: <PeopleIcon />, path: '/dashboard/team', adminOnly: true },
  { text: 'Analytics Dashboard', icon: <BarChartIcon />, path: '/dashboard/analytics', adminOnly: true },
  { text: 'User Tracking', icon: <TrackChangesIcon />, path: '/dashboard/user-tracking', adminOnly: true },
  { text: 'Email Management', icon: <EmailIcon />, path: '/dashboard/email-management', adminOnly: true },
  { text: 'Email Setup', icon: <SettingsIcon />, path: '/dashboard/email-setup', adminOnly: true },
  { text: 'Usage & Billing', icon: <PaymentIcon />, path: '/dashboard/usage-limits', adminOnly: true },
  { text: 'Billing & Subscription', icon: <PaymentIcon />, path: '/dashboard/billing', adminOnly: true },
  { text: 'Organization Settings', icon: <SettingsIcon />, path: '/dashboard/organization/settings', adminOnly: true },
  { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/dashboard/admin', adminOnly: true }
];

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const { mode, toggleTheme } = useTheme();
  const { selectedProject, setSelectedProject, projects } = useProject();
  const { currentOrganization, userRole } = useOrganization();



  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log('🔍 DashboardLayout: Auth state changed:', currentUser?.uid);
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await auth.signOut();
      // Navigation will be handled by the auth state change in App.js
      // No need to navigate manually here
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = useCallback(async (value) => {
    if (!value.trim() || !currentOrganization?.id) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    trackSearchUsed(value.trim(), selectedProject || 'all_projects');
    setSearching(true);
    setSearchOpen(true);

    try {
      const results = [];
      const searchLower = value.toLowerCase();
      const projectsToSearch = selectedProject
        ? projects.filter(p => p.id === selectedProject)
        : projects;

      for (const project of projectsToSearch) {
        const featuresRef = collection(db, 'organizations', currentOrganization.id, 'projects', project.id, 'features');
        const snapshot = await getDocs(featuresRef);

        snapshot.docs.forEach(doc => {
          const feature = { id: doc.id, ...doc.data() };
          if (feature.name?.toLowerCase().includes(searchLower) ||
              feature.desc?.toLowerCase().includes(searchLower) ||
              feature.category?.toLowerCase().includes(searchLower)) {
            results.push({
              ...feature,
              projectName: project.name
            });
          }
        });
      }

      setSearchResults(results.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }, [selectedProject, projects, currentOrganization?.id]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, handleSearch]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    console.log('🔍 DashboardLayout: No user, redirecting to home');
    return <Navigate to="/" replace />;
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: collapsed ? collapsedDrawerWidth : drawerWidth, transition: 'width 0.2s' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', display: collapsed ? 'none' : 'block' }}>
          Gapple
        </Typography>
        <IconButton size="small" onClick={() => setCollapsed(c => !c)} sx={{ ml: collapsed ? 0 : 1 }}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List sx={{ flex: 1, px: collapsed ? 0.5 : 2 }}>
        {menuItems
          .filter(item => !item.adminOnly || userRole === 'owner' || userRole === 'admin')
          .map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  bgcolor: isSelected ? (mode === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.08)') : 'transparent',
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  height: collapsed ? 56 : 'auto',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: collapsed ? 40 : 'auto',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: collapsed ? 'flex' : 'block', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 1.5,
            p: 1.5,
            borderRadius: 2,
            cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start',
            '&:hover': { bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.05)' : 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {user?.email?.[0].toUpperCase() || 'U'}
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email?.split('@')[0] || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Free Plan
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${collapsed ? collapsedDrawerWidth : drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          transition: 'width 0.2s, margin 0.2s',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: 'relative', mr: 2, ml: 0, width: { xs: '100%', sm: 'auto' }, flexGrow: { xs: 1, sm: 0 } }}>
              <Box sx={{ position: 'relative', borderRadius: 1, bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' } }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', pl: 2, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <InputBase
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  sx={{ width: { xs: '100%', sm: 300 }, '& .MuiInputBase-input': { py: 1.5, pl: 6, pr: 2, fontSize: '0.875rem' } }}
                />
              </Box>

              {/* Search Results Dropdown */}
              {searchOpen && searchQuery && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    mt: 0.5,
                    maxHeight: 400,
                    overflow: 'auto',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  {searching ? (
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Searching...
                      </Typography>
                    </Box>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <MenuItem
                        key={result.id}
                        onClick={() => {
                          // Navigate to project dashboard with feature ID as URL param
                          navigate(`/dashboard/project/${result.projectId}?featureId=${result.id}`);
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderBottom: index < searchResults.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {result.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                          {result.projectName} • {result.category}
                        </Typography>
                        {result.desc && (
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.3
                          }}>
                            {result.desc}
                          </Typography>
                        )}
                      </MenuItem>
                    ))
                  ) : searchQuery.length > 0 ? (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No features found matching "{searchQuery}"
                      </Typography>
                    </Box>
                  ) : null}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>

          <Box sx={{ flexGrow: 1 }} />

          {projects.length > 0 && (
            <FormControl size="small" sx={{ mr: 2, minWidth: 200, display: { xs: 'none', md: 'block' } }}>
              <Select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 1, '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)', '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' } }}
              >
                <MenuItem value="">
                  <Typography variant="body2" color="text.secondary">All Projects</Typography>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Typography variant="body2">{project.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Box>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {user?.email?.[0].toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}>
        {drawer}
      </Drawer>

      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, width: collapsed ? collapsedDrawerWidth : drawerWidth, flexShrink: 0, transition: 'width 0.2s', '& .MuiDrawer-paper': { width: collapsed ? collapsedDrawerWidth : drawerWidth, boxSizing: 'border-box', border: 'none', borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper', transition: 'width 0.2s' } }} open>
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` }, bgcolor: 'background.default', minHeight: '100vh', pt: 11 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;