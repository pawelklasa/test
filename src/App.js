import AuthForm from "./AuthForm";
import NavBar from "./NavBar";
import AboutPage from "./AboutPage";
import PricingPage from "./PricingPage";
import LandingPage from "./LandingPage";
import DashboardLayout from "./DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ProjectsPage from "./pages/ProjectsPage";
import FeatureTTL from "./pages/FeatureTTL";
import PortfolioRoadmap from "./pages/PortfolioRoadmap";
import FeatureLifecycleManagement from "./pages/FeatureLifecycleManagement";
import JiraIntegration from "./pages/JiraIntegration";
import VisualGapAnalysis from "./pages/VisualGapAnalysis";
import ActionableInsights from "./pages/ActionableInsights";
import TeamCollaboration from "./pages/TeamCollaboration";
import RealtimeTracking from "./pages/RealtimeTracking";
import SmartPrioritization from "./pages/SmartPrioritization";
import GrowthMetrics from "./pages/GrowthMetrics";
import DataVisualization from "./pages/DataVisualization";
import AutomatedWorkflows from "./pages/AutomatedWorkflows";
import IntegrationHub from "./pages/IntegrationHub";
import UserManagement from "./pages/UserManagement";
import ProjectGuard from "./ProjectGuard";
import { ThemeProvider } from "./ThemeContext";
import { ProjectProvider } from "./ProjectContext";
import AutoPopulate from "./components/AutoPopulate";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ThemeProvider>
      <ProjectProvider>
        <AutoPopulate />
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
      </ProjectProvider>
    </ThemeProvider>
  );
}

function AppContent({ user, setUser, showAuth, setShowAuth, isLogin, setIsLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

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

  const handleLogoClick = () => {
    setShowAuth(false);
    navigate('/');
  };
  return (
    <div className="App">
      {!isDashboard && (
        <NavBar
          user={user}
          onLogout={handleLogout}
          onSignIn={() => { setShowAuth(true); setIsLogin(true); }}
          onSignUp={() => { setShowAuth(true); setIsLogin(false); }}
          onLogoClick={handleLogoClick}
        />
      )}
      <Routes>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/" element={
          <>
            {user ? (
              <Navigate to="/dashboard/projects" replace />
            ) : (
              <LandingPage
                onGetStarted={() => { setShowAuth(true); setIsLogin(false); }}
                onLogin={() => { setShowAuth(true); setIsLogin(true); }}
              />
            )}
          </>
        } />

        {/* Dashboard Routes - Always available but protected by authentication */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="project/:projectId" element={<ProjectGuard><DashboardHome /></ProjectGuard>} />
          <Route path="ttl" element={<ProjectGuard><FeatureTTL /></ProjectGuard>} />
          <Route path="roadmap" element={<ProjectGuard><PortfolioRoadmap /></ProjectGuard>} />
          <Route path="lifecycle" element={<ProjectGuard><FeatureLifecycleManagement /></ProjectGuard>} />
          <Route path="jira" element={<ProjectGuard><JiraIntegration /></ProjectGuard>} />
          <Route path="users" element={<ProjectGuard><UserManagement /></ProjectGuard>} />
          <Route path="visual-gap-analysis" element={<ProjectGuard><VisualGapAnalysis /></ProjectGuard>} />
          <Route path="actionable-insights" element={<ProjectGuard><ActionableInsights /></ProjectGuard>} />
          <Route path="team-collaboration" element={<ProjectGuard><TeamCollaboration /></ProjectGuard>} />
          <Route path="realtime-tracking" element={<ProjectGuard><RealtimeTracking /></ProjectGuard>} />
          <Route path="smart-prioritization" element={<ProjectGuard><SmartPrioritization /></ProjectGuard>} />
          <Route path="growth-metrics" element={<ProjectGuard><GrowthMetrics /></ProjectGuard>} />
          <Route path="data-visualization" element={<ProjectGuard><DataVisualization /></ProjectGuard>} />
          <Route path="automated-workflows" element={<ProjectGuard><AutomatedWorkflows /></ProjectGuard>} />
          <Route path="integration-hub" element={<ProjectGuard><IntegrationHub /></ProjectGuard>} />
        </Route>
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

export default App;
