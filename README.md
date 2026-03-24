# Shorian Med - شوريان ميد

منصة تجارة إلكترونية للمعدات الطبية مبنية على React مع دعم كامل للغة العربية.

A modern React-based e-commerce platform for medical equipment with full Arabic RTL support.

## Features

- **Arabic RTL Support**: Full right-to-left layout support for Arabic
- **Product Catalog**: Browse medical equipment across multiple categories
- **Dynamic Content**: All content managed through Supabase database
- **Admin Dashboard**: Full CRUD operations for all content types
- **Responsive Design**: Mobile-first approach with Material-UI
- **Real-time Updates**: Changes in admin panel reflect immediately on the public site
- **Secure Authentication**: Supabase Auth with Row Level Security

## Tech Stack

- **Frontend**: React 19, Material-UI 7
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Routing**: React Router v7
- **Styling**: Material-UI with custom theming
- **Fonts**: Cairo, Tajawal (Arabic fonts)
- **Deployment**: Static site compatible (Netlify, Vercel, etc.)

## Project Structure

```
shorian-med/
├── public/              # Static assets
├── src/
│   ├── admin/          # Admin panel components
│   │   ├── pages/      # Admin CRUD pages
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   └── ProtectedRoute.js
│   ├── api/            # API integration
│   │   ├── content.js  # Content fetching functions
│   │   └── supabaseClient.js
│   ├── components/     # Reusable components
│   ├── pages/          # Public pages
│   └── App.js          # Main app component
├── scripts/            # Utility scripts
│   └── admin-create-user.js
├── supabase/           # Database schema
│   └── migrations/
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/shorian-med.git
   cd shorian-med
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL from `supabase/shorian-med-schema.sql` in SQL Editor
   - Copy your project URL and anon key

4. Configure environment variables:
   Create a `.env` file with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Create an admin user:
   
   **Option 1: Using the CLI tool (requires service role key)**
   ```bash
   # Get your service role key from Supabase dashboard > Settings > API
   SUPABASE_SERVICE_ROLE="your-service-role-key" npm run admin
   ```
   
   **Option 2: Manual creation in Supabase dashboard**
   - Go to Authentication > Users
   - Click "Add user" > "Create new user"
   - Enter email and password
   - After creation, go to Table Editor > profiles
   - Find the user and set `is_admin = true`

6. Start the development server:
   ```bash
   npm start
   ```

## Admin Panel

Access the admin panel at `/admin/login`. Use the credentials created with `npm run admin`.

### Admin Features

- **Landing Settings**: Hero section, map embed URL, contact info
- **Brands**: Manage trusted brand logos
- **Categories**: Product categories with images
- **Products**: Full product catalog management
- **Services**: Service offerings with features
- **About**: Mission, vision, story, and team
- **Contact**: Contact information blocks
- **Collapsible**: Accordion sections for landing page

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with admin flag
- `site_settings`: Global site configuration
- `brands`: Trusted brand information
- `categories`: Product categories
- `products`: Product catalog
- `services`: Service offerings
- `about_sections`: About page content
- `team_members`: Team member profiles
- `contact_blocks`: Contact information
- `collapsible_sections`: Accordion content

All tables include RLS policies for security.

## Development

### Available Scripts

- `npm start`: Run development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run admin`: Create admin user CLI

### Code Style

- ES6+ JavaScript
- React Hooks
- Material-UI components
- Async/await for API calls

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform:
   - **Netlify**: `netlify deploy --prod --dir=build`
   - **Vercel**: `vercel --prod`
   - **GitHub Pages**: `npm run deploy`

3. Configure environment variables on your hosting platform

4. Add production URL to Supabase Auth settings

## Image Handling

The application uses external image URLs. When adding content:

- Use direct URLs to images (https://...)
- Ensure images are optimized for web
- Consider using CDN-hosted images
- Recommended formats: WebP, JPEG for photos, PNG for logos

## Performance Optimization

- Lazy loading for images
- Code splitting by route
- Material-UI tree shaking
- Efficient Supabase queries with proper indexing

## Security

- Row Level Security (RLS) on all tables
- Admin operations require authentication
- Environment variables for sensitive data
- HTTPS required for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
- Check the browser console for errors
- Review Supabase logs
- Ensure environment variables are set correctly
- Verify Supabase project is active

## Acknowledgments

- Material-UI for the component library
- Supabase for the backend infrastructure
- React team for the framework