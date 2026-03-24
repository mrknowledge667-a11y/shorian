import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Category,
  LocalOffer,
  Search,
  Clear,
  Visibility
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import {
  fetchBlogPosts,
  fetchBlogCategories,
  fetchBlogTags
} from '../api/content';

const Blog = () => {
  const { t, loading: translationsLoading } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const postsPerPage = 9;
  
  // Fetch categories and tags on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetchBlogCategories(currentLanguage),
          fetchBlogTags(currentLanguage)
        ]);
        setCategories(categoriesData || []);
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    
    loadFilters();
  }, [currentLanguage]);
  
  // Fetch blog posts when filters change
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const categoryId = selectedCategory 
          ? categories.find(c => c.slug === selectedCategory)?.id 
          : null;
        const tagId = selectedTag 
          ? tags.find(t => t.slug === selectedTag)?.id 
          : null;
          
        const result = await fetchBlogPosts({
          page: currentPage,
          limit: postsPerPage,
          categoryId,
          tagId,
          searchQuery: searchQuery || null,
        }, currentLanguage);
        
        setPosts(result.blogs || []);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.totalCount || 0);
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (categories.length > 0 && tags.length > 0) {
      loadPosts();
    }
  }, [currentPage, selectedCategory, selectedTag, searchQuery, currentLanguage, categories, tags]);
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedTag, currentPage, setSearchParams]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setCurrentPage(1);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'es' ? 'es-ES' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const hasActiveFilters = searchQuery || selectedCategory || selectedTag;
  
  // Set document title
  React.useEffect(() => {
    document.title = t('blog.meta_title');
  }, [t]);
  
  // Show loading state until translations are loaded
  if (translationsLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#2c3e50'
            }}
          >
            {t('blog.title')}
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {t('blog.subtitle')}
          </Typography>
        </Box>
        
        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={t('blog.search_placeholder')}
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
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchQuery('');
                            setCurrentPage(1);
                          }}
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </form>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-filter-label" shrink>{t('blog.filter_by_category')}</InputLabel>
                <Select
                  labelId="category-filter-label"
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  label={t('blog.filter_by_category')}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>{t('blog.all_posts')}</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.slug}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.color && (
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color
                            }}
                          />
                        )}
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="tag-filter-label" shrink>{t('blog.filter_by_tag')}</InputLabel>
                <Select
                  labelId="tag-filter-label"
                  id="tag-filter"
                  value={selectedTag}
                  onChange={(e) => {
                    setSelectedTag(e.target.value);
                    setCurrentPage(1);
                  }}
                  label={t('blog.filter_by_tag')}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>{t('blog.all_posts')}</em>
                  </MenuItem>
                  {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.slug}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              {hasActiveFilters && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<Clear />}
                >
                  {t('blog.clear_filters')}
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
        
        {/* Results Count */}
        {!loading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {totalCount} {totalCount === 1 ? 'post' : 'posts'} found
              {hasActiveFilters && ' with current filters'}
            </Typography>
          </Box>
        )}
        
        {/* Blog Posts Grid */}
        <Grid container spacing={3}>
          {loading ? (
            // Loading skeletons
            Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={60} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Skeleton variant="text" width={100} />
                      <Skeleton variant="text" width={100} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : posts.length === 0 ? (
            // No posts found
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" gutterBottom color="text.secondary">
                  {t('blog.no_posts_found')}
                </Typography>
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    sx={{ mt: 2 }}
                  >
                    {t('blog.clear_filters')}
                  </Button>
                )}
              </Box>
            </Grid>
          ) : (
            // Blog posts
            posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card
                    component={Link}
                    to={`/blog/${post.slug}`}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    {post.featured_image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.featured_image}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Category */}
                      {post.blog_categories && (
                        <Chip
                          icon={<Category sx={{ fontSize: 16 }} />}
                          label={post.blog_categories.name}
                          size="small"
                          sx={{
                            mb: 2,
                            backgroundColor: post.blog_categories.color || '#3B9FD9',
                            color: 'white',
                            alignSelf: 'flex-start'
                          }}
                        />
                      )}
                      
                      {/* Title */}
                      <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: '#2c3e50',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {post.title}
                      </Typography>
                      
                      {/* Excerpt */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                          flexGrow: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {post.excerpt}
                      </Typography>
                      
                      {/* Meta info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(post.publish_date)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {post.reading_time} {t('blog.reading_time')}
                          </Typography>
                        </Box>
                        
                        {post.views_count > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                            <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {post.views_count}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {/* Tags */}
                      {post.blog_tag_relations && post.blog_tag_relations.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {post.blog_tag_relations.slice(0, 3).map((rel) => (
                            <Chip
                              key={rel.blog_tags.id}
                              icon={<LocalOffer sx={{ fontSize: 14 }} />}
                              label={rel.blog_tags.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
        
        {/* Featured Categories */}
        {!loading && categories.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {t('blog.categories')}
            </Typography>
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                  <Card
                    component={Button}
                    fullWidth
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      setCurrentPage(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    sx={{
                      p: 2,
                      textAlign: 'left',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      backgroundColor: selectedCategory === category.slug ? 
                        category.color || '#3B9FD9' : 'background.paper',
                      color: selectedCategory === category.slug ? 'white' : 'text.primary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: category.color || '#3B9FD9',
                        color: 'white'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.icon && (
                        <i className={`fas ${category.icon}`} style={{ fontSize: 20 }} />
                      )}
                      <Box>
                        <Typography variant="h6" component="div">
                          {category.name}
                        </Typography>
                        {category.description && (
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {category.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {/* Popular Tags */}
        {!loading && tags.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {t('blog.tags')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() => {
                    setSelectedTag(tag.slug);
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  variant={selectedTag === tag.slug ? 'filled' : 'outlined'}
                  color="primary"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
    </Container>
  );
};

export default Blog;