import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Snackbar,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Category,
  LocalOffer,
  Share,
  Twitter,
  Facebook,
  LinkedIn,
  ContentCopy,
  Visibility,
  ArrowBack,
  Person
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useLoading } from '../contexts/LoadingContext';
import { fetchBlogBySlug, fetchRelatedBlogPosts } from '../api/content';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, loading: translationsLoading } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { startLoading, stopLoading } = useLoading();
  
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Fetch blog post and related posts
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      startLoading('blogPost');
      
      try {
        const postData = await fetchBlogBySlug(slug, currentLanguage);
        
        if (!postData) {
          setError('Post not found');
          setLoading(false);
          stopLoading('blogPost');
          return;
        }
        
        setPost(postData);
        
        // Fetch related posts
        if (postData.category_id) {
          const related = await fetchRelatedBlogPosts(
            postData.id,
            postData.category_id,
            3,
            currentLanguage
          );
          setRelatedPosts(related || []);
        }
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('Error loading post');
      } finally {
        setLoading(false);
        stopLoading('blogPost');
      }
    };
    
    loadPost();
  }, [slug, currentLanguage]);
  
  // Set document title
  React.useEffect(() => {
    if (post) {
      document.title = post.meta_title || `${post.title} | WiMed Blog`;
    }
  }, [post]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      currentLanguage === 'fr' ? 'fr-FR' : 
      currentLanguage === 'es' ? 'es-ES' : 
      'en-GB',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  };
  
  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setSnackbar({ open: true, message: t('blog.link_copied') });
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
        break;
      default:
        break;
    }
  };
  
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
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Skeleton variant="text" height={60} />
          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={100} />
          </Box>
          <Skeleton variant="rectangular" height={400} sx={{ my: 3 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </Box>
      </Container>
    );
  }
  
  if (error || !post) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Post not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/blog')}
          variant="outlined"
        >
          {t('blog.back_to_blog')}
        </Button>
      </Container>
    );
  }
  
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Back button */}
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/blog')}
              sx={{ mb: 3 }}
              variant="text"
            >
              {t('blog.back_to_blog')}
            </Button>
            
            {/* Post header */}
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.75rem' },
                color: '#2c3e50',
                lineHeight: 1.2
              }}
            >
              {post.title}
            </Typography>
            
            {/* Meta information */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {post.blog_categories && (
                <Chip
                  icon={<Category sx={{ fontSize: 16 }} />}
                  label={post.blog_categories.name}
                  sx={{
                    backgroundColor: post.blog_categories.color || '#3B9FD9',
                    color: 'white'
                  }}
                />
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(post.publish_date)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {post.reading_time} {t('blog.reading_time')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {post.views_count} {t('blog.views')}
                </Typography>
              </Box>
            </Box>
            
            {/* Author info */}
            {post.author_name && (
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {post.author_image ? (
                    <Avatar
                      src={post.author_image}
                      alt={post.author_name}
                      sx={{ width: 56, height: 56 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 56, height: 56 }}>
                      <Person />
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('blog.by_author')} {post.author_name}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            
            {/* Featured image */}
            {post.featured_image && (
              <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={post.featured_image}
                  alt={post.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </Box>
            )}
            
            {/* Share buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {t('blog.share')}:
              </Typography>
              <Tooltip title={t('blog.share_twitter')}>
                <IconButton onClick={() => handleShare('twitter')} color="primary">
                  <Twitter />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('blog.share_facebook')}>
                <IconButton onClick={() => handleShare('facebook')} color="primary">
                  <Facebook />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('blog.share_linkedin')}>
                <IconButton onClick={() => handleShare('linkedin')} color="primary">
                  <LinkedIn />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('blog.copy_link')}>
                <IconButton onClick={() => handleShare('copy')} color="primary">
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Post content */}
            <Typography
              component="div"
              sx={{
                '& h2': {
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  mt: 4,
                  mb: 2,
                  color: '#2c3e50'
                },
                '& h3': {
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  mt: 3,
                  mb: 2,
                  color: '#2c3e50'
                },
                '& p': {
                  mb: 2,
                  lineHeight: 1.8
                },
                '& ul, & ol': {
                  mb: 2,
                  pl: 3
                },
                '& li': {
                  mb: 1,
                  lineHeight: 1.8
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  my: 3,
                  borderRadius: 1
                },
                '& blockquote': {
                  borderLeft: '4px solid #3B9FD9',
                  pl: 3,
                  py: 1,
                  my: 3,
                  fontStyle: 'italic',
                  color: 'text.secondary'
                },
                '& pre': {
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  my: 3
                },
                '& code': {
                  backgroundColor: 'grey.100',
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.5,
                  fontFamily: 'monospace'
                }
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Tags */}
            {post.blog_tag_relations && post.blog_tag_relations.length > 0 && (
              <Box sx={{ mt: 4, mb: 6 }}>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <LocalOffer sx={{ color: 'text.secondary' }} />
                  {post.blog_tag_relations.map((rel) => (
                    <Chip
                      key={rel.blog_tags.id}
                      label={rel.blog_tags.name}
                      component={Link}
                      to={`/blog?tag=${rel.blog_tags.slug}`}
                      clickable
                      variant="outlined"
                      sx={{ textDecoration: 'none' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Share buttons (bottom) */}
            <Paper elevation={0} sx={{ p: 3, backgroundColor: 'grey.50', mb: 6 }}>
              <Typography variant="h6" gutterBottom>
                {t('blog.share')} this article
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Twitter />}
                  onClick={() => handleShare('twitter')}
                  variant="outlined"
                >
                  Twitter
                </Button>
                <Button
                  startIcon={<Facebook />}
                  onClick={() => handleShare('facebook')}
                  variant="outlined"
                >
                  Facebook
                </Button>
                <Button
                  startIcon={<LinkedIn />}
                  onClick={() => handleShare('linkedin')}
                  variant="outlined"
                >
                  LinkedIn
                </Button>
                <Button
                  startIcon={<ContentCopy />}
                  onClick={() => handleShare('copy')}
                  variant="outlined"
                >
                  {t('blog.copy_link')}
                </Button>
              </Box>
            </Paper>
          </Box>
          
          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <Box sx={{ mt: 8 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}
              >
                {t('blog.related_posts')}
              </Typography>
              
              <Grid container spacing={3}>
                {relatedPosts.map((relatedPost) => (
                  <Grid item xs={12} md={4} key={relatedPost.id}>
                    <Card
                        component={Link}
                        to={`/blog/${relatedPost.slug}`}
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
                        {relatedPost.featured_image && (
                          <CardMedia
                            component="img"
                            height="200"
                            image={relatedPost.featured_image}
                            alt={relatedPost.title}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        
                        <CardContent sx={{ flexGrow: 1 }}>
                          {relatedPost.blog_categories && (
                            <Chip
                              label={relatedPost.blog_categories.name}
                              size="small"
                              sx={{
                                mb: 1,
                                backgroundColor: relatedPost.blog_categories.color || '#3B9FD9',
                                color: 'white'
                              }}
                            />
                          )}
                          
                          <Typography
                            variant="h6"
                            component="h3"
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
                            {relatedPost.title}
                          </Typography>
                          
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {relatedPost.excerpt}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(relatedPost.publish_date)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {relatedPost.reading_time} {t('blog.reading_time')}
                            </Typography>
                          </Box>
                        </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
          </Box>
        )}
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </>
  );
};

export default BlogPost;