import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useTheme } from './ThemeContext';
import { useProject } from './ProjectContext';

const drawerWidth = 260;
const collapsedDrawerWidth = 64;

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Projects', icon: <FolderIcon />, path: '/dashboard/projects' },
  { text: 'Time to Market', icon: <AccessTimeIcon />, path: '/dashboard/ttl' }
];

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;
  const { mode, toggleTheme } = useTheme();
  const { selectedProject, setSelectedProject, projects } = useProject();

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
    handleMenuClose();
    auth.signOut();
    navigate('/');
  };

  const handleSearch = useCallback(async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearching(true);
    setSearchOpen(true);

    try {
      const results = [];
      const searchLower = value.toLowerCase();

      // Search across all projects or just selected project
      const projectsToSearch = selectedProject
        ? projects.filter(p => p.id === selectedProject)
        : projects;

      for (const project of projectsToSearch) {
        const featuresRef = collection(db, 'features');
        const q = query(featuresRef, where('projectId', '==', project.id));
        const snapshot = await getDocs(q);

        snapshot.docs.forEach(doc => {
          const feature = { id: doc.id, ...doc.data() };
          const matchesName = feature.name?.toLowerCase().includes(searchLower);
          const matchesDesc = feature.desc?.toLowerCase().includes(searchLower);
          const matchesDeps = feature.dependencies?.toLowerCase().includes(searchLower);
          const matchesGoal = feature.goal?.toLowerCase().includes(searchLower);

          if (matchesName || matchesDesc || matchesDeps || matchesGoal) {
            results.push({
              ...feature,
              projectName: project.name
            });
          }
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }, [selectedProject, projects]);

  const handleSearchResultClick = (feature) => {
    // Navigate to dashboard and close search
    if (feature.projectId !== selectedProject) {
      setSelectedProject(feature.projectId);
    }
    navigate('/dashboard');
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: collapsed ? collapsedDrawerWidth : drawerWidth, transition: 'width 0.2s' }}>
      {/* Sidebar Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em', display: collapsed ? 'none' : 'block' }}>
          Gapple
        </Typography>
        <IconButton size="small" onClick={() => setCollapsed(c => !c)} sx={{ ml: collapsed ? 0 : 1 }}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Navigation Menu */}
  <List sx={{ flex: 1, px: collapsed ? 0.5 : 2 }}>
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

      {/* Sidebar Footer - User Profile */}
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
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top AppBar */}
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
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search Bar */}
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: 'relative', mr: 2, ml: 0, width: { xs: '100%', sm: 'auto' }, flexGrow: { xs: 1, sm: 0 } }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                <Box
                  sx={{
                    padding: '0 16px',
                    height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search features…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setSearchOpen(true)}
                  sx={{
                    color: 'inherit',
                    width: '100%',
                    '& .MuiInputBase-input': {
                      padding: '8px 8px 8px 0',
                      paddingLeft: `calc(1em + 32px)`,
                      width: { xs: '100%', sm: '30ch' },
                    },
                  }}
                />
              </Box>

              {/* Search Results Dropdown */}
              {searchOpen && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1300,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: mode === 'dark'
                      ? '0 8px 16px rgba(0, 0, 0, 0.4)'
                      : '0 8px 16px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {searching ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Searching...
                      </Typography>
                    </Box>
                  ) : searchResults.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No results found
                      </Typography>
                    </Box>
                  ) : (
                    searchResults.map((result) => (
                      <Box
                        key={result.id}
                        onClick={() => handleSearchResultClick(result)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderBottom: 1,
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                          },
                          '&:last-child': {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {result.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'primary.main' }}>
                            {result.projectName}
                          </Typography>
                          {result.moscow && (
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                              • {result.moscow}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>

          <Box sx={{ flexGrow: 1 }} />

          {/* Project Selector */}
          {projects.length > 0 && (
            <FormControl
              size="small"
              sx={{
                mr: 2,
                minWidth: 200,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 1,
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  '& .MuiOutline-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                  },
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Right side icons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {user?.email?.[0].toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>

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
          width: collapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          transition: 'width 0.2s',
          '& .MuiDrawer-paper': {
            width: collapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'width 0.2s',
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
          width: { sm: `calc(100% - ${collapsed ? collapsedDrawerWidth : drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          pt: 11,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
