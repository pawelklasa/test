import AuthForm from "./AuthForm";
import NavBar from "./NavBar";
import SettingsPage from "./SettingsPage";
import AboutPage from "./AboutPage";
import PricingPage from "./PricingPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Router>
      <AppContent
        user={user}
        setUser={setUser}
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
      />
    </Router>
  );
}

function AppContent({ user, setUser, showAuth, setShowAuth, isLogin, setIsLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setShowAuth(false);
    });
    return () => unsubscribe();
  }, [setUser, setShowAuth]);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut();
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleLogoClick = () => {
    setShowAuth(false);
    navigate('/');
  };
  return (
    <div className="App">
      <NavBar
        user={user}
        onLogout={handleLogout}
        onSettings={handleSettings}
        onSignIn={() => { setShowAuth(true); setIsLogin(true); }}
        onSignUp={() => { setShowAuth(true); setIsLogin(false); }}
        onLogoClick={handleLogoClick}
      />
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        onLogoClick={handleLogoClick}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/" element={
          <Container maxWidth="md" sx={{ mt: 8 }}>
            {user ? (
              <>
                <Typography variant="h3" align="center" gutterBottom>Welcome to G.A.P Dashboard</Typography>
                <Typography variant="body1" align="center">This is your workspace for product gap analysis.</Typography>
              </>
            ) : (
              <>
                <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3 }}>
                  <Typography variant="h2" color="primary" gutterBottom fontWeight={700}>
                    G.A.P Analysis
                  </Typography>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    The professional gap analysis app for product owners
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
                    Identify, visualize, and close gaps in your product strategy. <br />
                    Sign up or log in to get started and unlock actionable insights for your team.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                    <Button variant="contained" color="primary" size="large" onClick={() => { setShowAuth(true); setIsLogin(false); }}>
                      Get Started
                    </Button>
                    <Button variant="outlined" color="primary" size="large" onClick={() => { setShowAuth(true); setIsLogin(true); }}>
                      Log In
                    </Button>
                  </Box>
                </Box>
                <Modal open={showAuth} onClose={() => setShowAuth(false)}>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 24, minWidth: 350 }}>
                    <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
                  </Box>
                </Modal>
              </>
            )}
          </Container>
        } />
      </Routes>
    </div>
  );
}
// }

export default App;
