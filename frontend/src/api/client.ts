export interface ExpandKeywordsResponse {
  expanded: Record<string, string[]>
  suggested_keywords: string[]
}

export interface Video {
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

export interface SearchTopVideosResponse {
  results: Record<string, Video[]>
}

export interface RankedChannel {
  channel_id: string
  title: string
  thumbnail?: string
  country?: string
  match_score: number
  final_score: number
  hit_score: number
  comment_score: number
  network_score: number
  engagement_depth_score?: number
  sampled_videos: string[]
  match_breakdown: Record<string, number>
  network_breakdown?: {
    pagerank: number
    degree: number
    betweenness: number
  }
  subscriber_count?: number
  view_count?: number
  video_count?: number
}

export interface SelectInfluencersResponse {
  ranked: RankedChannel[]
  keywords_used: string[]
}

const jsonFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  expandKeywords: (payload: { campaign_text: string; seed_keywords: string[]; max_related_per_keyword?: number; languages?: string[] }) =>
    jsonFetch<ExpandKeywordsResponse>('/api/expand-keywords', { method: 'POST', body: JSON.stringify(payload) }),

  searchTopVideos: (payload: { keywords: string[]; top_videos_per_keyword: number; order?: string; video_duration?: string; languages?: string[] }) =>
    jsonFetch<SearchTopVideosResponse>('/api/search-top-videos', { method: 'POST', body: JSON.stringify(payload) }),

  selectInfluencers: (payload: {
    campaign_text: string
    seed_keywords: string[]
    keywords?: string[]
    top_videos_per_keyword: number
    past_videos_to_check: number
    top_n: number
    use_network: boolean
    max_comments_per_video: number
  }) => jsonFetch<SelectInfluencersResponse>('/api/select-influencers', { method: 'POST', body: JSON.stringify(payload) }),
}
