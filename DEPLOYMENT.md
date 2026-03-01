# SmartStudyAI - GitHub & Render Deployment Guide

## Step 1: Install Git

First, ensure Git is installed on your system:
- Download from: https://git-scm.com/download/win
- Run the installer and complete the setup
- Restart VS Code or terminal after installation

## Step 2: Initialize Git Repository Locally

Run these commands in the terminal:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
cd "c:\Users\Suman\OneDrive\Desktop\SmartStudyAI - Copy"
git init
git add .
git commit -m "Initial commit: SmartStudyAI application"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `SmartStudyAI`
3. Do NOT initialize with README, .gitignore, or license (we already have them)
4. Click "Create repository"
5. Copy the repository URL (HTTPS or SSH)

## Step 4: Push Code to GitHub

Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/SmartStudyAI.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username and use the URL from your repository.

## Step 5: Deploy on Render

### 5.1: Create Render Account
1. Go to https://render.com
2. Sign up (you can use GitHub for easier login)
3. Verify your email

### 5.2: Create Web Service
1. On Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Select the "SmartStudyAI" repository
5. Fill in the settings:
   - **Name**: smartstudyai
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free

### 5.3: Add Environment Variables (if needed)
If your app requires any API keys or settings, add them in the Render dashboard under "Environment" tab. Common variables:
- `FLASK_ENV=production`
- `DEBUG=False`
- Any API keys (OpenAI, etc.)

### 5.4: Deploy
Click "Create Web Service" and Render will automatically start building and deploying your app.

## Step 6: Monitor and Troubleshoot

- View live logs in Render dashboard
- Check deployment status
- Your app will be available at: `https://smartstudyai.onrender.com` (or similar)

## Important Notes

- **Free tier on Render**: Service goes to sleep after 15 minutes of inactivity
- **Updates**: Push changes to GitHub and Render will auto-deploy
- **Database**: SQLite database won't persist across redeployments. For production, use PostgreSQL (Render offers free plan)
- **File uploads**: Uploads stored locally won't persist. Use cloud storage (AWS S3, etc.) for production

## Future Improvements

1. **Use PostgreSQL** instead of SQLite:
   ```bash
   pip install psycopg2-binary
   ```

2. **Use cloud storage** for uploads/outputs (AWS S3, Azure Blob, etc.)

3. **Environment variables** in `.env` file for sensitive data:
   ```
   OPENAI_API_KEY=your_key_here
   DEBUG=False
   ```

4. **CORS configuration** if connecting from different domains

## Quick Reference Commands

```bash
# Check git status
git status

# View commit history
git log

# Make changes and push to GitHub
git add .
git commit -m "Your message"
git push
```

---
For questions and support, refer to:
- [Git Documentation](https://git-scm.com/doc)
- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)
