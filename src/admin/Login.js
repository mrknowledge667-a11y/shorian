// src/admin/Login.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmail, getCurrentUser, fetchAdminProfile } from '../api/supabaseClient';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state && location.state.from) || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkAlreadyLoggedIn() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await fetchAdminProfile();
          if (profile?.is_admin && !cancelled) {
            navigate('/admin', { replace: true });
            return;
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCheckingExisting(false);
      }
    }
    checkAlreadyLoggedIn();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      const profile = await fetchAdminProfile();
      if (!profile?.is_admin) {
        setErrorMsg('This account is not authorized for admin access.');
        setSubmitting(false);
        return;
      }
      navigate(fromPath, { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || 'Login failed. Check your credentials.');
      setSubmitting(false);
    }
  };

  if (checkingExisting) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Preparing admin login…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              WiMed Admin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Sign in with your admin account
            </Typography>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                margin="normal"
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                margin="normal"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitting}
                sx={{ mt: 2 }}
              >
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Use "npm run admin" to create admin accounts.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;