const Footer = () => {
  const resources = [
    { label: 'Blog', href: '/blog' },
    { label: 'Resource Hub', href: '/resources' },
    { label: 'Affiliate Program', href: '/affiliate' },
    { label: 'TikTok Ebook For Brands', href: '/ebook' },
    { label: '2025 Influencer Marketing Report', href: '/report' },
  ]

  const tools = [
    { label: 'Influencer Price Calculator', href: '/tools/price-calculator' },
    { label: 'Instagram Fake Follower Checker', href: '/tools/instagram-checker' },
    { label: 'TikTok Fake Follower Checker', href: '/tools/tiktok-checker' },
    { label: 'Instagram Engagement Rate Calculator', href: '/tools/instagram-engagement' },
    { label: 'TikTok Engagement Rate Calculator', href: '/tools/tiktok-engagement' },
    { label: 'Influencer Campaign Brief Template', href: '/tools/campaign-brief' },
    { label: 'Influencer Contract Template', href: '/tools/contract-template' },
    { label: 'Influencer Analytics & Tracking', href: '/tools/analytics' },
    { label: 'Instagram Reels Downloader', href: '/tools/reels-downloader' },
    { label: 'TikTok Video Downloader', href: '/tools/tiktok-downloader' },
  ]

  const discover = [
    { label: 'Find Influencers', href: '/influencers' },
    { label: 'Top Influencers', href: '/top-influencers' },
    { label: 'Search Influencers', href: '/search' },
    { label: 'Buy Shoutouts', href: '/shoutouts' },
  ]

  const support = [
    { label: 'Contact Us', href: '/contact' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Frequently Asked Questions', href: '/faq' },
  ]

  const socialLinks = [
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'TikTok', icon: '🎵', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
  ]

  return (
    <footer className="bg-gray-50 border-t border-border">
      <div className="max-w-[1920px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted hover:text-accent transition-colors focus-ring"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-4">Tools</h3>
            <ul className="space-y-2">
              {tools.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted hover:text-accent transition-colors focus-ring"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-4">Discover</h3>
            <ul className="space-y-2">
              {discover.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted hover:text-accent transition-colors focus-ring"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm text-text mb-4">Support</h3>
            <ul className="space-y-2">
              {support.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted hover:text-accent transition-colors focus-ring"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-border hover:border-accent hover:bg-accent hover:text-white transition-colors focus-ring"
              aria-label={social.name}
            >
              <span className="text-lg">{social.icon}</span>
            </a>
          ))}
        </div>

        {/* Legal */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} GAIM Inc. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a href="/privacy" className="text-sm text-muted hover:text-accent transition-colors focus-ring">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-muted hover:text-accent transition-colors focus-ring">
                Terms
              </a>
              <a href="/sitemap" className="text-sm text-muted hover:text-accent transition-colors focus-ring">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

