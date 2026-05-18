# DWAYA - Smart Medication Management System



## 🌟 Overview

**DWAYA** is a premium, AI-powered health management platform designed to simplify medication tracking and provide intelligent health insights. Built with a focus on user experience and medical data integrity, DWAYA empowers users to take control of their health journey.

## 🚀 Features

### 📊 Intelligent Dashboard
A comprehensive overview of your current medication status, health metrics, and upcoming schedules, visualized with sleek, interactive charts.

### 💊 Medication Management
Easily add and manage your prescriptions. DWAYA tracks dosages, timings, and durations to ensure you never miss a dose.

### 🧠 AI-Powered Health Analysis
Leveraging the **Google Gemini API**, DWAYA analyzes your medication history and health trends to provide personalized insights and recommendations.

### 🔒 Secure Authentication
Integrated with **Firebase Authentication**, ensuring your medical data remains private and secure with a seamless login and signup experience.

### 📈 Health History
A detailed chronological log of your medication adherence and health milestones, allowing for better communication with healthcare providers.

### 👤 Medical Profile & Settings
Customize your medical profile with chronic conditions, allergies, and personal health goals.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Realtime Database)
- **AI Engine**: [Google Generative AI (Gemini)](https://ai.google.dev/)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anas-kessou/dwaya.git
   cd dwaya
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Netlify
This project is optimized for deployment on **Netlify**. A `netlify.toml` is included for automatic configuration.

1. Connect your repository to Netlify.
2. Add your `.env` variables in the Netlify Dashboard (**Site settings > Build & deploy > Environment**).
3. Netlify will build using `npm run build` and serve from the `dist/` directory.

---

<p align="center">
  Built with ❤️ for a healthier future.
</p>
