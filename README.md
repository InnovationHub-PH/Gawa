# Gawa - Makers Club Platform

A modern web platform for makers, engineers, and innovators to connect, share projects, and collaborate.

## Features

- **Community Directory**: Browse and connect with makers, companies, and educational institutions
- **Job Board**: Find and post opportunities in the maker/engineering space
- **Blog Platform**: Share knowledge and project updates
- **Fabrication Resources**: Discover available machines and materials
- **User Profiles**: Showcase your work and connect with others
- **Interactive Maps**: Visualize community members and resources geographically

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Netlify
- **Maps**: Leaflet.js
- **PDF Viewing**: PDF.js
- **Build Tool**: Vite

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations in the `supabase/migrations/` folder
3. Set up the storage bucket for profile pictures by running the `create_storage_bucket.sql` migration
4. Configure authentication settings in your Supabase dashboard

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 4. Deployment

The project is configured for Netlify deployment:

```bash
# Deploy to Netlify
npm run netlify:deploy

# Deploy to production
npm run netlify:deploy:prod
```

## Project Structure

```
├── js/                 # JavaScript modules
│   ├── auth.js        # Authentication logic
│   ├── supabase.js    # Supabase client and database functions
│   ├── profile.js     # User profile functionality
│   ├── search.js      # Search and filtering
│   └── ...
├── supabase/
│   └── migrations/    # Database schema migrations
├── netlify/
│   ├── functions/     # Serverless functions
│   └── edge-functions/ # Edge functions
├── *.html             # Page templates
├── style.css          # Global styles
└── netlify.toml       # Netlify configuration
```

## Key Features

### Profile Picture Upload

Users can upload profile pictures which are stored in Supabase Storage with automatic fallback to base64 encoding if storage is unavailable.

### Authentication

- Email/password authentication via Supabase Auth
- Automatic profile creation on signup
- Protected routes and user-specific content

### Database Schema

- **profiles**: User profile information
- **posts**: Blog posts and updates
- **follows**: User following relationships
- **user_ratings**: User rating and review system

### Responsive Design

The platform is fully responsive with mobile-first design principles and includes:
- Collapsible navigation
- Mobile-optimized filters
- Touch-friendly interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.