import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GroupsIcon from '@mui/icons-material/Groups';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import HubIcon from '@mui/icons-material/Hub';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { getAuth } from 'firebase/auth';
import { useTheme } from './ThemeContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Visual Gap Analysis', icon: <VisibilityIcon />, path: '/dashboard/visual-gap-analysis' },
  { text: 'Actionable Insights', icon: <LightbulbIcon />, path: '/dashboard/actionable-insights' },
  { text: 'Team Collaboration', icon: <GroupsIcon />, path: '/dashboard/team-collaboration' },
  { text: 'Real-time Tracking', icon: <TrackChangesIcon />, path: '/dashboard/realtime-tracking' },
  { text: 'Smart Prioritization', icon: <AutoAwesomeIcon />, path: '/dashboard/smart-prioritization' },
  { text: 'Growth Metrics', icon: <TrendingUpIcon />, path: '/dashboard/growth-metrics' },
  { text: 'Data Visualization', icon: <BarChartIcon />, path: '/dashboard/data-visualization' },
  { text: 'Automated Workflows', icon: <AutorenewIcon />, path: '/dashboard/automated-workflows' },
  { text: 'Integration Hub', icon: <HubIcon />, path: '/dashboard/integration-hub' },
];

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;
  const { mode, toggleTheme } = useTheme();

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

  const handleLogout = () => {
    auth.signOut();
    handleMenuClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Logo */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          G.A.P
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => {
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
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sidebar Footer - User Profile */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.05)' : 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {user?.email?.[0].toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Free Plan
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.05)' : alpha('#000', 0.04),
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.08)' : alpha('#000', 0.06),
              },
              width: { xs: '100%', sm: 400 },
            }}
          >
            <Box sx={{ p: 1.5, pl: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <InputBase
                placeholder="Search..."
                sx={{
                  flex: 1,
                  fontSize: '0.875rem',
                  '& input::placeholder': {
                    opacity: 0.7,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                ⌘K
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Top Bar Actions */}
          <IconButton onClick={toggleTheme}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={() => navigate('/settings')}>
            <SettingsIcon />
          </IconButton>

          <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {user?.email?.[0].toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
