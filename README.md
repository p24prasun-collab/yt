# 🎯 GAIM - YouTube Influencer Discovery Platform

**AI-Powered YouTube Influencer Discovery for the Indian Market**

GAIM (Google AI-Managed Influencer Network) is a comprehensive platform that revolutionizes how brands discover and connect with authentic YouTube influencers in India. Built with cutting-edge AI and advanced network analysis, GAIM helps you find the perfect influencers for your campaigns across India's diverse linguistic and cultural landscape.

![GAIM Platform](https://img.shields.io/badge/Platform-YouTube%20Influencer%20Discovery-blue?style=for-the-badge&logo=youtube)
![AI Powered](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-green?style=for-the-badge&logo=google)
![Languages](https://img.shields.io/badge/Languages-11%20Indian%20Languages-orange?style=for-the-badge)

## ✨ Key Features

### 🤖 **AI-Powered Intelligence**
- **Smart Keyword Generation**: Leverages Google's Gemini 2.0 Flash model with professional marketer system prompts
- **Natural Language Processing**: Understands campaign briefs and generates contextually relevant keywords
- **Multi-Language AI**: Generates keywords in 11 Indian languages automatically

### 🌏 **Indian Market Focus**
- **Regional Content Discovery**: Specialized for Indian YouTube content and creators
- **Multi-Language Support**: Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese
- **Cultural Context**: Understands Indian market nuances and cultural preferences

### 🔍 **Advanced Discovery & Filtering**
- **Video Duration Filtering**: Short-form (<4min), Medium (4-20min), Long-form (>20min), or All
- **Language-Specific Search**: Target specific linguistic communities
- **Performance-Based Ranking**: Discover top-performing videos and creators
- **Real-time Data**: Fresh insights from YouTube's latest content

### 📊 **Sophisticated Analytics**
- **Network Analysis**: PageRank, degree centrality, and betweenness centrality algorithms
- **Authenticity Scoring**: Advanced comment analysis to detect organic vs. artificial engagement
- **Engagement Depth**: Comprehensive metrics beyond basic subscriber counts
- **Multi-Factor Ranking**: Combines content relevance, network influence, and engagement quality

### ⚡ **Smart Resource Management**
- **Quota Conservation**: Intelligent YouTube API usage to maximize efficiency
- **Caching System**: SQLite-based caching for improved performance
- **Background Processing**: Async operations for seamless user experience

## � Quick Start

### Prerequisites
- Python 3.8+ with virtual environment support
- Node.js 16+ with npm
- YouTube Data API v3 key
- Google Gemini API key

### One-Command Setup
```bash
git clone https://github.com/p24prasun-collab/yt
```

### Environment Setup
1. **Copy environment template:**
   ```bash
   cp ENV_EXAMPLE.txt .env
   ```

2. **Add your API keys to `.env`:**
   ```env
   YOUTUBE_API_KEY=your_youtube_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Install dependencies and start:**
   ```bash
   # Install Python dependencies
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Install frontend dependencies and start both servers
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🎯 How It Works

### 1. **Campaign Brief Input**
Describe your campaign goals in natural language. GAIM's AI understands context and generates relevant keywords.

### 2. **Multi-Language Targeting**
Select from 11 Indian languages to reach specific linguistic communities and regional audiences.

### 3. **Smart Discovery**
AI-powered search across YouTube's vast content library, filtering by duration, language, and engagement quality.

### 4. **Influencer Ranking**
Advanced algorithms analyze network relationships, content relevance, and engagement authenticity to rank influencers.

### 5. **Results & Insights**
Get detailed influencer profiles with performance metrics, sample videos, and contact suggestions.

## 🛠️ Architecture

### Backend (FastAPI + Python)
- **`backend/main.py`**: FastAPI REST API with async endpoints
- **`backend/llm.py`**: Gemini AI integration for keyword generation
- **`backend/youtube_api.py`**: YouTube Data API v3 wrapper with quota management
- **`backend/network_analyzer.py`**: NetworkX-based influencer network analysis
- **`backend/matcher.py`**: Content matching and relevance scoring
- **`backend/database.py`**: SQLite caching layer

### Frontend (React + TypeScript)
- **`frontend/src/pages/InfluencersPage.tsx`**: Main application interface
- **`frontend/src/components/CampaignPanel.tsx`**: Campaign configuration UI
- **`frontend/src/components/TopVideosDisplay.tsx`**: Video results modal
- **`frontend/src/api/client.ts`**: Backend API integration
- **`frontend/scripts/dev-full.mjs`**: Unified development server script

## 📚 API Documentation

### Core Endpoints

#### `POST /api/expand-keywords`
Generate AI-powered keywords from campaign brief
```json
{
  "campaign_text": "Launch organic skincare for young professionals",
  "languages": ["English", "Hindi"],
  "max_related_per_keyword": 5
}
```

#### `POST /api/search-top-videos`
Discover top videos for given keywords
```json
{
  "keywords": ["organic skincare", "natural beauty"],
  "languages": ["English", "Hindi"],
  "video_duration": "medium",
  "top_videos_per_keyword": 10
}
```

#### `POST /api/select-influencers`
Find and rank influencers based on campaign requirements
```json
{
  "campaign_text": "Launch organic skincare for young professionals",
  "top_n": 20,
  "use_network": true
}
```

## 🎨 Technology Stack

### AI & Machine Learning
- **Google Gemini 2.0 Flash**: Advanced language model for keyword generation
- **NetworkX**: Graph analysis for influencer network mapping
- **scikit-learn**: TF-IDF vectorization and content similarity
- **Pandas & NumPy**: Data processing and numerical computations

### Backend Infrastructure
- **FastAPI**: High-performance async API framework
- **aiohttp**: Async HTTP client for external API calls
- **SQLite**: Lightweight database for caching
- **Python 3.8+**: Modern Python with async/await support

### Frontend Experience
- **React 18**: Modern component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Lightning-fast development server and build tool
- **TailwindCSS**: Utility-first styling framework

### Development Tools
- **Docker**: Containerization support (optional)
- **Git**: Version control with comprehensive history
- **ESLint & Prettier**: Code quality and formatting
- **Hot Reload**: Instant feedback during development

## � Performance & Limitations

### YouTube API Quota Management
- **Daily Limit**: 10,000 units per day (search costs 100 units each)
- **Smart Conservation**: Configurable limits via environment variables
- **Caching**: Automatic caching to reduce redundant API calls
- **Error Handling**: Graceful quota exceeded handling with helpful messages

### Supported Content Types
- **Languages**: 11 Indian languages with automatic detection
- **Video Durations**: Short (<4min), Medium (4-20min), Long (>20min)
- **Content Categories**: All YouTube categories with Indian regional focus
- **Engagement Types**: Views, likes, comments, subscriber metrics

## 🚀 Production Deployment

### Environment Variables
```env
# Required API Keys
YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Configuration
YT_MAX_SEARCH_CALLS_PER_REQUEST=25
YT_MAX_LANGUAGES_PER_KEYWORD=1
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker
docker build -t gaim-platform .
docker run -p 8000:8000 -p 5173:5173 --env-file .env gaim-platform
```

### Production Considerations
- Use environment-specific `.env` files
- Implement proper logging and monitoring
- Set up SSL/TLS for HTTPS
- Configure CORS for your domain
- Consider API rate limiting for public deployment

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation
4. **Add tests** for new functionality
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow Python PEP 8 style guidelines
- Use TypeScript for frontend development
- Add comprehensive docstrings to functions
- Include error handling and logging
- Write tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For advanced language understanding
- **YouTube Data API**: For comprehensive video and channel data
- **React & FastAPI**: For robust frontend and backend frameworks
- **Open Source Community**: For the amazing libraries and tools

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/anubhav-77-dev/yt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anubhav-77-dev/yt/discussions)
- **Documentation**: Check the `docs/` folder for detailed guides

---

**Built with ❤️ for the Indian creator economy**

*Empowering brands to discover authentic voices across India's diverse digital landscape*

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   YOUTUBE_API_KEY=your_api_key_here
   DATABASE_PATH=gaim_database.db
   ```

   Get your YouTube API key from: https://console.cloud.google.com/apis/credentials

## 🏃 Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/health

## 📡 API Endpoints

### Search & Discovery
- `POST /api/search-channels` - Search for YouTube channels
- `POST /api/fetch-channel-details` - Get detailed channel information

### Network Analysis
- `POST /api/build-network` - Build network graph from channels
- `POST /api/export-network/{format}` - Export network (gexf/graphml)

### AI Matching
- `POST /api/match-influencers` - Find best matching influencers

### Database
- `GET /api/database/stats` - Get database statistics

## 📊 Example Usage

### Search for Channels
```bash
curl -X POST "http://localhost:8000/api/search-channels" \
  -H "Content-Type: application/json" \
  -d '{"query": "tech reviews", "max_results": 10}'
```

### Build Network
```bash
curl -X POST "http://localhost:8000/api/build-network" \
  -H "Content-Type: application/json" \
  -d '{"channel_ids": ["UC...", "UC..."]}'
```

### Match Influencers
```bash
curl -X POST "http://localhost:8000/api/match-influencers" \
  -H "Content-Type: application/json" \
  -d '{
    "channel_ids": ["UC...", "UC..."],
    "brand_keywords": ["technology", "gadgets", "reviews"],
    "target_audience": ["tech enthusiasts", "gamers"],
    "min_subscribers": 100000,
    "max_subscribers": 5000000
  }'
```

## 🗄️ Database Schema

The SQLite database includes:
- **influencers** - Channel metadata and statistics
- **videos** - Video data and engagement metrics
- **network_edges** - Connections between influencers
- **brand_matches** - Cached match results

## 🔧 Project Structure

```
GAIM/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── youtube_api.py       # YouTube API client
│   ├── network_analyzer.py  # NetworkX graph builder
│   ├── matcher.py           # AI matching algorithms
│   └── database.py          # SQLite database manager
├── requirements.txt
├── README.md
└── .env                     # Environment variables (create this)
```

## 🎯 Key Algorithms

### Content Matching
- **TF-IDF Vectorization** - Extract important keywords
- **Cosine Similarity** - Measure content relevance
- **Keyword Overlap** - Direct keyword matching

### Network Analysis
- **PageRank** - Identify influential nodes
- **Community Detection** - Find influencer clusters
- **Centrality Measures** - Degree, betweenness centrality

### Scoring System
- Content Relevance (40%)
- Keyword Match (25%)
- Engagement Quality (15%)
- Audience Fit (15%)
- Channel Authority (5%)

## 📈 Next Steps

1. **Build Frontend** - React/Vue.js web interface
2. **Add Visualization** - Web-based network graphs (pyvis/vis.js)
3. **Enhance Matching** - Add more ML models
4. **Cross-Platform** - Add Instagram/Twitter data
5. **Real-time Updates** - Background jobs for data refresh

## 📝 Notes

- With paid YouTube API access, you can process 10,000+ searches/day
- Database automatically caches all fetched data
- Network graphs can be exported to Gephi for advanced visualization
- All matching algorithms are customizable and extendable

## 🤝 Contributing

This is a student project. Feel free to extend and improve!

## 📄 License

Open source - feel free to use and modify.

