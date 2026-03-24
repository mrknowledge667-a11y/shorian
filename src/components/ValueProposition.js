import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { fetchSiteSettings } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';

const ValueProposition = () => {
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();
  const [valueText, setValueText] = useState(
    'With experience of +25 years and diverse range of products. We are a global service provider specializing in Used and Refurbished medical equipment and Services'
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await fetchSiteSettings(currentLanguage);
        if (!cancelled && settings?.value_proposition_text) {
          setValueText(settings.value_proposition_text);
        }
      } catch {
        // keep default
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="md">
        <Typography
          variant="h5"
          component="p"
          sx={{
            textAlign: 'center',
            color: 'text.primary',
            lineHeight: 1.8,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            minHeight: loading ? { xs: '75px', md: '90px' } : 'auto',
          }}
        >
          {!loading && valueText}
        </Typography>
      </Container>
    </Box>
  );
};

export default ValueProposition;