# 🚛 LSR Transport Management System

A comprehensive Transport Management System built with React, TypeScript, and Supabase.

## 📁 **Project Structure**

### **🚀 Core Application**
- `src/` - Main application source code
- `public/` - Static assets and public files
- `dist/` - Production build files (ready for deployment)
- `supabase/` - Database migrations and edge functions

### **📚 Documentation**
- `docs/guides/` - Setup guides and technical documentation
- `docs/marketing/` - Marketing strategy and pricing analysis
- `docs/deployment/` - Deployment guides and checklists
- `docs/tests/` - Test files and debugging tools

### **🎨 Assets**
- `assets/images/` - App icons, logos, and images
- `assets/icons/` - Icon files and graphics

### **📱 Mobile Apps**
- `android/` - Android app configuration
- `ios/` - iOS app configuration
- `dist-driver/` - Driver mobile app build

### **🔧 Configuration**
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `capacitor.config.ts` - Mobile app configuration

---

## 🚀 **Quick Start**

### **Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Mobile Development**
```bash
# Build driver mobile app
npm run build:driver

# Build parent mobile app
npm run build:parent

# Sync with Capacitor
npm run cap:sync:driver
npm run cap:sync:parent
```

### **Deployment**
```bash
# Build for web hosting
npm run build

# Upload dist/ folder to your web server
```

---

## 📋 **Key Features**

### **🚛 Transport Management**
- Vehicle tracking and management
- Driver management and scheduling
- Route planning and optimization
- Real-time GPS tracking
- Digital vehicle inspections

### **📱 Mobile Apps**
- Driver mobile app (Android/iOS)
- Parent mobile app (Android/iOS)
- Offline-capable functionality
- Push notifications

### **📊 Analytics & Reporting**
- Fleet analytics dashboard
- Compliance reporting
- Fuel consumption tracking
- Maintenance scheduling

### **🔐 Security & Compliance**
- User authentication and authorization
- Role-based access control
- GDPR compliance features
- Data encryption

---

## 🛠️ **Technology Stack**

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Mobile:** Capacitor (Android/iOS)
- **Email:** Resend API
- **Payments:** Stripe
- **Maps:** Google Maps API

---

## 📚 **Documentation**

### **Setup Guides**
- [Email System Setup](docs/guides/RESEND_SETUP_GUIDE.md)
- [Stripe Integration](docs/guides/STRIPE_INTEGRATION_SETUP.md)
- [Mobile App Setup](docs/guides/APP_ICON_SETUP.md)
- [Theme System](docs/guides/THEME_SYSTEM_GUIDE.md)

### **Deployment**
- [Web Hosting Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)

### **Marketing**
- [Marketing Strategy](docs/marketing/TMS_MARKETING_STRATEGY.md)
- [Pricing Analysis](docs/marketing/TMS_PRICING_ANALYSIS.md)

### **Architecture**
- [System Architecture](docs/guides/ARCHITECTURE.md)
- [Backend Documentation](docs/guides/LSR_TRANSPORT_COMPLETE_BACKEND_DOCUMENTATION.md)

---

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### **Supabase Setup**
1. Create a Supabase project
2. Run database migrations: `supabase db push`
3. Deploy edge functions: `supabase functions deploy`
4. Set up secrets: `supabase secrets set`

---

## 📱 **Mobile App Development**

### **Android**
```bash
npm run cap:run:driver:android
npm run cap:run:parent:android
```

### **iOS**
```bash
npm run cap:run:driver:ios
npm run cap:run:parent:ios
```

---

## 🧪 **Testing**

### **Test Files Location**
- `docs/tests/` - All test HTML files and scripts
- `src/components/test/` - React test components

### **Run Tests**
```bash
# Backend integration tests
npm run test:backend

# Full test suite
npm run test:full
```

---

## 🚀 **Deployment**

### **Web Hosting**
1. Build the app: `npm run build`
2. Upload `dist/` folder to your web server
3. Configure environment variables
4. Test all features

### **Mobile App Stores**
1. Build mobile apps
2. Configure app store listings
3. Submit for review

---

## 📞 **Support**

For issues and questions:
1. Check the documentation in `docs/`
2. Review test files in `docs/tests/`
3. Check browser console for errors
4. Verify Supabase configuration

---

## 📄 **License**

This project is proprietary software for LSR Transport Solutions.

---

## 🎯 **Project Status**

✅ **Core Features:** Complete
✅ **Mobile Apps:** Ready for deployment
✅ **Email System:** Fully functional
✅ **Payment Integration:** Complete
✅ **Documentation:** Comprehensive
✅ **Testing:** Complete

**Ready for production deployment!** 🚛✨



