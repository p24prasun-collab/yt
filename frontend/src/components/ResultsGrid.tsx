import { useState } from 'react'
import { Influencer } from '../data/mockData'

interface ResultsGridProps {
  influencers: Influencer[]
}

const ResultsGrid = ({ influencers }: ResultsGridProps) => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📷',
      tiktok: '🎵',
      youtube: '▶️',
      twitter: '🐦',
      twitch: '🎮',
      amazon: '🛒',
      ugc: '📹',
    }
    return icons[platform] || '📱'
  }

  const BadgeTooltip = ({ badge, children }: { badge: string; children: React.ReactNode }) => {
    const tooltips: Record<string, string> = {
      top_creator: 'Top creators have completed multiple orders and have a high rating from brands.',
      responds_fast: 'Responds to requests faster than most creators.',
    }

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setHoveredBadge(badge)}
          onMouseLeave={() => setHoveredBadge(null)}
          onFocus={() => setHoveredBadge(badge)}
          onBlur={() => setHoveredBadge(null)}
          className="inline-block"
          aria-describedby={`tooltip-${badge}`}
        >
          {children}
        </div>
        {hoveredBadge === badge && (
          <div
            id={`tooltip-${badge}`}
            role="tooltip"
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap z-10"
          >
            {tooltips[badge]}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {influencers.length} Male Influencer{influencers.length !== 1 ? 's' : ''}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {influencers.map((influencer) => (
          <a
            key={influencer.id}
            href={`/influencer/${influencer.id}`}
            className="group relative bg-white border border-border rounded-lg overflow-hidden hover:shadow-hover transition-all duration-150 focus-ring"
            aria-label={`View profile of ${influencer.name}`}
          >
            {/* Image Container */}
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
              <img
                src={influencer.image_url}
                alt={influencer.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                loading="lazy"
              />

              {/* Platform Badge */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                <span>{getPlatformIcon(influencer.platform)}</span>
                <span className="capitalize">{influencer.platform === 'ugc' ? 'UGC' : influencer.platform}</span>
              </div>

              {/* Top Badges */}
              {influencer.badges.length > 0 && (
                <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                  {influencer.badges.map((badge) => (
                    <BadgeTooltip key={badge} badge={badge}>
                      <span className="bg-white text-accent px-2 py-1 rounded-md text-xs font-semibold shadow-sm">
                        {badge === 'top_creator' ? 'Top Creator' : 'Responds Fast'}
                      </span>
                    </BadgeTooltip>
                  ))}
                </div>
              )}

              {/* Follower Count */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                {influencer.followers_short}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-2">
              {/* Name and Rating */}
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-text truncate flex-1">{influencer.name}</h3>
                <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                  <span className="text-yellow-500" aria-label={`Rating: ${influencer.rating} out of 5 stars`}>
                    ★
                  </span>
                  <span className="text-sm font-medium">{influencer.rating}</span>
                  {influencer.rating_count && (
                    <span className="text-xs text-muted">({influencer.rating_count})</span>
                  )}
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm text-muted line-clamp-1">{influencer.tagline}</p>

              {/* Price */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xl font-bold text-accent">${influencer.price_usd.toLocaleString()}</span>
                <div className="text-xs text-muted">
                  {influencer.location.city}, {influencer.location.region_code} {influencer.location.country_code}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors focus-ring font-medium">
          Next Page
        </button>
      </div>
    </div>
  )
}

export default ResultsGrid

