// src/admin/pages/Overview.js
import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { supabase } from '../../api/supabaseClient';

function Stat({ label, value, loading }) {
  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={80} height={36} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

async function count(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}

function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    brands: 0,
    services: 0,
    team: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [categories, products, brands, services, team] = await Promise.all([
          count('categories'),
          count('products'),
          count('brands'),
          count('services'),
          count('team_members'),
        ]);
        if (!cancelled) {
          setStats({ categories, products, brands, services, team });
        }
      } catch {
        // ignore for overview
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Admin Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Quick snapshot of your catalog and content. Use the sidebar to manage details.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Categories" value={stats.categories} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Products" value={stats.products} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Brands" value={stats.brands} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Services" value={stats.services} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Team Members" value={stats.team} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Overview;