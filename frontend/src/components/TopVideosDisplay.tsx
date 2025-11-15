import { useState } from 'react'

interface Video {
  video_id: string
  title: string
  description: string
  thumbnail: string
  channel_id: string
  channel_title: string
  view_count: number
  like_count: number
  comment_count: number
  published_at: string
}

interface TopVideosDisplayProps {
  results: Record<string, Video[]>
  onClose: () => void
}

const TopVideosDisplay = ({ results, onClose }: TopVideosDisplayProps) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string>(Object.keys(results)[0] || '')
  const keywords = Object.keys(results)
  const videos = selectedKeyword ? results[selectedKeyword] : []

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      return `${Math.floor(diffDays / 365)} years ago`
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎬 Top Videos by Keyword</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing videos from Indian creators for your selected keywords
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Keyword Tabs */}
        <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {keywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSelectedKeyword(keyword)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedKeyword === keyword
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {keyword}
                <span className="ml-2 text-xs opacity-80">
                  ({results[keyword].length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No videos found for this keyword</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.video_id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Thumbnail */}
                  <a
                    href={`https://www.youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-video bg-gray-100 overflow-hidden"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <a
                      href={`https://www.youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-purple-600 transition-colors mb-2">
                        {video.title}
                      </h3>
                    </a>

                    {/* Channel */}
                    <a
                      href={`https://www.youtube.com/channel/${video.channel_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-3 block"
                    >
                      📺 {video.channel_title}
                    </a>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {formatNumber(video.view_count)} views
                      </span>
                      <span className="flex items-center gap-1">
                        👍 {formatNumber(video.like_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {formatNumber(video.comment_count)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-gray-400">
                      {formatDate(video.published_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with total count */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing <strong>{videos.length}</strong> videos for "<strong>{selectedKeyword}</strong>"
            </span>
            <span>
              Total: <strong>{Object.values(results).reduce((acc, vids) => acc + vids.length, 0)}</strong> videos across <strong>{keywords.length}</strong> keywords
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopVideosDisplay
