# 🎣 Fishing Report Pro

An intelligent Progressive Web App (PWA) that provides comprehensive fishing reports with real-time data including weather conditions, tides, marine data, and smart fishing insights.

## 🆕 **ENHANCED DASHBOARD** - Professional Marine Weather Platform

**🚀 [View Live Enhanced Demo](https://wizumz.github.io/fishrpt/)** *(Deploying from feature/enhanced-dashboard branch)*

### ✨ **NEW Features Overview:**
- 🎨 **Professional Dark Theme** - Easy on the eyes with high contrast
- 📊 **Comprehensive Dashboard** - 6xl fishing score with 5-tier color coding  
- 🧭 **Interactive Compasses** - Animated wind & swell direction indicators
- 📈 **Advanced Charts** - Multi-line marine weather with 30-day temp history
- 🌊 **Extended Tides** - 12 tide events with time calculations
- 🌙 **Solunar System** - Major/minor feeding times with moon phases
- 🌤️ **Complete Weather** - Pressure, humidity, UV, visibility, cloud cover
- 🎣 **Pro Insights** - Seasonal advice, depth/bait recommendations

*See [ENHANCED-FEATURES.md](./ENHANCED-FEATURES.md) for complete feature breakdown and API integration roadmap.*

---

## 🌐 Live Demo

**GitHub Pages Demo**: [https://wizumz.github.io/fishrpt/](https://wizumz.github.io/fishrpt/)

*Note: The GitHub Pages version uses sophisticated mock data and comprehensive marine algorithms for demonstration purposes. For full functionality with real-time data, deploy to a platform that supports server-side rendering like Vercel or Netlify.*

## ✨ Features

### 📊 Comprehensive Data Sources
- **Weather Data**: Real-time and forecast weather from Open-Meteo API
- **Marine Conditions**: Wave height, direction, water temperature from Open-Meteo Marine API
- **Tidal Information**: High/low tide predictions from NOAA Tides API
- **Solunar Activity**: Best fishing times based on moon phases and positions
- **Smart Insights**: Intelligent fishing recommendations based on all conditions

### 📱 Progressive Web App
- **Install on Mobile**: Works like a native app on iOS and Android
- **Offline Capable**: Core functionality works without internet
- **Responsive Design**: Optimized for all screen sizes
- **Fast Loading**: Cached resources for quick startup

### 📈 Beautiful Visualizations
- **Interactive Charts**: Built with Chart.js for smooth, responsive charts
- **Temperature Forecasts**: 12-hour temperature trend visualization
- **Tide Information**: Next 4 tide predictions with times and heights
- **Condition Scoring**: Visual fishing score with detailed breakdown

### 🎯 Popular Fishing Locations
Pre-configured with popular US fishing spots:
- San Francisco Bay, CA
- Miami Beach, FL
- Outer Banks, NC
- Key West, FL
- Cape Cod, MA
- Monterey Bay, CA

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fishing-report-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key for AI insights (optional):
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## 🚀 Deployment Options

### 🎯 GitHub Pages (Demo)
**Current Live Demo**: [https://wizumz.github.io/fishrpt/](https://wizumz.github.io/fishrpt/)

- ✅ **Static hosting** with mock data for demonstration
- ✅ **Full UI functionality** and interactive features
- ✅ **PWA installation** capabilities
- ❌ **Real-time API data** (static demo data only)
- 💡 **Best for**: Showcasing the app interface and features

### ⚡ Vercel/Netlify (Recommended)
**For full functionality with real-time data**

- ✅ **Server-side rendering** support
- ✅ **Real-time API integration** with all data sources
- ✅ **Environment variables** for API keys
- ✅ **Automatic deployments** from git
- ✅ **Edge functions** for optimal performance
- 💡 **Best for**: Production use with live data

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
OPENAI_API_KEY=your_api_key_here
```

**Deploy to Netlify:**
```bash
# Build the project
npm run build

# Deploy build folder to Netlify
# Or connect your GitHub repo in Netlify dashboard
```

### 🐳 Docker Deployment
```bash
# Build Docker image
docker build -t fishing-report-pwa .

# Run container
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key fishing-report-pwa
```

### 🏠 Self-Hosted
```bash
# Generate static files
npm run generate

# Serve with any static host
npx serve .output/public
```

## 🗃️ API Data Sources

### Free APIs (No Key Required)
- **NOAA Weather API**: `