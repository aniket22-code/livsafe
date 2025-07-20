# 🚀 Medical Assistant - Deployment Guide

This guide will help you deploy the Medical Assistant application to production using modern cloud services.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Basic knowledge of environment variables

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Authentication**: JWT tokens

## 🌐 Deployment Stack (Free Tier)

- **Database**: MongoDB Atlas (Free 512MB)
- **Backend**: Railway (Free $5/month usage)
- **Frontend**: Vercel (Free for personal projects)

## 🚀 Quick Deploy

### Option 1: One-Click Deploy

[![Deploy Backend on Railway](https://railway.app/button.svg)](https://railway.app/template/ZqXGW0?referralCode=alphasec)

[![Deploy Frontend on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/medical-assistant&project-name=medical-assistant&repository-name=medical-assistant)

### Option 2: Manual Deployment

## 📦 Step 1: Prepare the Project

1. **Clone and setup the repository:**
   ```bash
   git clone https://github.com/yourusername/medical-assistant.git
   cd medical-assistant
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Build the project:**
   ```bash
   # Run the deployment script
   ./deploy.ps1
   ```

## 🗄️ Step 2: Setup Database (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
6. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medical_assistant
   ```

## 🖥️ Step 3: Deploy Backend (Railway)

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder as the root directory
6. Set environment variables in Railway:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medical_assistant
   JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long
   NODE_ENV=production
   PORT=5000
   ```
7. Railway will automatically deploy your backend

**Your backend URL will be**: `https://your-app-name.up.railway.app`

## 🌐 Step 4: Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set the root directory to `/` (project root)
6. Set environment variables:
   ```env
   VITE_API_BASE_URL=https://your-railway-app-name.up.railway.app/api
   ```
7. Deploy!

**Your frontend URL will be**: `https://your-app-name.vercel.app`

## 🔧 Step 5: Update CORS Settings

After getting your frontend URL, update the backend environment variables on Railway:

```env
CLIENT_URL=https://your-app-name.vercel.app
```

## 🌱 Step 6: Seed Database (Optional)

If you want to add sample data:

1. In Railway, go to your project settings
2. Add a new environment variable:
   ```env
   SEED_DATA=true
   ```
3. Redeploy the service

Or connect to your deployed backend and run:
```bash
curl -X POST https://your-railway-app-name.up.railway.app/api/seed
```

## 🔐 Step 7: Test the Deployment

1. Visit your frontend URL
2. Try to sign up or log in with test credentials:
   - Email: `sarah.johnson@citygeneral.com`
   - Password: `doctor123`

## 📱 Environment Variables Reference

### Backend (.env)
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medical_assistant

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters_long

# Server
PORT=5000
NODE_ENV=production

# CORS
CLIENT_URL=https://your-frontend-app.vercel.app
```

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-app.up.railway.app/api
```

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Error**: Make sure CLIENT_URL is set correctly in backend
2. **Database Connection**: Check MongoDB Atlas IP whitelist and credentials
3. **API Not Found**: Verify VITE_API_BASE_URL includes `/api` at the end
4. **Build Fails**: Ensure all dependencies are installed and TypeScript compiles

### Checking Logs:

- **Railway**: Go to your project > Deployments > Click on latest deployment > View logs
- **Vercel**: Go to your project > Functions tab > View function logs
- **MongoDB**: Check Atlas monitoring dashboard

## 🌟 Production Optimizations

### Security:
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Set up proper CORS origins
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use HTTPS everywhere

### Performance:
- [ ] Enable Vercel edge functions
- [ ] Set up Railway autoscaling
- [ ] Implement MongoDB indexes
- [ ] Add image optimization

### Monitoring:
- [ ] Set up Railway metrics
- [ ] Monitor MongoDB Atlas performance
- [ ] Set up error tracking (Sentry)

## 🆘 Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Test API endpoints directly using tools like Postman
4. Check service logs in Railway/Vercel dashboards

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

**🎉 Congratulations! Your Medical Assistant application is now deployed and ready for use!**
