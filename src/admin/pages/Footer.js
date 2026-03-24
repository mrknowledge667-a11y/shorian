// src/admin/pages/Footer.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Stack,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Footer() {
  const [tabValue, setTabValue] = useState(0);
  const [footerSettings, setFooterSettings] = useState(null);
  const [footerLinks, setFooterLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkFormData, setLinkFormData] = useState({
    label: '',
    url: '',
    sort_order: 0,
    is_active: true,
  });
  const [settingsForm, setSettingsForm] = useState({
    office_address_lines: [],
    about_text: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    website_url: '',
    copyright_text: '',
  });
  const [addressLineInput, setAddressLineInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [settingsTranslations, setSettingsTranslations] = useState({});
  const [linksTranslations, setLinksTranslations] = useState({});

  useEffect(() => {
    fetchData();
  }, [adminLanguage]);

  const fetchData = async () => {
    try {
      const [settingsRes, linksRes] = await Promise.all([
        supabase.from('footer_settings').select('*').eq('id', 1).single(),
        supabase
          .from('footer_links')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
      ]);

      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') throw settingsRes.error;
      if (linksRes.error) throw linksRes.error;

      if (settingsRes.data) {
        setFooterSettings(settingsRes.data);
        if (adminLanguage === 'en') {
          setSettingsForm({
            office_address_lines: settingsRes.data.office_address_lines || [],
            about_text: settingsRes.data.about_text || '',
            facebook_url: settingsRes.data.facebook_url || '',
            instagram_url: settingsRes.data.instagram_url || '',
            youtube_url: settingsRes.data.youtube_url || '',
            website_url: settingsRes.data.website_url || '',
            copyright_text: settingsRes.data.copyright_text || '',
          });
        }
      }
      setFooterLinks(linksRes.data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const [settingsTransRes, linksTransRes] = await Promise.all([
          supabase
            .from('footer_settings_translations')
            .select('*')
            .eq('setting_id', 1)
            .eq('language_code', adminLanguage)
            .single(),
          supabase
            .from('footer_links_translations')
            .select('*')
            .eq('language_code', adminLanguage),
        ]);

        if (settingsTransRes.data) {
          setSettingsTranslations(settingsTransRes.data);
          setSettingsForm({
            office_address_lines: settingsTransRes.data.office_address_lines || settingsRes.data?.office_address_lines || [],
            about_text: settingsTransRes.data.about_text || '',
            facebook_url: settingsRes.data?.facebook_url || '',
            instagram_url: settingsRes.data?.instagram_url || '',
            youtube_url: settingsRes.data?.youtube_url || '',
            website_url: settingsRes.data?.website_url || '',
            copyright_text: settingsTransRes.data.copyright_text || '',
          });
        } else if (settingsRes.data) {
          // Use base settings if no translation exists
          setSettingsForm({
            office_address_lines: [],
            about_text: '',
            facebook_url: settingsRes.data.facebook_url || '',
            instagram_url: settingsRes.data.instagram_url || '',
            youtube_url: settingsRes.data.youtube_url || '',
            website_url: settingsRes.data.website_url || '',
            copyright_text: '',
          });
        }

        const linksTrans = {};
        if (linksTransRes.data) {
          linksTransRes.data.forEach(t => {
            linksTrans[t.link_id] = t;
          });
        }
        setLinksTranslations(linksTrans);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load footer data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (adminLanguage === 'en') {
        // Save base settings
        const { error } = await supabase
          .from('footer_settings')
          .upsert({ id: 1, ...settingsForm });

        if (error) throw error;
      } else {
        // Save translations
        const { data: existing } = await supabase
          .from('footer_settings_translations')
          .select('id')
          .eq('setting_id', 1)
          .eq('language_code', adminLanguage)
          .single();

        const translationData = {
          setting_id: 1,
          language_code: adminLanguage,
          office_address_lines: settingsForm.office_address_lines,
          about_text: settingsForm.about_text,
          copyright_text: settingsForm.copyright_text,
        };

        if (existing) {
          await supabase
            .from('footer_settings_translations')
            .update(translationData)
            .eq('setting_id', 1)
            .eq('language_code', adminLanguage);
        } else {
          await supabase
            .from('footer_settings_translations')
            .insert(translationData);
        }
      }
      
      showSnackbar('Footer settings saved successfully');
      fetchData();
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Failed to save footer settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddressLine = () => {
    if (addressLineInput.trim()) {
      setSettingsForm({
        ...settingsForm,
        office_address_lines: [...settingsForm.office_address_lines, addressLineInput.trim()],
      });
      setAddressLineInput('');
    }
  };

  const handleRemoveAddressLine = (index) => {
    setSettingsForm({
      ...settingsForm,
      office_address_lines: settingsForm.office_address_lines.filter((_, i) => i !== index),
    });
  };

  const handleOpenLinkDialog = (link = null) => {
    if (link) {
      setEditingLink(link);
      const translation = adminLanguage !== 'en' ? linksTranslations[link.id] : null;
      setLinkFormData({
        label: translation?.label || link.label || '',
        url: link.url || '',
        sort_order: link.sort_order || 0,
        is_active: link.is_active !== false,
      });
    } else {
      setEditingLink(null);
      setLinkFormData({
        label: '',
        url: '',
        sort_order: footerLinks.length,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setDialogOpen(false);
    setEditingLink(null);
    setLinkFormData({
      label: '',
      url: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const handleSaveLink = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        if (editingLink) {
          const { error } = await supabase
            .from('footer_links')
            .update({
              label: linkFormData.label,
              url: linkFormData.url,
              sort_order: linkFormData.sort_order,
              is_active: linkFormData.is_active,
            })
            .eq('id', editingLink.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from('footer_links').insert([linkFormData]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingLink) {
          const { data: existing } = await supabase
            .from('footer_links_translations')
            .select('id')
            .eq('link_id', editingLink.id)
            .eq('language_code', adminLanguage)
            .single();

          if (existing) {
            await supabase
              .from('footer_links_translations')
              .update({ label: linkFormData.label })
              .eq('link_id', editingLink.id)
              .eq('language_code', adminLanguage);
          } else {
            await supabase
              .from('footer_links_translations')
              .insert({
                link_id: editingLink.id,
                language_code: adminLanguage,
                label: linkFormData.label,
              });
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new footer links in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar('Footer link saved successfully');
      handleCloseLinkDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving link:', error);
      showSnackbar('Failed to save footer link', 'error');
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this footer link?')) return;

    try {
      const { error } = await supabase.from('footer_links').delete().eq('id', id);

      if (error) throw error;
      showSnackbar('Footer link deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting link:', error);
      showSnackbar('Failed to delete footer link', 'error');
    }
  };

  const handleToggleLinkActive = async (link) => {
    try {
      const { error } = await supabase
        .from('footer_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);

      if (error) throw error;
      showSnackbar('Footer link status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating link:', error);
      showSnackbar('Failed to update footer link', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDisplayLinkLabel = (link) => {
    if (adminLanguage === 'en') {
      return link.label || '';
    }
    const translation = linksTranslations[link.id];
    return translation?.label || link.label || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Footer Management
          </Typography>
          {adminLanguage !== 'en' && (
            <Chip
              label={`Editing in: ${adminLanguage.toUpperCase()}`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="General Settings" />
          <Tab label="Footer Links" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* Office Address */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Office Address
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Add Address Line"
                      value={addressLineInput}
                      onChange={(e) => setAddressLineInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAddressLine()}
                      fullWidth
                      size="small"
                      disabled={loading}
                    />
                    <Button onClick={handleAddAddressLine} variant="outlined" disabled={loading}>
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {settingsForm.office_address_lines.map((line, index) => (
                      <Chip
                        key={index}
                        label={line}
                        onDelete={() => handleRemoveAddressLine(index)}
                        disabled={loading}
                      />
                    ))}
                  </Box>
                </Box>

                {/* About Text */}
                <TextField
                  label="About Text"
                  value={settingsForm.about_text}
                  onChange={(e) => setSettingsForm({ ...settingsForm, about_text: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={loading}
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'Brief description about your company that appears in the footer'}
                />

                {/* Social Media URLs - Only for English */}
                {adminLanguage === 'en' && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Social Media Links
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Facebook URL"
                        value={settingsForm.facebook_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                        fullWidth
                        disabled={loading}
                        InputProps={{
                          startAdornment: <FacebookIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                      <TextField
                        label="Instagram URL"
                        value={settingsForm.instagram_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                        fullWidth
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InstagramIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                      <TextField
                        label="YouTube URL"
                        value={settingsForm.youtube_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, youtube_url: e.target.value })}
                        fullWidth
                        disabled={loading}
                        InputProps={{
                          startAdornment: <YouTubeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                      <TextField
                        label="Website URL"
                        value={settingsForm.website_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, website_url: e.target.value })}
                        fullWidth
                        disabled={loading}
                        InputProps={{
                          startAdornment: <PublicIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Stack>
                  </Box>
                )}

                {/* Copyright Text */}
                <TextField
                  label="Copyright Text"
                  value={settingsForm.copyright_text}
                  onChange={(e) => setSettingsForm({ ...settingsForm, copyright_text: e.target.value })}
                  fullWidth
                  disabled={loading}
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version. Use {year} for current year' : 'Use {year} to automatically insert the current year'}
                />

                <Box>
                  <Button
                    variant="contained"
                    onClick={handleSaveSettings}
                    disabled={loading || saving}
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenLinkDialog()}
              disabled={adminLanguage !== 'en'}
            >
              Add Footer Link
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="circular" width={24} height={24} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={150} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={200} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={50} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={60} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="text" width={100} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : footerLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No footer links found. Add your first footer link!
                    </TableCell>
                  </TableRow>
                ) : (
                  footerLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <DragIcon sx={{ color: 'text.secondary' }} />
                      </TableCell>
                      <TableCell>{getDisplayLinkLabel(link)}</TableCell>
                      <TableCell>
                        <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                          {link.url}
                        </code>
                      </TableCell>
                      <TableCell>{link.sort_order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={link.is_active}
                          onChange={() => handleToggleLinkActive(link)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenLinkDialog(link)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteLink(link.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Add/Edit Link Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseLinkDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLink ? 'Edit Footer Link' : 'Add New Footer Link'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Link Label"
              value={linkFormData.label}
              onChange={(e) => setLinkFormData({ ...linkFormData, label: e.target.value })}
              fullWidth
              required
              helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : 'The text that will appear as the link'}
            />
            {adminLanguage === 'en' && (
              <>
                <TextField
                  label="URL"
                  value={linkFormData.url}
                  onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                  fullWidth
                  required
                  helperText="The URL this link should point to"
                />
                <TextField
                  label="Sort Order"
                  type="number"
                  value={linkFormData.sort_order}
                  onChange={(e) => setLinkFormData({ ...linkFormData, sort_order: parseInt(e.target.value) || 0 })}
                  fullWidth
                  helperText="Lower numbers appear first"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={linkFormData.is_active}
                      onChange={(e) => setLinkFormData({ ...linkFormData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Cancel</Button>
          <Button
            onClick={handleSaveLink}
            variant="contained"
            disabled={
              adminLanguage === 'en'
                ? !linkFormData.label || !linkFormData.url
                : !editingLink // Disable for new items when not in English
            }
          >
            {editingLink ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Footer;