import { RankedChannel } from '../api/client'

const ScoreBar = ({ label, value, color = 'bg-accent' }: { label: string; value: number; color?: string }) => {
  const pct = Math.round(value * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const RankedResults = ({ ranked }: { ranked: RankedChannel[] }) => {
  if (!ranked || ranked.length === 0) return null

  return (
    <section className="max-w-[1920px] mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Recommended Influencers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {ranked.map((ch) => (
          <div key={ch.channel_id} className="bg-white border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-hover transition-shadow">
            <div className="relative aspect-video bg-gray-100">
              {ch.thumbnail ? (
                <img src={ch.thumbnail} alt={ch.title} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">Final {Math.round(ch.final_score * 100)}%</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg truncate" title={ch.title}>{ch.title}</h3>
                <span className="text-sm text-muted whitespace-nowrap">{ch.country || ''}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ScoreBar label="Match" value={ch.match_score} />
                <ScoreBar label="Keywords" value={ch.hit_score} />
                <ScoreBar label="Comments" value={ch.comment_score} />
                <ScoreBar label="Network" value={ch.network_score} />
                {ch.engagement_depth_score !== undefined && (
                  <ScoreBar label="Engagement" value={ch.engagement_depth_score} color="bg-green-500" />
                )}
              </div>
              {ch.network_breakdown && Object.keys(ch.network_breakdown).length > 0 && (
                <div className="text-xs text-muted space-y-1">
                  <div>PageRank: {ch.network_breakdown.pagerank || 0}</div>
                  <div>Degree: {ch.network_breakdown.degree || 0}</div>
                  <div>Betweenness: {ch.network_breakdown.betweenness || 0}</div>
                </div>
              )}
              <div className="text-xs text-muted">
                Videos sampled: {ch.sampled_videos?.length || 0}
              </div>
              <a
                href={`https://www.youtube.com/channel/${ch.channel_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors focus-ring text-sm font-medium"
              >
                View Channel
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RankedResults
