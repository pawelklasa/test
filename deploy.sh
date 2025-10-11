#!/bin/bash

# Firebase Deployment Script for G.A.P Dashboard

echo "🚀 Starting deployment process..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "Checking Firebase authentication..."
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Build the app
echo ""
echo "📦 Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo "🌐 Your app is live at: https://test-login-5b7a2.web.app"
        echo ""
    else
        echo ""
        echo "❌ Deployment failed!"
    fi
else
    echo ""
    echo "❌ Build failed! Please fix the errors and try again."
fi
