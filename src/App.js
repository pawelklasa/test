import AuthForm from "./AuthForm";
import UserNav from "./UserNav";
import PublicNav from "./PublicNav";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setShowAuth(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <nav className="top-nav">
        <div className="nav-logo">
          <img src="/logo192.png" alt="Logo" />
        </div>
        <ul className="nav-links">
          {user ? (
            <>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </>
          ) : (
            <>
              <li><a href="#about">About</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </>
          )}
        </ul>
        {user ? (
          <UserNav />
        ) : (
          <PublicNav
            onSignIn={() => { setShowAuth(true); setIsLogin(true); }}
            onSignUp={() => { setShowAuth(true); setIsLogin(false); }}
          />
        )}
      </nav>
      <main className="landing-content">
        {user ? (
          <>
            <h1>Welcome to My Landing Page</h1>
            <p>This is a simple React landing page with a top navigation bar.</p>
          </>
        ) : showAuth ? (
          <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
        ) : (
          <>
            <h1>Welcome!</h1>
            <p>This is a public landing page. Please sign in or sign up to continue.</p>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
