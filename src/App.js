import AuthForm from "./AuthForm";
import NavBar from "./NavBar";
import SettingsPage from "./SettingsPage";
import AboutPage from "./AboutPage";
import PricingPage from "./PricingPage";
import LandingPage from "./LandingPage";
import DashboardLayout from "./DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import VisualGapAnalysis from "./pages/VisualGapAnalysis";
import ActionableInsights from "./pages/ActionableInsights";
import TeamCollaboration from "./pages/TeamCollaboration";
import RealtimeTracking from "./pages/RealtimeTracking";
import SmartPrioritization from "./pages/SmartPrioritization";
import GrowthMetrics from "./pages/GrowthMetrics";
import DataVisualization from "./pages/DataVisualization";
import AutomatedWorkflows from "./pages/AutomatedWorkflows";
import IntegrationHub from "./pages/IntegrationHub";
import { ThemeProvider } from "./ThemeContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
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
        <Route path="/settings" element={
          <Container maxWidth="md" sx={{ mt: 8 }}>
            <SettingsPage />
          </Container>
        } />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/" element={
          <>
            {user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage
                onGetStarted={() => { setShowAuth(true); setIsLogin(false); }}
                onLogin={() => { setShowAuth(true); setIsLogin(true); }}
              />
            )}
          </>
        } />

        {/* Dashboard Routes - Only accessible when logged in */}
        {user && (
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="visual-gap-analysis" element={<VisualGapAnalysis />} />
            <Route path="actionable-insights" element={<ActionableInsights />} />
            <Route path="team-collaboration" element={<TeamCollaboration />} />
            <Route path="realtime-tracking" element={<RealtimeTracking />} />
            <Route path="smart-prioritization" element={<SmartPrioritization />} />
            <Route path="growth-metrics" element={<GrowthMetrics />} />
            <Route path="data-visualization" element={<DataVisualization />} />
            <Route path="automated-workflows" element={<AutomatedWorkflows />} />
            <Route path="integration-hub" element={<IntegrationHub />} />
          </Route>
        )}
      </Routes>
      <Modal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 3,
            boxShadow: 24,
            minWidth: { xs: '90%', sm: 400 },
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <AuthForm
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            onClose={() => setShowAuth(false)}
          />
        </Box>
      </Modal>
    </div>
  );
}
// }

export default App;
