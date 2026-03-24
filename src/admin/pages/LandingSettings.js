// src/admin/pages/LandingSettings.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, Translate as TranslateIcon } from '@mui/icons-material';
import { fetchSiteSettings } from '../../api/content';
import { supabase } from '../../api/supabaseClient';
import ImageUpload from '../components/ImageUpload';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

function LandingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [languages, setLanguages] = useState([]);
  const { adminLanguage, changeAdminLanguage } = useAdminLanguage();
  const [form, setForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
    contact_email: '',
    phone: '',
    map_embed_url: '',
    value_prop_title: '',
    value_prop_subtitle: '',
    categories_title: '',
    categories_subtitle: '',
    new_arrivals_title: '',
    new_arrivals_subtitle: '',
    brands_title: '',
    brands_subtitle: '',
  });
  const [translations, setTranslations] = useState({});
  const [baseSettings, setBaseSettings] = useState({});
  const currentLanguage = adminLanguage;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch languages
        const { data: langData } = await supabase
          .from('languages')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (!cancelled && langData) {
          setLanguages(langData);
        }

        // Fetch base settings
        const data = await fetchSiteSettings();
        if (!cancelled && data) {
          const settings = {
            hero_title: data.hero_title || '',
            hero_subtitle: data.hero_subtitle || '',
            hero_image_url: data.hero_image_url || '',
            contact_email: data.contact_email || '',
            phone: data.phone || '',
            map_embed_url: data.map_embed_url || '',
            value_prop_title: data.value_prop_title || 'Why Choose WiMed',
            value_prop_subtitle: data.value_prop_subtitle || 'Your trusted partner for quality medical equipment',
            categories_title: data.categories_title || 'Our Range of Medical Equipment',
            categories_subtitle: data.categories_subtitle || 'Explore our comprehensive selection of quality medical equipment',
            new_arrivals_title: data.new_arrivals_title || 'New Arrivals',
            new_arrivals_subtitle: data.new_arrivals_subtitle || 'Check out our latest medical equipment arrivals, thoroughly tested and ready for use',
            brands_title: data.brands_title || 'Working with trusted and leading names in healthcare',
            brands_subtitle: data.brands_subtitle || 'Our trusted partners',
          };
          setForm(settings);
          setBaseSettings(settings);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentLanguage !== 'en') {
      fetchTranslations();
    }
  }, [currentLanguage]);

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings_translations')
        .select('*')
        .eq('setting_id', 1)
        .eq('language_code', currentLanguage)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTranslations({
          hero_title: data.hero_title || '',
          hero_subtitle: data.hero_subtitle || '',
          value_prop_title: data.value_prop_title || '',
          value_prop_subtitle: data.value_prop_subtitle || '',
          categories_title: data.categories_title || '',
          categories_subtitle: data.categories_subtitle || '',
          new_arrivals_title: data.new_arrivals_title || '',
          new_arrivals_subtitle: data.new_arrivals_subtitle || '',
          brands_title: data.brands_title || '',
          brands_subtitle: data.brands_subtitle || '',
        });
      } else {
        // Initialize empty translations
        setTranslations({
          hero_title: '',
          hero_subtitle: '',
          value_prop_title: '',
          value_prop_subtitle: '',
          categories_title: '',
          categories_subtitle: '',
          new_arrivals_title: '',
          new_arrivals_subtitle: '',
          brands_title: '',
          brands_subtitle: '',
        });
      }
    } catch (error) {
      console.error('Error fetching translations:', error);
      setError('Failed to load translations');
    }
  };

  const handleChange = (field) => (e) => {
    if (currentLanguage === 'en') {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    } else {
      setTranslations((t) => ({ ...t, [field]: e.target.value }));
    }
  };

  const handleLanguageChange = (event) => {
    changeAdminLanguage(event.target.value);
    setError('');
    setOk('');
  };

  const getCurrentValue = (field) => {
    if (currentLanguage === 'en') {
      return form[field] || '';
    }
    return translations[field] || '';
  };

  const getPlaceholder = (field) => {
    if (currentLanguage === 'en') {
      return '';
    }
    return baseSettings[field] || '';
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setOk('');
    try {
      if (currentLanguage === 'en') {
        // Save main settings
        const updates = {
          hero_title: form.hero_title,
          hero_subtitle: form.hero_subtitle,
          hero_image_url: form.hero_image_url,
          contact_email: form.contact_email,
          phone: form.phone,
          map_embed_url: form.map_embed_url,
          value_prop_title: form.value_prop_title,
          value_prop_subtitle: form.value_prop_subtitle,
          categories_title: form.categories_title,
          categories_subtitle: form.categories_subtitle,
          new_arrivals_title: form.new_arrivals_title,
          new_arrivals_subtitle: form.new_arrivals_subtitle,
          brands_title: form.brands_title,
          brands_subtitle: form.brands_subtitle,
          updated_at: new Date().toISOString(),
        };
        const { error: upErr } = await supabase.from('site_settings').upsert({ id: 1, ...updates });
        if (upErr) throw upErr;
      } else {
        // Save translations
        const { data: existing } = await supabase
          .from('site_settings_translations')
          .select('id')
          .eq('setting_id', 1)
          .eq('language_code', currentLanguage)
          .single();

        const translationData = {
          setting_id: 1,
          language_code: currentLanguage,
          ...translations,
        };

        if (existing) {
          // Update existing translation
          const { error } = await supabase
            .from('site_settings_translations')
            .update(translations)
            .eq('setting_id', 1)
            .eq('language_code', currentLanguage);
          if (error) throw error;
        } else {
          // Insert new translation
          const { error } = await supabase
            .from('site_settings_translations')
            .insert(translationData);
          if (error) throw error;
        }
      }
      setOk(`Settings saved successfully${currentLanguage !== 'en' ? ` for ${languages.find(l => l.code === currentLanguage)?.name}` : ''}.`);
    } catch (e) {
      setError(e?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Landing Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update hero banner, section titles, and contact details. Changes are live for the public site.
          </Typography>
        </Box>
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="language-select-label">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TranslateIcon fontSize="small" />
          Content Language
        </Box>
      </InputLabel>
      <Select
        labelId="language-select-label"
        value={currentLanguage}
        onChange={handleLanguageChange}
        label="Content Language"
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.name} ({lang.native_name})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        {currentLanguage === 'en'
          ? 'You are editing the default English content. This will be used as fallback for untranslated languages.'
          : `You are editing translations for ${languages.find(l => l.code === currentLanguage)?.name}. Leave fields empty to use the default English content.`
        }
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {ok && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {ok}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Hero Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Hero Section
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Hero Title"
                value={getCurrentValue('hero_title')}
                onChange={handleChange('hero_title')}
                fullWidth
                disabled={loading}
                placeholder={getPlaceholder('hero_title')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : ''}
              />
              <TextField
                label="Hero Subtitle"
                value={getCurrentValue('hero_subtitle')}
                onChange={handleChange('hero_subtitle')}
                fullWidth
                multiline
                minRows={2}
                disabled={loading}
                placeholder={getPlaceholder('hero_subtitle')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : ''}
              />
              {currentLanguage === 'en' && (
                <ImageUpload
                  label="Hero Image"
                  value={form.hero_image_url}
                  onChange={(url) => setForm({ ...form, hero_image_url: url })}
                  disabled={loading}
                  folder="hero"
                />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Section Titles */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Section Titles
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Categories Section Title"
                value={getCurrentValue('categories_title')}
                onChange={handleChange('categories_title')}
                fullWidth
                disabled={loading}
                placeholder={getPlaceholder('categories_title')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : 'Title for product categories section'}
              />
              <TextField
                label="Categories Section Subtitle"
                value={getCurrentValue('categories_subtitle')}
                onChange={handleChange('categories_subtitle')}
                fullWidth
                disabled={loading}
                placeholder={getPlaceholder('categories_subtitle')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : 'Subtitle for product categories section'}
              />
              <Divider />
              <TextField
                label="New Arrivals Section Title"
                value={getCurrentValue('new_arrivals_title')}
                onChange={handleChange('new_arrivals_title')}
                fullWidth
                disabled={loading}
                placeholder={getPlaceholder('new_arrivals_title')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : 'Title for new arrivals section'}
              />
              <TextField
                label="New Arrivals Section Subtitle"
                value={getCurrentValue('new_arrivals_subtitle')}
                onChange={handleChange('new_arrivals_subtitle')}
                fullWidth
                multiline
                minRows={2}
                disabled={loading}
                placeholder={getPlaceholder('new_arrivals_subtitle')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : 'Subtitle for new arrivals section'}
              />
              <Divider />
              <TextField
                label="Brands Section Title"
                value={getCurrentValue('brands_title')}
                onChange={handleChange('brands_title')}
                fullWidth
                disabled={loading}
                placeholder={getPlaceholder('brands_title')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : 'Title for trusted brands section'}
              />
              <TextField
                label="Brands Section Subtitle"
                value={getCurrentValue('brands_subtitle')}
                onChange={handleChange('brands_subtitle')}
                fullWidth
                disabled={loading}
                placeholder={getPlaceholder('brands_subtitle')}
                helperText={currentLanguage !== 'en' ? 'Leave empty to use English version' : 'Subtitle for trusted brands section'}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Contact Information - Only for English */}
        {currentLanguage === 'en' && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Contact Email"
                  value={form.contact_email}
                  onChange={handleChange('contact_email')}
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label="Phone"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label="Map Embed URL"
                  value={form.map_embed_url}
                  onChange={handleChange('map_embed_url')}
                  fullWidth
                  disabled={loading}
                  helperText="Google Maps embed URL for the contact page"
                />
              </Stack>
            </CardContent>
          </Card>
        )}

        <Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default LandingSettings;