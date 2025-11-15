import { useState } from 'react'

interface CampaignPanelProps {
  onExpand: (campaignText: string, seedKeywords: string[], languages: string[]) => Promise<void>
  onSearchVideos: (keywords: string[], topVideosPerKeyword: number, videoDuration: string, languages: string[]) => Promise<void>
  onSelectInfluencers: (params: {
    campaignText: string
    seedKeywords: string[]
    keywords: string[]
    topVideosPerKeyword: number
    pastVideosToCheck: number
    topN: number
    useNetwork: boolean
    maxCommentsPerVideo: number
  }) => Promise<void>
  suggestedKeywords: string[]
  selectedKeywords: string[]
  setSelectedKeywords: (kw: string[]) => void
}

const CampaignPanel = ({
  onExpand,
  onSearchVideos,
  onSelectInfluencers,
  suggestedKeywords,
  selectedKeywords,
  setSelectedKeywords,
}: CampaignPanelProps) => {
  const [campaignText, setCampaignText] = useState('')
  const [seedKeywordsInput, setSeedKeywordsInput] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])  // Default to English
  const [videoDuration, setVideoDuration] = useState<'short' | 'medium' | 'long' | 'any'>('any')  // Default to any
  const [topVideosPerKeyword, setTopVideosPerKeyword] = useState(10)  // Increased default to 10
  const [pastVideosToCheck, setPastVideosToCheck] = useState(5)
  const [topN, setTopN] = useState(20)
  const [useNetwork, setUseNetwork] = useState(true)  // Enable network analysis by default
  const [maxCommentsPerVideo, setMaxCommentsPerVideo] = useState(50)
  const [loading, setLoading] = useState<'expand' | 'search' | 'select' | null>(null)

  const parseSeeds = () => seedKeywordsInput.split(',').map(s => s.trim()).filter(Boolean)

  const toggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== kw))
    } else {
      setSelectedKeywords([...selectedKeywords, kw])
    }
  }

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      // Don't allow deselecting all languages
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(l => l !== lang))
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang])
    }
  }

  // Popular Indian languages
  const indianLanguages = [
    { code: 'English', name: 'English', flag: '🇬🇧' },
    { code: 'Hindi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'Telugu', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'Malayalam', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'Bengali', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'Marathi', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'Hinglish', name: 'Hinglish (Mix)', flag: '🇮🇳' },
  ]

  return (
    <section className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-border">
      <div className="max-w-[1920px] mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Setup</h2>
          <p className="text-sm text-gray-600 mt-1">
            Describe your influencer marketing campaign, and our AI will generate the perfect keywords to find matching creators
          </p>
        </div>

        {/* Main Campaign Brief Input - Emphasized */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-base font-semibold mb-2 text-gray-900">
              📝 Campaign Brief <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Tell us what you're promoting and who you want to reach. Be specific about your product, target audience, and campaign goals.
            </p>
            <textarea
              value={campaignText}
              onChange={(e) => setCampaignText(e.target.value)}
              rows={5}
              placeholder="Example: We're launching an eco-friendly fitness water bottle brand targeting health-conscious millennials and Gen-Z in India. Looking for fitness influencers, yoga practitioners, gym-goers, and lifestyle creators who promote sustainable living and wellness. Our campaign focuses on affordability, style, and environmental responsibility."
              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>

          {/* Optional Seed Keywords */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              🔑 Seed Keywords (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Add initial keywords if you have specific terms in mind. Our AI will expand these based on your campaign brief.
            </p>
            <input
              type="text"
              value={seedKeywordsInput}
              onChange={(e) => setSeedKeywordsInput(e.target.value)}
              placeholder="eco fitness, sustainable products, gym lifestyle (optional)"
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>

          {/* Language Selector - Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              🌐 Target Languages <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Select one or more languages. Keywords will be generated in all selected languages to reach diverse audiences.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {indianLanguages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.code)
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all border-2 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-left flex-1">{lang.name}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: <strong>{selectedLanguages.join(', ')}</strong> ({selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''})
            </p>
          </div>

          {/* Video Duration Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              ⏱️ Video Duration
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Filter videos by length: Shorts (&lt; 4 min), Medium (4-20 min), Long (&gt; 20 min), or all durations
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'any', label: 'All Durations', icon: '📺' },
                { value: 'short', label: 'Shorts (< 4 min)', icon: '⚡' },
                { value: 'medium', label: 'Medium (4-20 min)', icon: '🎬' },
                { value: 'long', label: 'Long (> 20 min)', icon: '🎥' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVideoDuration(option.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                    videoDuration === option.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Keywords Button */}
          <div className="pt-2">
            <button
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading !== null || !campaignText.trim() || selectedLanguages.length === 0}
              onClick={async () => {
                setLoading('expand')
                try { await onExpand(campaignText, parseSeeds(), selectedLanguages) } finally { setLoading(null) }
              }}
            >
              {loading === 'expand' ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Keywords in {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  ✨ Generate Keywords in {selectedLanguages.length === 1 ? selectedLanguages[0] : `${selectedLanguages.length} Languages`}
                </>
              )}
            </button>
            {!campaignText.trim() && (
              <p className="text-xs text-red-500 mt-2">⚠️ Please enter a campaign brief to generate keywords</p>
            )}
          </div>
        </div>

        {/* AI-Generated Keywords Display */}
        {suggestedKeywords.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🎯 AI-Generated Keywords
                <span className="text-sm font-normal text-gray-500">({selectedKeywords.length} selected)</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Click to select/deselect keywords. Selected keywords will be used to find matching influencers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedKeywords.map((kw) => {
                const selected = selectedKeywords.includes(kw)
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => toggleKeyword(kw)}
                    aria-pressed={selected}
                    className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all focus-ring ${
                      selected 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-sm'
                    }`}
                  >
                    {selected && '✓ '}
                    {kw}
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading !== null || selectedKeywords.length === 0}
                onClick={async () => {
                  setLoading('search')
                  try { await onSearchVideos(selectedKeywords, topVideosPerKeyword, videoDuration, selectedLanguages) } finally { setLoading(null) }
                }}
              >
                {loading === 'search' ? '🔍 Searching...' : '🔍 Preview Top Videos'}
              </button>
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading !== null || selectedKeywords.length === 0}
                onClick={async () => {
                  setLoading('select')
                  try {
                    await onSelectInfluencers({
                      campaignText,
                      seedKeywords: parseSeeds(),
                      keywords: selectedKeywords,
                      topVideosPerKeyword,
                      pastVideosToCheck,
                      topN,
                      useNetwork,
                      maxCommentsPerVideo,
                    })
                  } finally { setLoading(null) }
                }}
              >
                {loading === 'select' ? '⚡ Ranking Influencers...' : '⚡ Find Best Influencers'}
              </button>
            </div>
          </div>
        )}

        {/* Advanced Settings - Collapsed by default */}
        <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-900 hover:text-purple-600 transition-colors">
            ⚙️ Advanced Settings
          </summary>
          <div className="mt-4 grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Top Videos per Keyword</label>
              <input type="number" min={1} max={20} value={topVideosPerKeyword} onChange={(e)=>setTopVideosPerKeyword(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Past Videos to Check</label>
              <input type="number" min={1} max={20} value={pastVideosToCheck} onChange={(e)=>setPastVideosToCheck(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Top N Influencers</label>
              <input type="number" min={1} max={100} value={topN} onChange={(e)=>setTopN(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Max Comments per Video</label>
              <input type="number" min={10} max={200} value={maxCommentsPerVideo} onChange={(e)=>setMaxCommentsPerVideo(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200"/>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={useNetwork} onChange={(e)=>setUseNetwork(e.target.checked)} className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"/>
              <span className="text-sm text-gray-700">Use network analysis (PageRank) for ranking</span>
            </label>
          </div>
        </details>
      </div>
    </section>
  )
}

export default CampaignPanel
