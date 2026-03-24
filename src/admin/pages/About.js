// src/admin/pages/About.js
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
  Chip,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import ImageUpload from '../components/ImageUpload';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function About() {
  const [tabValue, setTabValue] = useState(0);
  const [sections, setSections] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('section'); // 'section' or 'team'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { adminLanguage } = useAdminLanguage();
  const [translations, setTranslations] = useState({ sections: {}, teamMembers: {} });

  useEffect(() => {
    fetchData();
  }, [adminLanguage]);

  const fetchData = async () => {
    try {
      const [sectionsRes, teamRes] = await Promise.all([
        supabase
          .from('about_sections')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
        supabase
          .from('team_members')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('id', { ascending: true }),
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (teamRes.error) throw teamRes.error;

      setSections(sectionsRes.data || []);
      setTeamMembers(teamRes.data || []);

      // Fetch translations if not English
      if (adminLanguage !== 'en') {
        const [sectionTransRes, teamTransRes] = await Promise.all([
          supabase
            .from('about_sections_translations')
            .select('*')
            .eq('language_code', adminLanguage),
          supabase
            .from('team_members_translations')
            .select('*')
            .eq('language_code', adminLanguage),
        ]);

        const sectionTrans = {};
        const teamTrans = {};

        if (sectionTransRes.data) {
          sectionTransRes.data.forEach(t => {
            sectionTrans[t.section_id] = t;
          });
        }

        if (teamTransRes.data) {
          teamTransRes.data.forEach(t => {
            teamTrans[t.member_id] = t;
          });
        }

        setTranslations({ sections: sectionTrans, teamMembers: teamTrans });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    
    if (type === 'section') {
      if (item) {
        setEditingItem(item);
        const translation = adminLanguage !== 'en' ? translations.sections[item.id] : null;
        setFormData({
          key: item.key || '',
          title: translation?.title || item.title || '',
          content: translation?.content || item.content || '',
          sort_order: item.sort_order || 0,
        });
      } else {
        setEditingItem(null);
        setFormData({
          key: '',
          title: '',
          content: '',
          sort_order: sections.length,
        });
      }
    } else {
      if (item) {
        setEditingItem(item);
        const translation = adminLanguage !== 'en' ? translations.teamMembers[item.id] : null;
        setFormData({
          name: translation?.name || item.name || '',
          position: translation?.position || item.position || '',
          bio: translation?.bio || item.bio || '',
          image_url: item.image_url || '',
          sort_order: item.sort_order || 0,
        });
      } else {
        setEditingItem(null);
        setFormData({
          name: '',
          position: '',
          bio: '',
          image_url: '',
          sort_order: teamMembers.length,
        });
      }
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (adminLanguage === 'en') {
        // Save base content
        const table = dialogType === 'section' ? 'about_sections' : 'team_members';
        
        if (editingItem) {
          const { error } = await supabase
            .from(table)
            .update(formData)
            .eq('id', editingItem.id);

          if (error) throw error;
        } else {
          const { error } = await supabase.from(table).insert([formData]);

          if (error) throw error;
        }
      } else {
        // Save translations
        if (editingItem) {
          if (dialogType === 'section') {
            const { data: existing } = await supabase
              .from('about_sections_translations')
              .select('id')
              .eq('section_id', editingItem.id)
              .eq('language_code', adminLanguage)
              .single();

            if (existing) {
              await supabase
                .from('about_sections_translations')
                .update({ title: formData.title, content: formData.content })
                .eq('section_id', editingItem.id)
                .eq('language_code', adminLanguage);
            } else {
              await supabase
                .from('about_sections_translations')
                .insert({
                  section_id: editingItem.id,
                  language_code: adminLanguage,
                  title: formData.title,
                  content: formData.content,
                });
            }
          } else {
            const { data: existing } = await supabase
              .from('team_members_translations')
              .select('id')
              .eq('member_id', editingItem.id)
              .eq('language_code', adminLanguage)
              .single();

            if (existing) {
              await supabase
                .from('team_members_translations')
                .update({
                  name: formData.name,
                  position: formData.position,
                  bio: formData.bio || null
                })
                .eq('member_id', editingItem.id)
                .eq('language_code', adminLanguage);
            } else {
              await supabase
                .from('team_members_translations')
                .insert({
                  member_id: editingItem.id,
                  language_code: adminLanguage,
                  name: formData.name,
                  position: formData.position,
                  bio: formData.bio || null,
                });
            }
          }
        } else {
          // For new items, create in English first
          showSnackbar('Please create new items in English first, then add translations', 'info');
          return;
        }
      }

      showSnackbar(`${dialogType === 'section' ? 'Section' : 'Team member'} saved successfully`);
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      showSnackbar('Failed to save', 'error');
    }
  };

  const handleDelete = async (type, id) => {
    const confirmMessage = type === 'section' 
      ? 'Are you sure you want to delete this section?' 
      : 'Are you sure you want to delete this team member?';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const table = type === 'section' ? 'about_sections' : 'team_members';
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) throw error;
      showSnackbar(`${type === 'section' ? 'Section' : 'Team member'} deleted successfully`);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      showSnackbar('Failed to delete', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getSectionLabel = (key) => {
    const labels = {
      mission: 'Mission',
      vision: 'Vision',
      story: 'Our Story',
    };
    return labels[key] || key;
  };

  const getDisplayValue = (item, field, type) => {
    if (adminLanguage === 'en') {
      return item[field] || '';
    }
    const translationMap = type === 'section' ? translations.sections : translations.teamMembers;
    const translation = translationMap[item.id];
    return translation?.[field] || item[field] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          About Us Management
        </Typography>
        {adminLanguage !== 'en' && (
          <Chip
            label={`Editing in: ${adminLanguage.toUpperCase()}`}
            color="primary"
            size="small"
          />
        )}
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Content Sections" />
          <Tab label="Team Members" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('section')}
            >
              Add Section
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Section</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Content Preview</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="circular" width={24} height={24} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={80} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={150} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={300} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={50} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton variant="text" width={100} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : sections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No sections found. Add your first section!
                    </TableCell>
                  </TableRow>
                ) : (
                  sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell>
                        <DragIcon sx={{ color: 'text.secondary' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={getSectionLabel(section.key)} size="small" />
                      </TableCell>
                      <TableCell>{getDisplayValue(section, 'title', 'section')}</TableCell>
                      <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {getDisplayValue(section, 'content', 'section').substring(0, 100)}...
                      </TableCell>
                      <TableCell>{section.sort_order}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog('section', section)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete('section', section.id)} color="error">
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

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('team')}
            >
              Add Team Member
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton variant="circular" width={24} height={24} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="circular" width={60} height={60} />
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
                      <TableCell align="right">
                        <Skeleton variant="text" width={100} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No team members found. Add your first team member!
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <DragIcon sx={{ color: 'text.secondary' }} />
                      </TableCell>
                      <TableCell>
                        <Avatar
                          src={member.image_url}
                          alt={member.name}
                          sx={{ width: 60, height: 60 }}
                        />
                      </TableCell>
                      <TableCell>{getDisplayValue(member, 'name', 'team')}</TableCell>
                      <TableCell>{getDisplayValue(member, 'position', 'team')}</TableCell>
                      <TableCell>{member.sort_order}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog('team', member)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete('team', member.id)} color="error">
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem 
            ? `Edit ${dialogType === 'section' ? 'Section' : 'Team Member'}` 
            : `Add New ${dialogType === 'section' ? 'Section' : 'Team Member'}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {dialogType === 'section' ? (
              <>
                <TextField
                  label="Section Key"
                  value={formData.key || ''}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  fullWidth
                  required
                  helperText="e.g., mission, vision, story"
                />
                <TextField
                  label="Title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  fullWidth
                  multiline
                  rows={6}
                  required
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
                />
              </>
            ) : (
              <>
                <TextField
                  label="Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  required
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
                />
                <TextField
                  label="Position"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  fullWidth
                  required
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
                />
                <TextField
                  label="Bio (Optional)"
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  helperText={adminLanguage !== 'en' ? 'Leave empty to use English version' : ''}
                />
                {adminLanguage === 'en' && (
                  <ImageUpload
                    label="Team Member Photo"
                    value={formData.image_url || ''}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    required
                    folder="team"
                  />
                )}
              </>
            )}
            {adminLanguage === 'en' && (
              <TextField
                label="Sort Order"
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                fullWidth
                helperText="Lower numbers appear first"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              adminLanguage === 'en'
                ? (dialogType === 'section'
                  ? !formData.key || !formData.title || !formData.content
                  : !formData.name || !formData.position || !formData.image_url)
                : !editingItem // Disable for new items when not in English
            }
          >
            {editingItem ? 'Update' : 'Add'}
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

export default About;