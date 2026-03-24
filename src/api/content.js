// src/api/content.js
import { supabase } from './supabaseClient';

// Cache for default language
let defaultLanguageCache = null;

// Get current language from localStorage with database default fallback
const getCurrentLanguage = () => {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // If we have cached default, use it
  if (defaultLanguageCache) {
    return defaultLanguageCache;
  }
  
  // Otherwise fall back to 'en' (this should rarely happen as LanguageContext sets it)
  return 'en';
};

// Function to fetch and cache default language
export async function fetchDefaultLanguage() {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('code')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();
    
    if (data && !error) {
      defaultLanguageCache = data.code;
      return data.code;
    }
  } catch (error) {
    console.error('Error fetching default language:', error);
  }
  return 'en';
}

// Shared helper
async function handle(req) {
  try {
    const { data, error } = await req;
    if (error) {
      console.error('Supabase error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Request error:', err);
    return null;
  }
}

// Languages
export async function fetchActiveLanguages() {
  return handle(
    supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  );
}

// Translations
export async function fetchTranslations(language = null) {
  const lang = language || getCurrentLanguage();
  return handle(
    supabase
      .from('translations')
      .select('*')
      .eq('language_code', lang)
  );
}

export async function fetchTranslation(key, language = null) {
  const lang = language || getCurrentLanguage();
  const result = await handle(
    supabase
      .from('translations')
      .select('translation_value')
      .eq('language_code', lang)
      .eq('translation_key', key)
      .single()
  );
  return result?.translation_value || key;
}

// Settings with translations
export async function fetchSiteSettings(language = null) {
  const lang = language || getCurrentLanguage();
  const settings = await handle(supabase.from('site_settings').select('*').eq('id', 1).single());
  
  if (!settings) return null;
  
  // Fetch translations if not English
  if (lang !== 'en') {
    const translations = await handle(
      supabase
        .from('site_settings_translations')
        .select('*')
        .eq('setting_id', 1)
        .eq('language_code', lang)
        .single()
    );
    
    if (translations) {
      // Merge translations with base settings
      return {
        ...settings,
        hero_title: translations.hero_title || settings.hero_title,
        hero_subtitle: translations.hero_subtitle || settings.hero_subtitle,
        value_prop_title: translations.value_prop_title || settings.value_prop_title,
        value_prop_subtitle: translations.value_prop_subtitle || settings.value_prop_subtitle,
        categories_title: translations.categories_title || settings.categories_title,
        categories_subtitle: translations.categories_subtitle || settings.categories_subtitle,
        new_arrivals_title: translations.new_arrivals_title || settings.new_arrivals_title,
        new_arrivals_subtitle: translations.new_arrivals_subtitle || settings.new_arrivals_subtitle,
        brands_title: translations.brands_title || settings.brands_title,
        brands_subtitle: translations.brands_subtitle || settings.brands_subtitle,
      };
    }
  }
  
  return settings;
}

// Brands
export async function fetchBrands() {
  return handle(
    supabase.from('brands').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true })
  );
}

// Categories
export async function fetchCategories(language = null) {
  const lang = language || getCurrentLanguage();
  const categories = await handle(
    supabase.from('categories').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true })
  );
  
  if (!categories || lang === 'en') return categories;
  
  // Fetch translations
  const categoryIds = categories.map(cat => cat.id);
  const translations = await handle(
    supabase
      .from('categories_translations')
      .select('*')
      .in('category_id', categoryIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return categories;
  
  // Map translations to categories
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.category_id] = trans;
    return acc;
  }, {});
  
  return categories.map(category => ({
    ...category,
    name: translationMap[category.id]?.name || category.name,
    description: translationMap[category.id]?.description || category.description,
  }));
}

export async function fetchCategoryBySlug(slug) {
  return handle(supabase.from('categories').select('*').eq('slug', slug).single());
}

export async function fetchProductsByCategoryId(categoryId, language = null) {
  const lang = language || getCurrentLanguage();
  const products = await handle(
    supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!products || lang === 'en') return products;
  
  // Fetch translations
  const productIds = products.map(prod => prod.id);
  const translations = await handle(
    supabase
      .from('products_translations')
      .select('*')
      .in('product_id', productIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return products;
  
  // Map translations to products
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.product_id] = trans;
    return acc;
  }, {});
  
  return products.map(product => ({
    ...product,
    name: translationMap[product.id]?.name || product.name,
    description: translationMap[product.id]?.description || product.description,
  }));
}

export async function fetchProductsByCategorySlug(slug, language = null) {
  const category = await fetchCategoryBySlug(slug);
  if (!category?.id) return [];
  return fetchProductsByCategoryId(category.id, language);
}

// Products
export async function fetchNewProducts(language = null) {
  const lang = language || getCurrentLanguage();
  const products = await handle(
    supabase
      .from('products')
      .select('*')
      .eq('is_new', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!products || lang === 'en') return products;
  
  // Fetch translations
  const productIds = products.map(prod => prod.id);
  const translations = await handle(
    supabase
      .from('products_translations')
      .select('*')
      .in('product_id', productIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return products;
  
  // Map translations to products
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.product_id] = trans;
    return acc;
  }, {});
  
  return products.map(product => ({
    ...product,
    name: translationMap[product.id]?.name || product.name,
    description: translationMap[product.id]?.description || product.description,
  }));
}

// Fetch single product by ID
export async function fetchProductById(productId, language = null) {
  const lang = language || getCurrentLanguage();
  const product = await handle(
    supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', productId)
      .single()
  );
  
  if (!product || lang === 'en') return product;
  
  // Fetch translation
  const translation = await handle(
    supabase
      .from('products_translations')
      .select('*')
      .eq('product_id', productId)
      .eq('language_code', lang)
      .single()
  );
  
  if (translation) {
    return {
      ...product,
      name: translation.name || product.name,
      description: translation.description || product.description,
      detailed_description: translation.detailed_description || product.detailed_description,
      specifications: translation.specifications || product.specifications,
      features: translation.features || product.features,
    };
  }
  
  return product;
}

// Services
export async function fetchServices(language = null) {
  const lang = language || getCurrentLanguage();
  const services = await handle(
    supabase.from('services').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true })
  );
  
  if (!services || lang === 'en') return services;
  
  // Fetch translations
  const serviceIds = services.map(service => service.id);
  const translations = await handle(
    supabase
      .from('services_translations')
      .select('*')
      .in('service_id', serviceIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return services;
  
  // Map translations to services
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.service_id] = trans;
    return acc;
  }, {});
  
  return services.map(service => ({
    ...service,
    title: translationMap[service.id]?.title || service.title,
    description: translationMap[service.id]?.description || service.description,
    features: translationMap[service.id]?.features || service.features,
  }));
}

// About
export async function fetchAboutSections(language = null) {
  const lang = language || getCurrentLanguage();
  const sections = await handle(
    supabase
      .from('about_sections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!sections || lang === 'en') return sections;
  
  // Fetch translations
  const sectionIds = sections.map(section => section.id);
  const translations = await handle(
    supabase
      .from('about_sections_translations')
      .select('*')
      .in('section_id', sectionIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return sections;
  
  // Map translations to sections
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.section_id] = trans;
    return acc;
  }, {});
  
  return sections.map(section => ({
    ...section,
    title: translationMap[section.id]?.title || section.title,
    content: translationMap[section.id]?.content || section.content,
  }));
}

export async function fetchTeamMembers(language = null) {
  const lang = language || getCurrentLanguage();
  const members = await handle(
    supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!members || lang === 'en') return members;
  
  // Fetch translations
  const memberIds = members.map(member => member.id);
  const translations = await handle(
    supabase
      .from('team_members_translations')
      .select('*')
      .in('member_id', memberIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return members;
  
  // Map translations to members
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.member_id] = trans;
    return acc;
  }, {});
  
  return members.map(member => ({
    ...member,
    name: translationMap[member.id]?.name || member.name,
    position: translationMap[member.id]?.position || member.position,
    bio: translationMap[member.id]?.bio || member.bio,
  }));
}

// Contact
export async function fetchContactBlocks(language = null) {
  const lang = language || getCurrentLanguage();
  const blocks = await handle(
    supabase
      .from('contact_blocks')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!blocks || lang === 'en') return blocks;
  
  // Fetch translations
  const blockIds = blocks.map(block => block.id);
  const translations = await handle(
    supabase
      .from('contact_blocks_translations')
      .select('*')
      .in('block_id', blockIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return blocks;
  
  // Map translations to blocks
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.block_id] = trans;
    return acc;
  }, {});
  
  return blocks.map(block => ({
    ...block,
    title: translationMap[block.id]?.title || block.title,
    content_lines: translationMap[block.id]?.content_lines || block.content_lines,
  }));
}

// Collapsible (Landing Accordion)
export async function fetchCollapsibleSections(language = null) {
  const lang = language || getCurrentLanguage();
  const sections = await handle(
    supabase
      .from('collapsible_sections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!sections || lang === 'en') return sections;
  
  // Fetch translations
  const sectionIds = sections.map(section => section.id);
  const translations = await handle(
    supabase
      .from('collapsible_sections_translations')
      .select('*')
      .in('section_id', sectionIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return sections;
  
  // Map translations to sections
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.section_id] = trans;
    return acc;
  }, {});
  
  return sections.map(section => {
    const translation = translationMap[section.id];
    if (translation) {
      // If we have a translation, parse the content as JSON if it contains items
      let translatedItems = section.items;
      if (translation.content) {
        try {
          // Try to parse as JSON array
          translatedItems = JSON.parse(translation.content);
        } catch {
          // If not JSON, split by newlines for backward compatibility
          translatedItems = translation.content.split('\n').filter(item => item.trim());
        }
      }
      return {
        ...section,
        title: translation.title || section.title,
        items: translatedItems,
      };
    }
    return section;
  });
}

// Header Navigation with translations
export async function fetchHeaderNavItems(language = null) {
  const lang = language || getCurrentLanguage();
  const navItems = await handle(
    supabase
      .from('header_nav_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!navItems || lang === 'en') return navItems;
  
  // Fetch translations
  const navIds = navItems.map(item => item.id);
  const translations = await handle(
    supabase
      .from('header_nav_items_translations')
      .select('*')
      .in('nav_item_id', navIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return navItems;
  
  // Map translations to nav items
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.nav_item_id] = trans;
    return acc;
  }, {});
  
  return navItems.map(item => ({
    ...item,
    name: translationMap[item.id]?.name || item.name,
  }));
}

// Footer Settings
export async function fetchFooterSettings(language = null) {
  const lang = language || getCurrentLanguage();
  const settings = await handle(supabase.from('footer_settings').select('*').eq('id', 1).single());
  
  if (!settings) return null;
  
  // Fetch translations if not English
  if (lang !== 'en') {
    const translations = await handle(
      supabase
        .from('footer_settings_translations')
        .select('*')
        .eq('setting_id', 1)
        .eq('language_code', lang)
        .single()
    );
    
    if (translations) {
      // Merge translations with base settings
      return {
        ...settings,
        office_address_lines: translations.office_address_lines || settings.office_address_lines,
        about_text: translations.about_text || settings.about_text,
        copyright_text: translations.copyright_text || settings.copyright_text,
      };
    }
  }
  
  return settings;
}

// Footer Links
export async function fetchFooterLinks(language = null) {
  const lang = language || getCurrentLanguage();
  const links = await handle(
    supabase
      .from('footer_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!links || lang === 'en') return links;
  
  // Fetch translations
  const linkIds = links.map(link => link.id);
  const translations = await handle(
    supabase
      .from('footer_links_translations')
      .select('*')
      .in('link_id', linkIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return links;
  
  // Map translations to links
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.link_id] = trans;
    return acc;
  }, {});
  
  return links.map(link => ({
    ...link,
    label: translationMap[link.id]?.label || link.label,
  }));
}

// Search Products
export async function searchProducts(searchQuery, language = null) {
  const lang = language || getCurrentLanguage();
  
  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }
  
  // First, get all products with their categories
  const products = await handle(
    supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          slug
        )
      `)
      .order('name', { ascending: true })
  );
  
  if (!products || products.length === 0) {
    return [];
  }
  
  // If English, search directly in the products
  if (lang === 'en') {
    return products.filter(product => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    });
  }
  
  // For other languages, fetch translations and search in them
  const productIds = products.map(prod => prod.id);
  const translations = await handle(
    supabase
      .from('products_translations')
      .select('*')
      .in('product_id', productIds)
      .eq('language_code', lang)
  );
  
  if (!translations) {
    // If no translations found, fall back to English search
    return products.filter(product => {
      const searchLower = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    });
  }
  
  // Create translation map
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.product_id] = trans;
    return acc;
  }, {});
  
  // Search in translated content
  const searchLower = searchQuery.toLowerCase();
  return products.filter(product => {
    const translation = translationMap[product.id];
    if (translation) {
      return (
        (translation.name && translation.name.toLowerCase().includes(searchLower)) ||
        (translation.description && translation.description.toLowerCase().includes(searchLower))
      );
    } else {
      // Fall back to English if no translation
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
  }).map(product => {
    // Apply translations to the returned products
    const translation = translationMap[product.id];
    return {
      ...product,
      name: translation?.name || product.name,
      description: translation?.description || product.description,
    };
  });
}

// Blog Categories
export async function fetchBlogCategories(language = null) {
  const lang = language || getCurrentLanguage();
  const categories = await handle(
    supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!categories || lang === 'en') return categories;
  
  // Fetch translations
  const categoryIds = categories.map(cat => cat.id);
  const translations = await handle(
    supabase
      .from('blog_categories_translations')
      .select('*')
      .in('category_id', categoryIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return categories;
  
  // Map translations to categories
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.category_id] = trans;
    return acc;
  }, {});
  
  return categories.map(category => ({
    ...category,
    name: translationMap[category.id]?.name || category.name,
    description: translationMap[category.id]?.description || category.description,
  }));
}

// Blog Tags
export async function fetchBlogTags(language = null) {
  const lang = language || getCurrentLanguage();
  const tags = await handle(
    supabase
      .from('blog_tags')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })
  );
  
  if (!tags || lang === 'en') return tags;
  
  // Fetch translations
  const tagIds = tags.map(tag => tag.id);
  const translations = await handle(
    supabase
      .from('blog_tags_translations')
      .select('*')
      .in('tag_id', tagIds)
      .eq('language_code', lang)
  );
  
  if (!translations) return tags;
  
  // Map translations to tags
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.tag_id] = trans;
    return acc;
  }, {});
  
  return tags.map(tag => ({
    ...tag,
    name: translationMap[tag.id]?.name || tag.name,
  }));
}

// Blog Posts with pagination and filters
export async function fetchBlogPosts(options = {}, language = null) {
  const lang = language || getCurrentLanguage();
  const {
    page = 1,
    limit = 9,
    categoryId = null,
    tagId = null,
    featured = null,
    searchQuery = null,
    status = 'published'
  } = options;
  
  const offset = (page - 1) * limit;
  
  // Build the base query
  let query = supabase
    .from('blogs')
    .select(`
      *,
      blog_categories (
        id,
        slug,
        name,
        color
      ),
      blog_tag_relations (
        blog_tags (
          id,
          slug,
          name
        )
      )
    `, { count: 'exact' })
    .eq('status', status)
    .order('publish_date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  // Apply filters
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  if (featured !== null) {
    query = query.eq('is_featured', featured);
  }
  
  // Execute query
  const { data: blogs, error, count } = await query;
  
  if (error || !blogs) return { blogs: [], totalCount: 0 };
  
  // Filter by tag if specified
  let filteredBlogs = blogs;
  if (tagId) {
    filteredBlogs = blogs.filter(blog =>
      blog.blog_tag_relations.some(rel => rel.blog_tags.id === tagId)
    );
  }
  
  // Filter by search query if specified
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filteredBlogs = filteredBlogs.filter(blog =>
      blog.title.toLowerCase().includes(searchLower) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchLower))
    );
  }
  
  // If not English, fetch translations
  if (lang !== 'en' && filteredBlogs.length > 0) {
    const blogIds = filteredBlogs.map(blog => blog.id);
    const translations = await handle(
      supabase
        .from('blogs_translations')
        .select('*')
        .in('blog_id', blogIds)
        .eq('language_code', lang)
    );
    
    if (translations) {
      const translationMap = translations.reduce((acc, trans) => {
        acc[trans.blog_id] = trans;
        return acc;
      }, {});
      
      // Also fetch category translations
      const categoryIds = [...new Set(filteredBlogs.map(blog => blog.category_id).filter(id => id))];
      const categoryTranslations = await handle(
        supabase
          .from('blog_categories_translations')
          .select('*')
          .in('category_id', categoryIds)
          .eq('language_code', lang)
      );
      
      const categoryTranslationMap = categoryTranslations ? categoryTranslations.reduce((acc, trans) => {
        acc[trans.category_id] = trans;
        return acc;
      }, {}) : {};
      
      // Also fetch tag translations
      const tagIds = [...new Set(filteredBlogs.flatMap(blog =>
        blog.blog_tag_relations.map(rel => rel.blog_tags.id)
      ))];
      const tagTranslations = await handle(
        supabase
          .from('blog_tags_translations')
          .select('*')
          .in('tag_id', tagIds)
          .eq('language_code', lang)
      );
      
      const tagTranslationMap = tagTranslations ? tagTranslations.reduce((acc, trans) => {
        acc[trans.tag_id] = trans;
        return acc;
      }, {}) : {};
      
      // Apply translations
      filteredBlogs = filteredBlogs.map(blog => {
        const blogTranslation = translationMap[blog.id];
        const categoryTranslation = blog.blog_categories && categoryTranslationMap[blog.blog_categories.id];
        
        return {
          ...blog,
          title: blogTranslation?.title || blog.title,
          excerpt: blogTranslation?.excerpt || blog.excerpt,
          content: blogTranslation?.content || blog.content,
          meta_title: blogTranslation?.meta_title || blog.meta_title,
          meta_description: blogTranslation?.meta_description || blog.meta_description,
          meta_keywords: blogTranslation?.meta_keywords || blog.meta_keywords,
          blog_categories: blog.blog_categories ? {
            ...blog.blog_categories,
            name: categoryTranslation?.name || blog.blog_categories.name
          } : null,
          blog_tag_relations: blog.blog_tag_relations.map(rel => ({
            blog_tags: {
              ...rel.blog_tags,
              name: tagTranslationMap[rel.blog_tags.id]?.name || rel.blog_tags.name
            }
          }))
        };
      });
    }
  }
  
  return {
    blogs: filteredBlogs,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit)
  };
}

// Fetch single blog post by slug
export async function fetchBlogBySlug(slug, language = null) {
  const lang = language || getCurrentLanguage();

  // Minimal single request for the base blog (no nested joins, explicit columns)
  const base = await handle(
    supabase
      .from('blogs')
      .select('id,slug,title,excerpt,content,featured_image,og_image,author_name,author_image,category_id,publish_date,reading_time,views_count,meta_title,meta_description,meta_keywords')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
  );

  if (!base) return null;

  // Start with a minimal blog object; avoid extra network calls for category/tags to prevent resource exhaustion
  let blog = {
    ...base,
    blog_categories: null,
    blog_tag_relations: []
  };

  // Apply translations if needed (single extra request)
  if (lang !== 'en') {
    const translation = await handle(
      supabase
        .from('blogs_translations')
        .select('*')
        .eq('blog_id', blog.id)
        .eq('language_code', lang)
        .single()
    );

    if (translation) {
      blog = {
        ...blog,
        title: translation.title || blog.title,
        excerpt: translation.excerpt || blog.excerpt,
        content: translation.content || blog.content,
        meta_title: translation.meta_title || blog.meta_title,
        meta_description: translation.meta_description || blog.meta_description,
        meta_keywords: translation.meta_keywords || blog.meta_keywords
      };
    }
  }

  // Optional: Skip view count increment entirely to eliminate PATCH during page open
  // If you want to re-enable it later without stressing the network, use a per-session guard:
  // const viewedKey = `viewed_blog_${blog.id}`;
  // if (!sessionStorage.getItem(viewedKey)) {
  //   sessionStorage.setItem(viewedKey, '1');
  //   supabase.from('blogs').update({ views_count: (blog.views_count || 0) + 1 }).eq('id', blog.id).then(() => {}).catch(() => {});
  // }

  return blog;
}

// Fetch related blog posts
export async function fetchRelatedBlogPosts(blogId, categoryId, limit = 3, language = null) {
  const lang = language || getCurrentLanguage();
  
  const relatedPosts = await handle(
    supabase
      .from('blogs')
      .select(`
        *,
        blog_categories (
          id,
          slug,
          name,
          color
        )
      `)
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', blogId)
      .order('publish_date', { ascending: false })
      .limit(limit)
  );
  
  if (!relatedPosts || relatedPosts.length === 0) {
    // If no posts in same category, get recent posts
    const recentPosts = await handle(
      supabase
        .from('blogs')
        .select(`
          *,
          blog_categories (
            id,
            slug,
            name,
            color
          )
        `)
        .eq('status', 'published')
        .neq('id', blogId)
        .order('publish_date', { ascending: false })
        .limit(limit)
    );
    
    return applyBlogTranslations(recentPosts || [], lang);
  }
  
  return applyBlogTranslations(relatedPosts, lang);
}

// Helper function to apply blog translations
async function applyBlogTranslations(blogs, language) {
  if (!blogs || blogs.length === 0 || language === 'en') return blogs;
  
  const blogIds = blogs.map(blog => blog.id);
  const translations = await handle(
    supabase
      .from('blogs_translations')
      .select('*')
      .in('blog_id', blogIds)
      .eq('language_code', language)
  );
  
  if (!translations) return blogs;
  
  const translationMap = translations.reduce((acc, trans) => {
    acc[trans.blog_id] = trans;
    return acc;
  }, {});
  
  // Also fetch category translations
  const categoryIds = [...new Set(blogs.map(blog => blog.category_id).filter(id => id))];
  const categoryTranslations = categoryIds.length > 0 ? await handle(
    supabase
      .from('blog_categories_translations')
      .select('*')
      .in('category_id', categoryIds)
      .eq('language_code', language)
  ) : [];
  
  const categoryTranslationMap = categoryTranslations ? categoryTranslations.reduce((acc, trans) => {
    acc[trans.category_id] = trans;
    return acc;
  }, {}) : {};
  
  return blogs.map(blog => {
    const blogTranslation = translationMap[blog.id];
    const categoryTranslation = blog.blog_categories && categoryTranslationMap[blog.blog_categories.id];
    
    return {
      ...blog,
      title: blogTranslation?.title || blog.title,
      excerpt: blogTranslation?.excerpt || blog.excerpt,
      content: blogTranslation?.content || blog.content,
      meta_title: blogTranslation?.meta_title || blog.meta_title,
      meta_description: blogTranslation?.meta_description || blog.meta_description,
      meta_keywords: blogTranslation?.meta_keywords || blog.meta_keywords,
      blog_categories: blog.blog_categories && categoryTranslation ? {
        ...blog.blog_categories,
        name: categoryTranslation.name || blog.blog_categories.name
      } : blog.blog_categories
    };
  });
}