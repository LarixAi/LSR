# 🚛 Logistics Solution Resources TMS

A comprehensive Transportation Management System (TMS) built for logistics companies to manage drivers, vehicles, routes, and operations efficiently.

## 🎯 Features

### Driver Management
- **Driver Dashboard**: Real-time overview of assignments and status
- **Time Management**: Clock in/out, break management, WTD compliance
- **Vehicle Checks**: Pre-trip and post-trip vehicle inspections
- **Incident Reports**: Report and track incidents with detailed forms
- **Schedule Management**: View and manage daily schedules

### Mobile Optimization
- **Responsive Design**: Works seamlessly on mobile devices
- **Touch-Friendly Interface**: Optimized for mobile interactions
- **Offline Capability**: Works without internet connection
- **Native App Support**: iOS and Android via Capacitor

### Backend Features
- **Supabase Integration**: Real-time database with Row Level Security
- **Authentication**: Secure user authentication and authorization
- **Edge Functions**: Serverless functions for business logic
- **Real-time Updates**: Live data synchronization

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Mobile**: Capacitor (iOS/Android)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: TanStack Query, React Context
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📱 Mobile Features

- **Cross-Platform**: iOS and Android support
- **Native APIs**: Camera, GPS, Bluetooth LE, Filesystem
- **Push Notifications**: Real-time alerts
- **Background Sync**: Automatic data synchronization
- **Offline Storage**: Local data caching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd logistics-solution-resources-TMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Mobile Development

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Sync with mobile platforms**
   ```bash
   npx cap sync
   ```

3. **Run on iOS Simulator**
   ```bash
   npx cap run ios
   ```

4. **Run on Android Emulator**
   ```bash
   npx cap run android
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── driver/         # Driver-specific components
│   ├── mobile/         # Mobile-optimized components
│   └── incidents/      # Incident management components
├── pages/              # Main application pages
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── integrations/       # Third-party integrations
└── lib/                # Library configurations
```

## 🔧 Configuration

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### Database Schema
The application uses PostgreSQL with the following main tables:
- `profiles`: User profiles and roles
- `organizations`: Company information
- `vehicles`: Vehicle management
- `schedules`: Driver schedules
- `time_entries`: Time tracking
- `incidents`: Incident reports
- `routes`: Route management
- `jobs`: Job assignments

## 🚀 Deployment

### Web Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider

### Mobile Deployment
1. Build: `npm run build`
2. Sync: `npx cap sync`
3. Open in Xcode/Android Studio
4. Build and deploy to App Store/Google Play

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for efficient logistics management**
