# Vercel Deployment Guide

This project is optimized for Vercel deployment using the modern serverless functions architecture.

## Project Structure for Vercel

```
├── api/                    # Vercel serverless functions
│   ├── index.js           # Main API handler
│   ├── schema.js          # Database schema
│   └── package.json       # API dependencies
├── client/                # Frontend React app
├── dist/                  # Frontend build output
└── vercel.json           # Vercel configuration
```

## Quick Deploy to Vercel

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Connect to Vercel:**
   - Push code to GitHub
   - Connect repository to Vercel
   - Set environment variables
   - Deploy automatically

## Key Changes for Vercel Compatibility

### 1. Separated Architecture
- **Frontend**: Static React app built to `dist/`
- **API**: Serverless functions in `api/` directory
- **No monolithic server**: Eliminated single Express server

### 2. Serverless Functions
- Each API endpoint runs as an independent function
- Automatic scaling and cold start optimization
- Built-in CORS and middleware support

### 3. Database Integration
- Serverless-compatible PostgreSQL (Neon)
- Connection pooling for efficiency
- Environment-based configuration

## Environment Variables

Set these in Vercel dashboard:

```
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=production
```

## Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "functions": {
    "api/*.js": {
      "runtime": "@vercel/node@3.0.0",
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "outputDirectory": "dist"
}
```

## Build Process

1. **Frontend Build**: `vite build` creates static files in `dist/`
2. **API Functions**: Vercel automatically bundles `api/` directory
3. **Routing**: All API calls go to `/api/index.js`
4. **Static Files**: Served directly from `dist/`

## Database Migration

Before first deployment:

```bash
npm run db:push
```

## Testing Locally

The development server still works normally:

```bash
npm run dev
```

## Deployment Checklist

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Database is accessible with `DATABASE_URL`
- [ ] Environment variables are set in Vercel
- [ ] API functions are in `api/` directory
- [ ] `vercel.json` is properly configured

## Troubleshooting

### Build Issues
- **Frontend fails**: Check Vite configuration and dependencies
- **Missing files**: Ensure `dist/` directory exists after build

### API Issues  
- **500 errors**: Check Vercel function logs
- **Database connection**: Verify `DATABASE_URL` format
- **CORS errors**: API includes proper CORS headers

### Routing Issues
- **404 on refresh**: SPA routing handled by `dist/404.html`
- **API not found**: Check `/api/` route configuration

## Production URLs

- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

## Performance Optimizations

- **Cold starts**: Minimized by using lightweight dependencies
- **Bundle size**: Separated frontend and API bundles
- **Database**: Connection pooling for serverless environment
- **Caching**: Static assets cached by Vercel CDN