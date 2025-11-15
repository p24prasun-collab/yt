# GAIM Frontend

A production-ready React + TypeScript + TailwindCSS frontend for the GAIM influencer matching platform.

## Features

- 🎨 Modern, responsive UI design
- 📱 Mobile-first approach with drawer navigation
- ♿ Full accessibility support (WAI-ARIA, keyboard navigation)
- 🎯 Advanced filtering system with multiple criteria
- 🔍 Search and filter influencers by platform, category, location, price, and more
- 💎 Premium features gated with badges
- 🍪 Cookie consent and terms banners

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Header.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ResultsGrid.tsx
│   │   ├── Footer.tsx
│   │   └── CookieBanner.tsx
│   ├── pages/           # Page components
│   │   └── InfluencersPage.tsx
│   ├── data/            # Mock data
│   │   └── mockData.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies
```

## Features Overview

### Filtering System

- **Platform**: Multi-select chip group (Instagram, TikTok, YouTube, etc.)
- **Category**: Extensive category selection
- **Content Type**: Multi-select checklist
- **Followers**: Range slider with min/max inputs
- **Location**: Country, region, and city filters
- **Price**: Range slider for pricing
- **Gender**: Radio button selection
- **Age**: Range slider
- **Ethnicity & Language**: Premium features (gated)

### Responsive Design

- **Desktop (≥1280px)**: Two-column layout with sticky filter panel
- **Tablet (768-1279px)**: Filter collapses into accordion
- **Mobile (<768px)**: Full-height drawer for filters

### Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly
- High contrast ratios

## API Integration

The frontend is currently using mock data. To connect to the backend API:

1. Update API calls in components to use `fetch` or axios
2. The backend is configured to run on `http://localhost:8000`
3. CORS is already configured in the backend for `http://localhost:5173`

## Customization

### Theme Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --muted: #6b7280;
  --border: #e5e7eb;
  --accent: #6366f1;
}
```

### Tailwind Configuration

Modify `tailwind.config.js` to customize design tokens, spacing, breakpoints, etc.

## License

Open source - feel free to use and modify.

