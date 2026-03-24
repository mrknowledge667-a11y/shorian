// src/admin/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getCurrentUser, fetchAdminProfile } from '../api/supabaseClient';

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          if (!cancelled) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }
        const profile = await fetchAdminProfile();
        if (!cancelled) {
          setAllowed(Boolean(profile?.is_admin));
          setLoading(false);
        }
      } catch (_e) {
        if (!cancelled) {
          setAllowed(false);
          setLoading(false);
        }
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Checking admin access…</Typography>
      </Box>
    );
  }

  if (!allowed) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;