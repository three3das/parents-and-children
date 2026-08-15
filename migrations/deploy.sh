#!/bin/bash

# KidRead Heroku Deployment Script

echo "🚀 Starting deployment process..."

# 1. Run type checking
echo "📝 Running TypeScript type checking..."
npm run check
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix errors before deploying."
    exit 1
fi

# 2. Test local build
echo "🔨 Testing local build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# 3. Check git status
echo "📋 Checking git status..."
if [[ $(git status --porcelain) ]]; then
    echo "📦 Uncommitted changes found. Committing..."
    git add .
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update for deployment"
    fi
    git commit -m "$commit_msg"
else
    echo "✅ No uncommitted changes"
fi

# 4. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -ne 0 ]; then
    echo "⚠️ Failed to push to GitHub. Continuing with Heroku deployment..."
fi

# 5. Push to Heroku
echo "☁️ Deploying to Heroku..."
git push heroku main
if [ $? -ne 0 ]; then
    echo "❌ Heroku deployment failed."
    exit 1
fi

echo "✅ Deployment successful!"
echo "🌐 Your app should be live soon at your Heroku URL"
echo "📊 Run 'heroku logs --tail' to monitor the deployment"