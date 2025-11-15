# Quick Start Guide

## Installation & Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - The app will be available at `http://localhost:5173`
   - Navigate to `/influencers?g=male` to see the influencer search page

## Running Both Frontend & Backend

### Terminal 1 - Backend:
```bash
cd backend
source ../venv/bin/activate
python main.py
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Features to Test

1. **Filter Panel:**
   - Click filter sections to expand/collapse
   - Use chips to select platforms, categories
   - Adjust sliders for followers, price, age
   - Click "Save" to apply changes
   - Click "Clear All" to reset filters

2. **Responsive Design:**
   - Resize browser to see mobile drawer
   - Test filter panel on tablet/desktop sizes

3. **Influencer Cards:**
   - Hover over cards to see hover effects
   - Hover over badges to see tooltips
   - Click cards to view profile (placeholder)

4. **Accessibility:**
   - Navigate with Tab key
   - Use Enter/Space to interact
   - Screen reader friendly

5. **Cookie & Terms Banners:**
   - Accept/decline cookies
   - Review terms banner

## Troubleshooting

**Port already in use?**
```bash
# Change port in vite.config.ts or kill process using port 5173
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**
```bash
# Ensure all dependencies are installed
npm install
```

## Next Steps

- Connect to backend API (update API calls in components)
- Add more mock data
- Customize theme colors
- Add user authentication
- Implement infinite scroll

