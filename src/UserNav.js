import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);

function UserNav() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) return null;

  return (
    <div className="nav-user">
      <span className="user-icon" role="img" aria-label="user">👤</span>
      <div className="user-dropdown">
        <span
          className="user-name dropdown-toggle"
          onClick={() => setDropdownOpen((open) => !open)}
          style={{ cursor: "pointer" }}
        >
          {user.email}
        </span>
        {dropdownOpen && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
            <button className="dropdown-item">Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserNav;
