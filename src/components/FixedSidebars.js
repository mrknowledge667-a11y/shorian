// src/components/FixedSidebars.js
import React from 'react';
import { Box } from '@mui/material';

const FixedSidebars = () => {
  return (
    <>
      {/* Left Sidebar Banner */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: { xs: '80px', sm: '120px', md: '180px', lg: '220px', xl: '250px' },
          height: '100vh',
          zIndex: 9999,
          display: 'block',
          boxShadow: '4px 0 20px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          border: '3px solid #2E7D32',
          borderLeft: 'none',
        }}
      >
        <img
          src="/leftbar.jpg"
          alt="Shorian Med Banner"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </Box>
      
      {/* Right Sidebar Banner */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: { xs: '80px', sm: '120px', md: '180px', lg: '220px', xl: '250px' },
          height: '100vh',
          zIndex: 9999,
          display: 'block',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          border: '3px solid #2E7D32',
          borderRight: 'none',
        }}
      >
        <img
          src="/leftbar.jpg"
          alt="Shorian Med Banner"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </Box>
    </>
  );
};

export default FixedSidebars;
