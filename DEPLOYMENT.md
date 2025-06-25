# Deployment Guide

## Backend (Render)

1. **Prerequisites**
   - GitHub account
   - Render account (https://render.com/)
   - MongoDB Atlas account (or another MongoDB provider)

2. **Environment Setup**
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Configure the following environment variables in the Render dashboard:
     - `NODE_ENV`: production
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT token signing
     - `JWT_EXPIRES_IN`: 90d (or your preferred expiration)
     - `PORT`: 10000
     - `ALLOWED_ORIGINS`: Your frontend URLs (comma-separated)

3. **Build & Deploy**
   - Render will automatically detect the Node.js app and run `npm install` and `npm start`
   - The app will be available at the provided Render URL

## Frontend (Netlify)

1. **Prerequisites**
   - Netlify account (https://www.netlify.com/)
   - Node.js and npm installed locally

2. **Environment Setup**
   - Update your frontend API endpoints to point to your Render backend URL
   - Create a `.env` file in your frontend root with:
     ```
     VITE_API_URL=https://your-render-app.onrender.com
     ```
   - Build your frontend: `npm run build`

3. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set the build command: `npm run build`
   - Set the publish directory: `dist` (or your build output directory)
   - Add environment variables in Netlify's site settings
   - Deploy the site

## Environment Variables

### Backend
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_EXPIRES_IN`: JWT token expiration (e.g., '90d')
- `PORT`: Server port (default: 10000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Frontend
- `VITE_API_URL`: Your Render backend URL

## Troubleshooting

### Backend
- Check Render logs for errors
- Ensure MongoDB is accessible from Render's IPs
- Verify all environment variables are set correctly

### Frontend
- Check browser console for CORS errors
- Verify the API URL is correct in your frontend configuration
- Clear browser cache if you don't see updates
