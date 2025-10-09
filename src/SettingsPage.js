import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
    </Box>
  );
}
