import React, { useState, useEffect } from 'react';
import {
  Container,
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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Grid,
  Alert,
  Snackbar,
  TablePagination,
  InputAdornment
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  Search,
  Clear,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { supabase } from '../../api/supabaseClient';
import { fetchActiveLanguages, fetchBlogCategories, fetchBlogTags } from '../../api/content';
import { useAdminLanguage } from '../../contexts/AdminLanguageContext';
import ImageUpload from '../components/ImageUpload';

const BlogPosts = () => {
  const { adminLanguage } = useAdminLanguage();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author_name: '',
    author_image: '',
    category_id: '',
    status: 'draft',
    is_featured: false,
    reading_time: 5,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    translations: {},
    tags: [],
  });
  
  const [activeTab, setActiveTab] = useState('en');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load languages, categories, and tags
      const [languagesData, categoriesData, tagsData] = await Promise.all([
        fetchActiveLanguages(),
        fetchBlogCategories('en'),
        fetchBlogTags('en'),
      ]);
      
      setLanguages(languagesData || []);
      setCategories(categoriesData || []);
      setTags(tagsData || []);
      
      // Load blog posts
      const { data: postsData, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_categories (
            id,
            name,
            slug
          ),
          blog_tag_relations (
            tag_id,
            blog_tags (
              id,
              name,
              slug
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = async (post = null) => {
    if (post) {
      // Load post translations
      const { data: translations, error } = await supabase
        .from('blogs_translations')
        .select('*')
        .eq('blog_id', post.id);
      
      if (!error && translations) {
        const translationsMap = {};
        translations.forEach(trans => {
          translationsMap[trans.language_code] = {
            title: trans.title,
            excerpt: trans.excerpt,
            content: trans.content,
            meta_title: trans.meta_title,
            meta_description: trans.meta_description,
            meta_keywords: trans.meta_keywords,
          };
        });
        
        setFormData({
          ...post,
          translations: translationsMap,
          tags: post.blog_tag_relations ? post.blog_tag_relations.map(rel => rel.tag_id) : [],
        });
      } else {
        setFormData({
          ...post,
          translations: {},
          tags: post.blog_tag_relations ? post.blog_tag_relations.map(rel => rel.tag_id) : [],
        });
      }
      
      setEditingPost(post);
    } else {
      // Reset form for new post
      setFormData({
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        featured_image: '',
        author_name: '',
        author_image: '',
        category_id: '',
        status: 'draft',
        is_featured: false,
        reading_time: 5,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_image: '',
        translations: {},
        tags: [],
      });
      setEditingPost(null);
    }
    setActiveTab('en');
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPost(null);
    setActiveTab('en');
  };
  
  const handleSave = async () => {
    try {
      // Process content to ensure proper HTML formatting
      const processContent = (content) => {
        if (!content) return '';
        
        // Check if content is already HTML (contains HTML tags)
        const hasHtmlTags = /<[^>]+>/.test(content);
        
        if (hasHtmlTags) {
          // Content is already HTML, return as is
          return content;
        } else {
          // Convert plain text to HTML
          // Split by double newlines for paragraphs
          let paragraphs = content.split(/\n\n+/);
          
          // Process each paragraph
          paragraphs = paragraphs.map(para => {
            // Replace single newlines with <br> within paragraphs
            para = para.replace(/\n/g, '<br>');
            // Wrap in <p> tags if not empty
            return para.trim() ? `<p>${para}</p>` : '';
          }).filter(p => p); // Remove empty paragraphs
          
          return paragraphs.join('\n');
        }
      };
      
      const postData = {
        slug: formData.slug,
        title: formData.title,
        excerpt: formData.excerpt,
        content: processContent(formData.content),
        featured_image: formData.featured_image,
        author_name: formData.author_name,
        author_image: formData.author_image,
        category_id: formData.category_id || null,
        status: formData.status,
        is_featured: formData.is_featured,
        reading_time: formData.reading_time,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        og_image: formData.og_image,
      };
      
      let postId;
      
      if (editingPost) {
        // Update existing post
        const { data, error } = await supabase
          .from('blogs')
          .update(postData)
          .eq('id', editingPost.id)
          .select()
          .single();
        
        if (error) throw error;
        postId = editingPost.id;
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blogs')
          .insert(postData)
          .select()
          .single();
        
        if (error) throw error;
        postId = data.id;
      }
      
      // Update tags
      // First, delete existing tag relations
      await supabase
        .from('blog_tag_relations')
        .delete()
        .eq('blog_id', postId);
      
      // Then insert new tag relations
      if (formData.tags.length > 0) {
        const tagRelations = formData.tags.map(tagId => ({
          blog_id: postId,
          tag_id: tagId,
        }));
        
        await supabase
          .from('blog_tag_relations')
          .insert(tagRelations);
      }
      
      // Update translations
      for (const [langCode, translation] of Object.entries(formData.translations)) {
        if (langCode !== 'en' && translation.title) {
          const translationData = {
            blog_id: postId,
            language_code: langCode,
            title: translation.title,
            excerpt: translation.excerpt,
            content: processContent(translation.content),
            meta_title: translation.meta_title,
            meta_description: translation.meta_description,
            meta_keywords: translation.meta_keywords,
          };
          
          await supabase
            .from('blogs_translations')
            .upsert(translationData, {
              onConflict: 'blog_id,language_code',
            });
        }
      }
      
      showSnackbar(editingPost ? 'Blog post updated successfully' : 'Blog post created successfully', 'success');
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving post:', error);
      showSnackbar(`Error saving post: ${error.message}`, 'error');
    }
  };
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', deletingPost.id);
      
      if (error) throw error;
      
      showSnackbar('Blog post deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setDeletingPost(null);
      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      showSnackbar(`Error deleting post: ${error.message}`, 'error');
    }
  };
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleTranslationChange = (langCode, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: {
          ...prev.translations[langCode],
          [field]: value,
        },
      },
    }));
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleToggleFeatured = async (post) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ is_featured: !post.is_featured })
        .eq('id', post.id);
      
      if (error) throw error;
      
      showSnackbar(`Post ${post.is_featured ? 'unfeatured' : 'featured'} successfully`, 'success');
      loadData();
    } catch (error) {
      console.error('Error toggling featured:', error);
      showSnackbar('Error updating post', 'error');
    }
  };
  
  const handleToggleStatus = async (post) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('blogs')
        .update({ status: newStatus })
        .eq('id', post.id);
      
      if (error) throw error;
      
      showSnackbar(`Post ${newStatus} successfully`, 'success');
      loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
      showSnackbar('Error updating post status', 'error');
    }
  };
  
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blog Posts Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Post
        </Button>
      </Box>
      
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Published Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPosts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{post.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {post.blog_categories?.name || '-'}
                  </TableCell>
                  <TableCell>{post.author_name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.status}
                      color={getStatusColor(post.status)}
                      size="small"
                      onClick={() => handleToggleStatus(post)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFeatured(post)}
                      color={post.is_featured ? 'warning' : 'default'}
                    >
                      {post.is_featured ? <Star /> : <StarBorder />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{post.views_count || 0}</TableCell>
                  <TableCell>{formatDate(post.publish_date)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(post)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingPost(post);
                        setOpenDeleteDialog(true);
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="English (Default)" value="en" />
              {languages
                .filter(lang => lang.code !== 'en')
                .map(lang => (
                  <Tab key={lang.code} label={lang.name} value={lang.code} />
                ))}
            </Tabs>
            
            <Box sx={{ mt: 3 }}>
              {activeTab === 'en' ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      required
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Slug"
                      value={formData.slug}
                      onChange={(e) => handleFormChange('slug', e.target.value)}
                      required
                      margin="normal"
                      helperText="URL-friendly version of the title"
                    />
                    <TextField
                      fullWidth
                      label="Excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleFormChange('excerpt', e.target.value)}
                      multiline
                      rows={3}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Content"
                      value={formData.content}
                      onChange={(e) => handleFormChange('content', e.target.value)}
                      multiline
                      rows={10}
                      margin="normal"
                      required
                      helperText="You can enter HTML directly or plain text. Line breaks will be preserved automatically."
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Featured Image
                      </Typography>
                      <ImageUpload
                        currentImage={formData.featured_image}
                        onImageChange={(imageUrl) => handleFormChange('featured_image', imageUrl)}
                        folder="blog-featured"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Author Name"
                      value={formData.author_name}
                      onChange={(e) => handleFormChange('author_name', e.target.value)}
                      margin="normal"
                    />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Author Image
                      </Typography>
                      <ImageUpload
                        currentImage={formData.author_image}
                        onImageChange={(imageUrl) => handleFormChange('author_image', imageUrl)}
                        folder="blog-authors"
                      />
                    </Box>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category_id}
                        onChange={(e) => handleFormChange('category_id', e.target.value)}
                        label="Category"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {categories.map(category => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Tags</InputLabel>
                      <Select
                        multiple
                        value={formData.tags}
                        onChange={(e) => handleFormChange('tags', e.target.value)}
                        label="Tags"
                      >
                        {tags.map(tag => (
                          <MenuItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Reading Time (minutes)"
                      type="number"
                      value={formData.reading_time}
                      onChange={(e) => handleFormChange('reading_time', parseInt(e.target.value))}
                      margin="normal"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_featured}
                          onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                        />
                      }
                      label="Featured Post"
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      SEO Settings
                    </Typography>
                    <TextField
                      fullWidth
                      label="Meta Title"
                      value={formData.meta_title}
                      onChange={(e) => handleFormChange('meta_title', e.target.value)}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Meta Description"
                      value={formData.meta_description}
                      onChange={(e) => handleFormChange('meta_description', e.target.value)}
                      multiline
                      rows={2}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Meta Keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => handleFormChange('meta_keywords', e.target.value)}
                      margin="normal"
                      helperText="Comma-separated keywords"
                    />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        OG Image (for social sharing)
                      </Typography>
                      <ImageUpload
                        currentImage={formData.og_image}
                        onImageChange={(imageUrl) => handleFormChange('og_image', imageUrl)}
                        folder="blog-og"
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                // Translation fields
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Translating content for {languages.find(l => l.code === activeTab)?.name}
                    </Alert>
                    <TextField
                      fullWidth
                      label="Title"
                      value={formData.translations[activeTab]?.title || ''}
                      onChange={(e) => handleTranslationChange(activeTab, 'title', e.target.value)}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Excerpt"
                      value={formData.translations[activeTab]?.excerpt || ''}
                      onChange={(e) => handleTranslationChange(activeTab, 'excerpt', e.target.value)}
                      multiline
                      rows={3}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Content"
                      value={formData.translations[activeTab]?.content || ''}
                      onChange={(e) => handleTranslationChange(activeTab, 'content', e.target.value)}
                      multiline
                      rows={10}
                      margin="normal"
                      helperText="You can enter HTML directly or plain text. Line breaks will be preserved automatically."
                    />
                    <TextField
                      fullWidth
                      label="Meta Title"
                      value={formData.translations[activeTab]?.meta_title || ''}
                      onChange={(e) => handleTranslationChange(activeTab, 'meta_title', e.target.value)}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Meta Description"
                      value={formData.translations[activeTab]?.meta_description || ''}
                      onChange={(e) => handleTranslationChange(activeTab, 'meta_description', e.target.value)}
                      multiline
                      rows={2}
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Meta Keywords"
                      value={formData.translations[activeTab]?.meta_keywords || ''}
                      onChange={(e) => handleTranslationChange(activeTab, 'meta_keywords', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Blog Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BlogPosts;