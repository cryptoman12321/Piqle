# 🏓 Piqle - Pickleball Community App

A modern, feature-rich React Native mobile application for the pickleball community. Connect with players, find courts, join games, and improve your skills with AI coaching.

## ✨ Features

### 🎯 Core Functionality
- **Dynamic Rating Chart** - Interactive 2D visualization of your pickleball progress
- **AI Coach** - Intelligent conversation system for technique and strategy advice
- **Court Discovery** - Find and explore pickleball courts in your area
- **Game Management** - Create, join, and manage pickleball games
- **Tournament System** - Comprehensive tournament organization and participation
- **Social Features** - Connect with friends, join clubs, and build your network

### 🎨 User Experience
- **Modern UI/UX** - Clean, intuitive design with smooth animations
- **Theme System** - Light, dark, and system theme support
- **Responsive Design** - Optimized for all device sizes
- **Accessibility** - Built with accessibility best practices

### 📱 Technical Features
- **React Native** - Cross-platform mobile development
- **Expo** - Rapid development and deployment
- **TypeScript** - Type-safe development experience
- **State Management** - Zustand for efficient state handling
- **Navigation** - React Navigation with tab and stack navigation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/piqle.git
   cd piqle/PiqleReactNative
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── RatingChart.tsx # Dynamic rating visualization
│   └── ...
├── screens/            # App screens and views
│   ├── HomeScreen.tsx  # Main dashboard
│   ├── ProfileScreen.tsx # User profile and settings
│   ├── AICoachScreen.tsx # AI coaching interface
│   ├── CalendarScreen.tsx # Event calendar
│   └── ...
├── stores/             # State management (Zustand)
│   ├── themeStore.ts   # Theme and UI state
│   ├── authStore.ts    # Authentication state
│   ├── aiCoachStore.ts # AI coach conversations
│   └── ...
├── navigation/         # Navigation configuration
├── constants/          # App constants and themes
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Theme System

The app features a comprehensive theme system with:
- **Light Theme** - Clean, bright interface
- **Dark Theme** - Easy on the eyes
- **System Theme** - Automatically follows device preference
- **Dynamic Colors** - Consistent color scheme across components

## 📊 Rating Chart

The dynamic rating chart provides:
- **Interactive Timeframes** - 1M, 3M, 6M, 1Y views
- **Data Point Interaction** - Tap for match details
- **Progress Tracking** - Visual representation of improvement
- **Smooth Animations** - Beautiful bezier curve animations

## 🤖 AI Coach

Intelligent coaching system featuring:
- **Conversation Management** - Create and manage coaching sessions
- **Context-Aware Responses** - Tailored advice based on your questions
- **Multiple Categories** - Technique, strategy, fitness, mental game
- **Sample Data** - Pre-loaded conversations for testing

## 🗺️ Map & Courts

Court discovery system (currently placeholder):
- **Court Information** - Ratings, amenities, operating hours
- **Quick Actions** - Find courts, join games, view events
- **Sample Data** - Popular courts with reviews and details

## 🛠️ Development

### Available Scripts
- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS Simulator
- `npm run android` - Run on Android Emulator
- `npm run web` - Run in web browser

### Code Style
- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Component Structure** - Consistent component organization

### State Management
- **Zustand** - Lightweight state management
- **Persistent Storage** - AsyncStorage for theme preferences
- **Type Safety** - Full TypeScript support

## 📱 Platform Support

- **iOS** - Full support with native components
- **Android** - Full support with native components
- **Web** - Basic web support (Expo)

## 🔧 Dependencies

### Core
- React Native
- Expo
- TypeScript

### UI & Navigation
- React Navigation
- Expo Vector Icons
- React Native Safe Area Context

### State & Storage
- Zustand
- AsyncStorage

### Charts & Visualization
- React Native Chart Kit

### Maps (Future)
- React Native Maps (currently disabled)

## 🚧 Known Issues

- **Map Components** - Currently using placeholder screens due to native module linking requirements
- **Native Dependencies** - Some features require additional setup for production builds

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core app structure
- ✅ Theme system
- ✅ Rating chart
- ✅ AI Coach
- ✅ Basic navigation

### Phase 2 (Next)
- 🔄 Real map integration
- 🔄 Push notifications
- 🔄 Offline support
- 🔄 User authentication

### Phase 3 (Future)
- 🔄 Social features
- 🔄 Tournament system
- 🔄 Advanced analytics
- 🔄 Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Community** - For the amazing framework
- **Expo Team** - For the development platform
- **Pickleball Community** - For inspiration and feedback

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/yourusername/piqle/issues)
- **Discussions** - [GitHub Discussions](https://github.com/yourusername/piqle/discussions)
- **Email** - your.email@example.com

---

**Built with ❤️ for the pickleball community**

*Version: 1.0.0 | Last Updated: August 2024*
# Force Vercel update
