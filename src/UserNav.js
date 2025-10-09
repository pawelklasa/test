import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebase";
import { useNavigate } from "react-router-dom";

const auth = getAuth(app);

function UserNav() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
      <span
        className="user-icon dropdown-toggle"
        role="img"
        aria-label="user"
        style={{ cursor: "pointer" }}
        onClick={() => setDropdownOpen((open) => !open)}
      >
        👤
      </span>
      {dropdownOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
          <button className="dropdown-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>Settings</button>
        </div>
      )}
    </div>
  );
}

export default UserNav;
