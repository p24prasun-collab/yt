import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import FilterPanel from '../components/FilterPanel'
import ResultsGrid from '../components/ResultsGrid'
import Footer from '../components/Footer'
import CookieBanner from '../components/CookieBanner'
import CampaignPanel from '../components/CampaignPanel'
import RankedResults from '../components/RankedResults'
import TopVideosDisplay from '../components/TopVideosDisplay'
import { mockInfluencers } from '../data/mockData'
import { api, RankedChannel, Video } from '../api/client'

interface FilterState {
  platform: string[]
  category: string[]
  contentType: string[]
  followers: { min: number; max: number }
  country: string[]
  region: { country: string; region: string }
  city: string
  price: { min: number; max: number }
  gender: 'female' | 'male' | 'other' | ''
  age: { min: number; max: number }
  ethnicity: string[]
  language: string[]
}

const InfluencersPage = () => {
  const [searchParams] = useSearchParams()
  const genderParam = searchParams.get('g') || 'male'

  const [filters, setFilters] = useState<FilterState>({
    platform: [],
    category: [],
    contentType: [],
    followers: { min: 0, max: 1000000 },
    country: [],
    region: { country: '', region: '' },
    city: '',
    price: { min: 50, max: 3000 },
    gender: genderParam === 'male' ? 'male' : genderParam === 'female' ? 'female' : 'other',
    age: { min: 0, max: 100 },
    ethnicity: [],
    language: [],
  })

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [ranked, setRanked] = useState<RankedChannel[]>([])
  const [topVideos, setTopVideos] = useState<Record<string, Video[]> | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsFilterOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredInfluencers = useMemo(() => {
    return mockInfluencers.filter((influencer) => {
      if (filters.platform.length > 0 && !filters.platform.includes('Any')) {
        const platformMap: Record<string, string> = {
          Instagram: 'instagram',
          TikTok: 'tiktok',
          YouTube: 'youtube',
          Twitter: 'twitter',
          Twitch: 'twitch',
          Amazon: 'amazon',
          'User Generated Content': 'ugc',
        }
        const mappedPlatforms = filters.platform.map((p) => platformMap[p] || p.toLowerCase())
        if (!mappedPlatforms.includes(influencer.platform)) return false
      }
      if (influencer.followers < filters.followers.min || influencer.followers > filters.followers.max) return false
      if (influencer.price_usd < filters.price.min || influencer.price_usd > filters.price.max) return false
      if (filters.country.length > 0) {
        const countryMap: Record<string, string> = {
          'United States': 'US',
          'United Kingdom': 'GB',
          'Canada': 'CA',
          'Australia': 'AU',
          'India': 'IN',
        }
        const mappedCountries = filters.country.map((c) => countryMap[c] || c)
        if (!mappedCountries.includes(influencer.location.country_code)) return false
      }
      if (filters.city && !influencer.location.city.toLowerCase().includes(filters.city.toLowerCase())) return false
      return true
    })
  }, [filters])

  const handleClearAll = () => {
    setFilters({
      platform: [],
      category: [],
      contentType: [],
      followers: { min: 0, max: 1000000 },
      country: [],
      region: { country: '', region: '' },
      city: '',
      price: { min: 50, max: 3000 },
      gender: genderParam === 'male' ? 'male' : genderParam === 'female' ? 'female' : 'other',
      age: { min: 0, max: 100 },
      ethnicity: [],
      language: [],
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Campaign Panel */}
      <CampaignPanel
        onExpand={async (campaignText, seedKeywords, languages) => {
          const res = await api.expandKeywords({ 
            campaign_text: campaignText, 
            seed_keywords: seedKeywords, 
            max_related_per_keyword: 5,
            languages: languages 
          })
          setSuggestedKeywords(res.suggested_keywords)
          // auto-select a few by default
          setSelectedKeywords(res.suggested_keywords.slice(0, 5))
        }}
        onSearchVideos={async (keywords, top, videoDuration, languages) => {
          console.log('Searching videos with params:', { keywords, top, videoDuration, languages })
          const result = await api.searchTopVideos({ 
            keywords, 
            top_videos_per_keyword: top, 
            order: 'viewCount',
            video_duration: videoDuration,
            languages 
          })
          setTopVideos(result.results)
        }}
        onSelectInfluencers={async ({ campaignText, seedKeywords, keywords, topVideosPerKeyword, pastVideosToCheck, topN, useNetwork, maxCommentsPerVideo }) => {
          const result = await api.selectInfluencers({
            campaign_text: campaignText,
            seed_keywords: seedKeywords,
            keywords,
            top_videos_per_keyword: topVideosPerKeyword,
            past_videos_to_check: pastVideosToCheck,
            top_n: topN,
            use_network: useNetwork,
            max_comments_per_video: maxCommentsPerVideo,
          })
          setRanked(result.ranked)
        }}
        suggestedKeywords={suggestedKeywords}
        selectedKeywords={selectedKeywords}
        setSelectedKeywords={setSelectedKeywords}
      />

      <main className="flex-1">
        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="sticky top-16 z-30 bg-white border-b border-border px-4 py-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-border rounded-md hover:bg-gray-100 transition-colors focus-ring"
              aria-label="Open filters"
            >
              <span className="font-medium">Filters</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        )}

        <div className="max-w-[1920px] mx-auto flex">
          {/* Filter Panel */}
          {!isMobile && (
            <aside className="w-80 flex-shrink-0">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClearAll={handleClearAll}
                isMobile={false}
                isOpen={false}
                onClose={() => {}}
              />
            </aside>
          )}

          {/* Mobile Filter Drawer */}
          {isMobile && (
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClearAll={handleClearAll}
              isMobile={true}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
            />
          )}

          {/* Results */}
          <div className="flex-1 px-4 py-8">
            {ranked.length > 0 && <RankedResults ranked={ranked} />}
            <ResultsGrid influencers={filteredInfluencers} />
          </div>
        </div>
      </main>

      {/* Top Videos Modal */}
      {topVideos && (
        <TopVideosDisplay 
          results={topVideos} 
          onClose={() => setTopVideos(null)} 
        />
      )}

      <Footer />
      <CookieBanner />
    </div>
  )
}

export default InfluencersPage

