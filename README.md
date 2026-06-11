# Dwaya - Smart Medication Management App

Dwaya is a professional, high-performance **React Native** mobile application designed to help users manage their medications, track inventory, and never miss a dose.

## 🚀 Key Features

- **Native Alarm Engine**: Powered by `notifee` for reliable background reminders and lock-screen "Quick Take" actions.
- **Real-time Sync & Offline Cache**: Built with Firebase Firestore including `persistentLocalCache` for seamless use even in hospital basements or planes.
- **Inventory Tracking**: Automatic deduction of medication counts when taken, with smart "Low Stock" alerts and refill reminders.
- **Multiple Doses Port**: Support for multiple scheduled times per medication.
- **Modern UI/UX**: Styled with Tailwind CSS (`twrnc`), featuring native haptic feedback and toast notifications.
- **Secure Authentication**: Robust login and registration flow with Firebase Auth.

## 🛠 Tech Stack

- **Framework**: React Native (v0.86.0)
- **Styling**: Tailwind CSS (via `twrnc`)
- **Database**: Firebase Firestore (w/ Persistence)
- **Auth**: Firebase Authentication
- **Notifications**: Notifee (Native Alarms)
- **Icons**: Lucide React Native
- **Feedback**: React Native Haptic Feedback & Toast Message

## 📦 Getting Started

### Prerequisites

- Node.js >= 22.11.0
- React Native Environment (Android Studio / Xcode)
- A `.env` file with your Firebase configuration (see Configuration section)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/anas-kessou/dwaya.git
   cd dwaya
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Setup environment variables:
   Create a `.env` file in the root directory:
   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

### Running the App

#### Android
```sh
npm run android
```

#### iOS
```sh
cd ios && pod install && cd ..
npm run ios
```

## 🔐 Security & Privacy

This project uses `react-native-dotenv` to manage sensitive API keys. Ensure your `.env` file is never committed to version control (it is excluded in `.gitignore`).

---
Built with ❤️ by Anas Kessou
