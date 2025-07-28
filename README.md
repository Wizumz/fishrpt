# 🎣 Fishing Report Pro

An intelligent Progressive Web App (PWA) that provides comprehensive fishing reports with real-time data including weather conditions, tides, marine data, and smart fishing insights.

## 🌐 Live Demo

**GitHub Pages Demo**: [https://wizumz.github.io/fishrpt/](https://wizumz.github.io/fishrpt/)

*Note: The GitHub Pages version uses static data and mock APIs for demonstration purposes. For full functionality with real-time data, deploy to a platform that supports server-side rendering like Vercel or Netlify.*

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
- **NOAA Weather API**: `https://api.weather.gov` - Weather forecasts and current conditions
- **NOAA Tides API**: `https://api.tidesandcurrents.noaa.gov` - Tide predictions and observations
- **Open-Meteo Weather**: `https://api.open-meteo.com` - Global weather forecasts
- **Open-Meteo Marine**: `https://marine-api.open-meteo.com` - Marine weather and wave data
- **Solunar API**: `https://api.solunar.org` - Solunar fishing times

### Optional APIs
- **OpenAI API**: Enhanced AI insights (requires API key)

## 📱 PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or "Install App" prompt
3. Follow the installation prompts
4. App will appear on your home screen like a native app

### On Desktop
1. Look for the install icon in your browser's address bar
2. Click to install the PWA
3. App will be available in your applications folder

## 🎨 Technology Stack

- **Framework**: Nuxt 3 (Vue.js)
- **UI Library**: Nuxt UI (TailwindCSS)
- **Charts**: Chart.js with vue-chartjs
- **PWA**: @vite-pwa/nuxt
- **AI**: OpenAI API (optional)
- **Icons**: Heroicons
- **Styling**: TailwindCSS

## 📂 Project Structure

```
fishing-report-pwa/
├── assets/
│   └── css/
│       └── main.css           # Global styles
├── components/
│   ├── TideChart.vue          # Tide visualization
│   ├── SolunarChart.vue       # Solunar times and moon phase
│   └── WeatherChart.vue       # Weather forecast charts
├── pages/
│   └── index.vue              # Main application page
├── server/
│   └── api/
│       ├── geocode.post.ts    # Location search endpoint
│       └── fishing-report.post.ts # Main data aggregation
├── public/
│   ├── icon-192x192.png       # PWA icon (small)
│   ├── icon-512x512.png       # PWA icon (large)
│   └── favicon.ico            # Browser favicon
├── nuxt.config.ts             # Nuxt configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🔧 Configuration

### PWA Settings
The PWA is configured in `nuxt.config.ts`:
- **Offline Support**: Service worker caches essential files
- **Install Prompts**: Custom install experience
- **Theme Colors**: Ocean blue theme
- **Icons**: Multiple sizes for different devices

### API Endpoints
- **Geocoding**: `/api/geocode` - Convert location names to coordinates
- **Fishing Report**: `/api/fishing-report` - Aggregate all fishing data

## 🎣 How It Works

1. **Location Search**: User enters a location (city, zip code, fishing spot)
2. **Geocoding**: Location is converted to GPS coordinates
3. **Data Aggregation**: Multiple APIs are called in parallel:
   - Weather and marine conditions
   - Tide predictions
   - Solunar calculations
4. **Processing**: Data is processed and scored for fishing conditions
5. **AI Enhancement**: Optional AI analysis provides detailed insights
6. **Visualization**: Charts and cards display the comprehensive report

## 📊 Fishing Score Algorithm

The app calculates a fishing score (0-100) based on:
- **Wind Conditions** (20 points): Optimal 5-15 mph
- **Wave Height** (15 points): Optimal 1-3 feet
- **Moon Phase** (15 points): New/full moon periods
- **Water Temperature** (10 points): Species-dependent optimal ranges
- **Base Score** (40 points): Starting baseline

## 🌙 Solunar Theory

The app implements solunar theory calculations:
- **Major Times**: 2-hour periods of peak fish activity
- **Minor Times**: 1-hour periods of good fish activity
- **Moon Phase**: Current phase and illumination percentage
- **Best Times**: Dawn/dusk correlation with solunar periods

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **NOAA**: For providing free weather and tide data
- **Open-Meteo**: For comprehensive weather API access
- **Solunar.org**: For solunar calculations
- **Chart.js**: For beautiful, responsive charts
- **Nuxt Team**: For the excellent framework

## 📞 Support

For questions or support:
1. Check existing issues in the repository
2. Create a new issue with detailed information
3. Provide steps to reproduce any problems

---

**Happy Fishing! 🎣**

*Built with ❤️ for the fishing community*