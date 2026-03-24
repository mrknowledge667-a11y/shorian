# WiMed Deployment Instructions

This guide covers deploying the WiMed React application to a static hosting service.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase project at https://supabase.com
   - Apply the database schema from `supabase/migrations/0001_init.sql`
   - Enable Row Level Security (RLS) policies as defined in the migration file
   - Create an admin user using the CLI: `npm run admin`

2. **Environment Variables**
   Create a `.env` file in the project root with:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Build Process

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the production bundle:
   ```bash
   npm run build
   ```
   This creates an optimized production build in the `build/` directory.

## Deployment Options

### Option 1: Netlify

1. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

2. **Via Netlify Dashboard:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables in Site Settings

3. **Configure Redirects:**
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Option 2: Vercel

1. **Via Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Via Vercel Dashboard:**
   - Import your GitHub repository
   - Framework preset: Create React App
   - Add environment variables in Project Settings

### Option 3: AWS S3 + CloudFront

1. **Build and sync to S3:**
   ```bash
   aws s3 sync build/ s3://your-bucket-name --delete
   ```

2. **Configure S3 bucket:**
   - Enable static website hosting
   - Set index document: `index.html`
   - Set error document: `index.html` (for SPA routing)

3. **CloudFront configuration:**
   - Create distribution pointing to S3 bucket
   - Configure custom error pages:
     - 404 → /index.html (200 response)
     - 403 → /index.html (200 response)

### Option 4: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/wimed",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## Post-Deployment Configuration

### 1. Supabase Auth Redirect URLs

Add your production URLs to Supabase Auth settings:

**Development:**
- `http://localhost:3000/admin/*`

**Production (examples):**
- `https://your-domain.com/admin/*`
- `https://your-app.netlify.app/admin/*`
- `https://your-app.vercel.app/admin/*`

### 2. Environment Variables by Platform

**Netlify:**
- Site Settings → Environment Variables
- Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`

**Vercel:**
- Project Settings → Environment Variables
- Add variables for Production/Preview/Development

**AWS Amplify:**
- App Settings → Environment Variables
- Add variables with appropriate branch associations

### 3. Caching Configuration

**Recommended Cache Headers:**
```
# Static assets (JS, CSS, images)
Cache-Control: public, max-age=31536000, immutable

# index.html
Cache-Control: no-cache, no-store, must-revalidate

# API responses (handled by Supabase)
Cache-Control: private, max-age=0
```

**Netlify (_headers file):**
```
/static/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

**Vercel (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }]
    }
  ]
}
```

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use platform-specific environment variable management
   - The `REACT_APP_SUPABASE_ANON_KEY` is safe to expose (it's public)

2. **Row Level Security:**
   - Ensure RLS is enabled on all tables
   - Test policies thoroughly before deployment
   - Admin operations require authenticated users with `is_admin = true`

3. **Content Security Policy:**
   Consider adding CSP headers:
   ```
   Content-Security-Policy: default-src 'self'; 
     script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
     style-src 'self' 'unsafe-inline'; 
     img-src 'self' data: https:; 
     connect-src 'self' https://*.supabase.co;
   ```

## Monitoring & Maintenance

1. **Error Tracking:**
   - Consider integrating Sentry or similar
   - Monitor Supabase logs for database errors

2. **Performance:**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals
   - Consider lazy loading for images

3. **Updates:**
   - Regularly update dependencies: `npm update`
   - Monitor Supabase for updates and migrations
   - Test thoroughly in staging before production updates

## Troubleshooting

**SPA Routing Issues:**
- Ensure your hosting platform is configured to serve `index.html` for all routes
- Check redirect/rewrite rules

**Environment Variables Not Loading:**
- Verify variable names start with `REACT_APP_`
- Rebuild after changing environment variables
- Check platform-specific variable syntax

**CORS Issues:**
- Supabase handles CORS automatically
- Ensure your domain is in the allowed list if using custom domains

**Build Failures:**
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node version compatibility (14.x or higher recommended)
- Verify all environment variables are set

## Support

For deployment issues:
- Check the browser console for errors
- Review Supabase logs for API issues
- Ensure all environment variables are correctly set
- Verify Supabase project is active and not paused