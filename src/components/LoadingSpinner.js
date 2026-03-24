// src/components/LoadingSpinner.js
import React from 'react';
import { Box, CircularProgress, Backdrop } from '@mui/material';
import { useLoading } from '../contexts/LoadingContext';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={isLoading}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#3B9FD9',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          sx={{
            width: 60,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '30%',
              backgroundColor: '#3B9FD9',
              borderRadius: 2,
              animation: 'loading-bar 1.5s ease-in-out infinite',
              '@keyframes loading-bar': {
                '0%': {
                  transform: 'translateX(-100%)',
                },
                '50%': {
                  transform: 'translateX(200%)',
                },
                '100%': {
                  transform: 'translateX(-100%)',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Backdrop>
  );
};

export default LoadingSpinner;