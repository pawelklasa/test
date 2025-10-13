import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link, useLocation } from 'react-router-dom';

function NavBar({ user, onLogout, onSignIn, onSignUp, onLogoClick }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';
  const isPricingPage = location.pathname === '/pricing';
  const isTransparent = (isHomePage || isAboutPage || isPricingPage) && !user;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position={isTransparent ? "absolute" : "static"}
      sx={{
        backgroundColor: isTransparent ? 'rgba(0, 0, 0, 0.3)' : 'primary.main',
        backdropFilter: isTransparent ? 'blur(10px)' : 'none',
        boxShadow: isTransparent ? 'none' : undefined,
        transition: 'all 0.3s ease',
        color: 'white',
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', position: 'relative', px: { xs: 2, md: 4 }, py: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            left: { xs: 16, md: 32 },
            fontWeight: 'bold',
            letterSpacing: 1,
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
          onClick={onLogoClick}
          component="span"
        >
          Gapple
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, gap: 2 }}>
          {user ? null : (
            <>
              <Button color="inherit" component={Link} to="/about">About</Button>
              <Button color="inherit" component={Link} to="/pricing">Pricing</Button>
            </>
          )}
        </Box>
        {!user && (
          <Box sx={{ position: 'absolute', right: { xs: 16, md: 32 }, display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={onSignIn}>Sign In</Button>
            <Button color="inherit" onClick={onSignUp}>Sign Up</Button>
          </Box>
        )}
        {user && (
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMenu}
            sx={{ position: 'absolute', right: { xs: 16, md: 32 } }}
          >
            <AccountCircle />
          </IconButton>
        )}
        {user && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { handleClose(); onLogout(); }}>Log Out</MenuItem>
          </Menu>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
