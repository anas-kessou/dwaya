# Netlify Deployment Guide

I have prepared the project for Netlify deployment. This includes creating a `netlify.toml` file to handle the build process and SPA routing.

## 1. Project Configuration
I have created a `netlify.toml` in the project root with the following settings:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Redirects**: Configured to point all routes to `index.html` (essential for React Router).

## 2. Environment Variables
You MUST set the following environment variables in the Netlify Dashboard (**Site settings > Build & deploy > Environment**) for the app to function correctly. 

> [!IMPORTANT]
> These values must match your `.env` file for the application to interact with Firebase and Gemini.

| Variable Name | Value |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyC3OFd4cc9hDVS4XzSaOGbaLXXyRUL4iDk` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dwaya-539cd.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | `https://dwaya-539cd-default-rtdb.firebaseio.com` |
| `VITE_FIREBASE_PROJECT_ID` | `dwaya-539cd` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dwaya-539cd.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `13985494600` |
| `VITE_FIREBASE_APP_ID` | `1:13985494600:web:b294fea65ebedfcc228a7d` |
| `GEMINI_API_KEY` | *(Set your Gemini API Key here)* |

## 3. How to Deploy

### Option A: Connected Repository (Recommended)
1. Push the changes (including the new `netlify.toml`) to your GitHub repository: `https://github.com/anas-kessou/dwaya.git`.
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **"Add new site"** > **"Import an existing project"**.
4. Select **GitHub** and authorize access to the `dwaya` repository.
5. Netlify will automatically detect the settings from `netlify.toml`.
6. Add the **Environment Variables** listed above.
7. Click **"Deploy site"**.

### Option B: Manual CLI Deployment
If you have the Netlify CLI installed and are logged in, you can run:
```bash
npx netlify deploy --prod
```
> [!NOTE]
> This method will prompt you to link the project and set up the site if you haven't already.
