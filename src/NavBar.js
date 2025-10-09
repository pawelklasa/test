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
import { Link } from 'react-router-dom';

function NavBar({ user, onLogout, onSettings, onSignIn, onSignUp, onLogoClick }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
        <Typography
          variant="h6"
          sx={{ position: 'absolute', left: 0, fontWeight: 'bold', letterSpacing: 2, cursor: 'pointer', textDecoration: 'none' }}
          onClick={onLogoClick}
          component="span"
        >
          G.A.P
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
          <Box sx={{ position: 'absolute', right: 0, display: 'flex', gap: 1 }}>
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
            sx={{ position: 'absolute', right: 0 }}
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
            <MenuItem onClick={() => { handleClose(); onSettings(); }}>Settings</MenuItem>
            <MenuItem onClick={() => { handleClose(); onLogout(); }}>Log Out</MenuItem>
          </Menu>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
