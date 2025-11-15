# 🚀 GAIM Complete Setup Guide

**Comprehensive installation and configuration guide for GAIM YouTube Influencer Discovery Platform**

This guide provides step-by-step instructions to get GAIM running on your machine, from basic installation to advanced configuration options.

## 📋 System Requirements

### Minimum Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Stable connection for API calls

### Operating System Support
- ✅ **macOS**: 10.15+ (Catalina and newer)
- ✅ **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent
- ✅ **Windows**: 10/11 with WSL2 recommended

## 🔑 API Keys Setup

### 1. YouTube Data API v3 Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable YouTube Data API v3**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. **Create credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
   - **Important**: Restrict the key to YouTube Data API v3 for security

### 2. Google Gemini API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Get API Key**:
   - Click "Get API Key" in the top navigation
   - Create a new API key or use existing one
   - Copy the API key
4. **Note**: Gemini API has generous free tier limits

## 🛠️ Quick Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/anubhav-77-dev/yt.git
cd yt

# Copy environment template
cp ENV_EXAMPLE.txt .env

# Edit .env file with your API keys
# Add: YOUTUBE_API_KEY=your_youtube_api_key_here
# Add: GEMINI_API_KEY=your_gemini_api_key_here

# Set up Python environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up frontend and start both servers
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# Required API Keys
YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Configuration
YT_MAX_SEARCH_CALLS_PER_REQUEST=25
YT_MAX_LANGUAGES_PER_KEYWORD=1
DEBUG=false
CACHE_ENABLED=true
```

## 🚀 Running the Application

### Single Command (Recommended)
```bash
cd frontend
npm run dev
```

This automatically:
- Starts backend on port 8000
- Starts frontend on port 5173
- Opens browser
- Provides hot-reload

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔍 Verification

### Health Check
```bash
curl http://localhost:8000/api/health
```
Expected: `{"status":"healthy","youtube_api":true,"gemini_api":true}`

### Full Test
1. Open http://localhost:5173
2. Enter campaign brief: "organic skincare for millennials"
3. Select languages: English, Hindi
4. Test all three main features:
   - Generate Keywords
   - Find Top Videos
   - Select Influencers

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**API key errors:**
- Verify keys in `.env` file
- Check API quotas in Google Cloud Console
- Ensure APIs are enabled

**Module not found:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**Node.js version:**
```bash
node --version  # Should be 16.0+
```

## 🔧 Development

### Code Quality
```bash
# Backend
black backend/
flake8 backend/

# Frontend
npm run lint
npm run format
```

### Testing
```bash
pytest backend/tests/
npm test
```

## 📦 Production Deployment

### Environment
- Use production `.env` files
- Set up SSL/TLS
- Configure proper logging
- Set up monitoring

### Scaling
- Consider Redis for caching
- Deploy services separately
- Use Docker containers
- Implement load balancing

---

## 🆘 Support

- **Issues**: Create GitHub issue with logs
- **Logs**: Check terminal output and browser console
- **API Quotas**: Monitor usage in Google Cloud Console

**Happy influencer discovering! 🎯**
