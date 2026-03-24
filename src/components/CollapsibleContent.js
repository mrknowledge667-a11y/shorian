// src/components/CollapsibleContent.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import { fetchCollapsibleSections } from '../api/content';
import { useLanguage } from '../contexts/LanguageContext';

const CollapsibleContent = () => {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchCollapsibleSections(currentLanguage);
        if (!cancelled) setSections(rows || []);
      } catch {
        if (!cancelled) setSections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  const skeletons = Array.from({ length: 3 });

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        {loading
          ? skeletons.map((_, idx) => (
              <Accordion key={`s-${idx}`} sx={{ mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: 'rgba(0, 150, 136, 0.08)' },
                    '&.Mui-expanded': { backgroundColor: 'rgba(0, 150, 136, 0.05)' },
                  }}
                >
                  <Skeleton variant="text" width={200} />
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {Array.from({ length: 4 }).map((__, i) => (
                      <ListItem key={i} sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Skeleton variant="text" width="70%" />}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          : sections.map((section) => {
              const items = Array.isArray(section.items) ? section.items : [];
              return (
                <Accordion
                  key={section.id}
                  sx={{
                    mb: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: '#f5f5f5',
                      '&:hover': { backgroundColor: 'rgba(0, 150, 136, 0.08)' },
                      '&.Mui-expanded': { backgroundColor: 'rgba(0, 150, 136, 0.05)' },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    >
                      {section.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {items.map((item, idx) => (
                        <ListItem key={idx} sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <CheckIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{
                              sx: { color: 'text.secondary', lineHeight: 1.7 },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })}
      </Container>
    </Box>
  );
};

export default CollapsibleContent;