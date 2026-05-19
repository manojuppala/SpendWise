# SpendWise 💰

A modern, feature-rich expense tracking mobile app built with React Native and Expo.

## 🌟 Features

- ✅ **Multi-Wallet Support** - Manage multiple wallets (personal, business, savings, etc.)
- ✅ **Guest Mode** - Use the app offline without creating an account
- ✅ **Smart Categories** - Track expenses across different categories
- ✅ **Statistics & Insights** - Weekly, monthly, and yearly spending analytics
- ✅ **Image Attachments** - Add photos to wallets and transactions
- ✅ **Currency Customization** - Choose from 12 different currency symbols
- ✅ **Dark Mode UI** - Beautiful dark-themed interface
- ✅ **Cloud Sync** - Sync data across devices with Supabase
- ✅ **Data Migration** - Seamless transition from guest mode to authenticated account

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally
- A Supabase account (for cloud features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd spend-wise
   ```

2. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up Supabase** (Required for authentication & cloud sync)
   - Follow the detailed guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
   - Update `config/supabase.ts` with your credentials

4. **Start the app**

   ```bash
   npm start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Or press `a` for Android emulator / `i` for iOS simulator

## 📱 Guest Mode

SpendWise supports full offline usage through Guest Mode:

- All data stored locally on your device
- No internet required
- Automatic data migration when you create an account

See [`GUEST_MODE.md`](./GUEST_MODE.md) for details.

## 📚 Documentation

- **[README_FIRST.md](./README_FIRST.md)** - Important setup information
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup guide
- **[GUEST_MODE.md](./GUEST_MODE.md)** - Guest mode implementation details
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Firebase to Supabase migration notes

## 🛠️ Tech Stack

- **Frontend**: React Native 0.81.5, Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Storage**: AsyncStorage (local), Supabase (cloud)
- **Image Upload**: Cloudinary (optional)
- **Charts**: react-native-gifted-charts
- **UI**: Custom components with Phosphor icons

## 📦 Project Structure

```
spend-wise/
├── app/               # File-based routing (screens)
│   ├── (auth)/       # Authentication screens
│   ├── (modals)/     # Modal screens
│   └── (tabs)/       # Main tab screens
├── components/        # Reusable components
├── services/          # API & storage services
├── hooks/            # Custom React hooks
├── contexts/         # React contexts (auth, etc.)
├── constants/        # App constants & theme
├── types/            # TypeScript types
└── config/           # Configuration files
```

## 🎨 Features in Detail

### Multi-Wallet Management

Create unlimited wallets with custom names and images. Track income and expenses separately for each wallet.

### Smart Analytics

- Weekly spending trends
- Monthly expense breakdown
- Yearly financial overview
- Category-wise statistics

### Privacy & Security

- Local-first data storage
- Optional cloud sync
- Comprehensive privacy policy
- Secure authentication with Supabase

## 📄 License

This project is private.

## 🤝 Contributing

This is a personal project. For major changes, please open an issue first to discuss what you would like to change.
