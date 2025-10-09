import React from "react";

function PublicNav({ onSignIn, onSignUp }) {
  return (
    <div className="nav-public">
      <button className="nav-btn" onClick={onSignIn}>Sign In</button>
      <button className="nav-btn" onClick={onSignUp}>Sign Up</button>
    </div>
  );
}

export default PublicNav;
