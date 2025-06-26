# DynProtMobile - Smart Protein Tracking PWA

A complete Progressive Web App for tracking daily protein intake with AI-powered meal analysis. Built with Next.js, TypeScript, and modern web technologies to provide a native mobile app experience.

![DynProtMobile](public/icon-192x192.png)

## 🚀 Features

### Core Functionality
- **AI-Powered Protein Estimation**: Smart analysis of meal descriptions using mock AI algorithms
- **Photo Meal Analysis**: Capture photos of meals for automatic protein content estimation
- **Manual Entry**: Direct protein input for precise tracking
- **Daily Goal Management**: Set and track custom daily protein targets
- **Progress Visualization**: Beautiful circular progress indicators and charts
- **Historical Data**: Comprehensive tracking with visual progress trends

### User Experience
- **Progressive Web App**: Install on any device for native app experience
- **Mobile-First Design**: Optimized for smartphones with responsive layout
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Real-time Updates**: Instant feedback and progress updates
- **Offline Capability**: Local storage for seamless offline usage

### Technical Features
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS
- **State Management**: Zustand for efficient global state
- **UI Components**: shadcn/ui for consistent, accessible design
- **Charts & Visualization**: Recharts for data visualization
- **Camera Integration**: React Webcam for photo capture
- **Toast Notifications**: Sonner for user feedback

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd dynprotmobile

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Demo Credentials
- **Email**: demo@dynprot.com
- **Password**: demo123

## 🏗️ Project Structure

```
dynprotmobile/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout with PWA meta tags
│   └── page.tsx           # Main application entry point
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── DynProtMobileApp.tsx   # Main app component
│   ├── LoginForm.tsx          # Authentication interface
│   ├── Dashboard.tsx          # Home screen with progress
│   ├── AddMealForm.tsx        # Meal logging interface
│   ├── HistoryView.tsx        # Historical data visualization
│   ├── ProfileView.tsx        # User settings and profile
│   ├── ProteinProgressRing.tsx # Animated progress indicator
│   ├── MealCard.tsx           # Individual meal display
│   └── BottomNavigation.tsx   # Mobile navigation
├── lib/                   # Utilities and configuration
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── icon-*.png       # App icons
└── tailwind.config.ts    # Tailwind CSS configuration
```

## 🎨 Design System

### Color Palette
- **Primary**: #10B981 (Emerald-500) - Health and growth
- **Secondary**: #3B82F6 (Blue-500) - Trust and reliability  
- **Accent**: #F59E0B (Amber-500) - Achievement highlights
- **Background**: #F8FAFC (Slate-50) - Clean, breathable space
- **Text**: #1E293B (Slate-800) - High contrast readability

### Typography
- **Font Family**: Inter - Clean, modern, highly readable
- **Responsive Sizing**: Mobile-first approach with appropriate scales
- **Weight Hierarchy**: Light to bold for visual information hierarchy

### Layout Principles
- **Mobile-First**: Designed for smartphones, enhanced for tablets/desktop
- **Card-Based**: Consistent card patterns for content organization
- **Progressive Disclosure**: Information revealed based on user needs
- **Accessible Navigation**: Clear visual hierarchy and touch targets

## 🔧 Development Guide

### Key Components

#### State Management (`lib/store.ts`)
```typescript
// Global app state with Zustand
interface AppState {
  user: User | null;
  todaysMeals: Meal[];
  dailyProteinGoal: number;
  totalProteinToday: number;
  // ... actions and computed values
}
```

#### Mock AI Integration
```typescript
// Placeholder for future API integration
const estimateProteinFromDescription = async (description: string): Promise<number> => {
  // Current: Keyword matching algorithm
  // Future: Real AI/ML service integration
  // API endpoint structure ready for implementation
};
```

### Adding New Features

1. **New Components**: Create in `/components` with TypeScript interfaces
2. **State Updates**: Extend the Zustand store in `lib/store.ts`
3. **Styling**: Use Tailwind classes with custom theme extensions
4. **Routing**: Add new views to the main app component navigation

### API Integration Points

The app is structured for easy integration with real backend services:

```typescript
// Ready for backend integration
interface APIEndpoints {
  auth: '/api/auth/login' | '/api/auth/register';
  meals: '/api/meals' | '/api/meals/:id';
  estimation: '/api/ai/estimate-protein';
  user: '/api/user/profile' | '/api/user/goals';
}
```

## 🌐 PWA Features

### Installation
- Users can install the app from their browser
- Native-like icon on home screen
- Standalone window without browser UI
- Optimized for mobile devices

### Offline Support
- Local state management with persistence
- Cached resources for offline usage
- Background sync capability (ready for implementation)

### Performance
- Lazy loading for optimal initial load
- Image optimization and compression
- Efficient re-renders with React optimization

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build production version
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
- **Netlify**: Direct Git integration
- **AWS Amplify**: Full-stack deployment
- **Firebase Hosting**: Google Cloud integration

## 🔮 Future Enhancements

### Phase 1: Real AI Integration
- [ ] OpenAI GPT-4 Vision for photo analysis
- [ ] Natural language processing for meal descriptions
- [ ] Nutritional database integration (USDA FoodData Central)

### Phase 2: Advanced Features
- [ ] Barcode scanning for packaged foods
- [ ] Recipe analysis and saving
- [ ] Social features and meal sharing
- [ ] Integration with fitness trackers

### Phase 3: Platform Expansion
- [ ] Native iOS app with React Native
- [ ] Native Android app with React Native
- [ ] Apple Watch companion app
- [ ] Desktop application with Electron

## 📊 Analytics & Monitoring

Ready for integration with:
- **Google Analytics 4**: User behavior tracking
- **Sentry**: Error monitoring and performance
- **LogRocket**: Session replay and debugging
- **Mixpanel**: Advanced user analytics

## 🤝 Contributing

This is a demonstration project showcasing modern web development practices. The codebase is designed for:
- **Scalability**: Modular architecture for easy feature additions
- **Maintainability**: Clear separation of concerns and documentation
- **Performance**: Optimized for mobile devices and slow networks
- **Accessibility**: WCAG 2.1 compliance ready

## 📄 License

This project is a demonstration application built for educational and showcase purposes.

---

**Built with ❤️ using modern web technologies**

*Ready for production deployment and real-world usage*# chat
