export interface Influencer {
  id: string
  name: string
  platform: 'instagram' | 'tiktok' | 'ugc' | 'youtube' | 'twitter' | 'twitch' | 'amazon'
  followers: number
  followers_short: string
  rating: number
  rating_count?: number
  tagline: string
  price_usd: number
  location: {
    city: string
    region_code: string
    country_code: string
  }
  badges: ('top_creator' | 'responds_fast')[]
  image_url: string
}

export const mockInfluencers: Influencer[] = [
  {
    id: '1',
    name: 'Don B.',
    platform: 'instagram',
    followers: 1600,
    followers_short: '1.6k',
    rating: 5.0,
    rating_count: 12,
    tagline: 'Lifestyle content creator | Fashion & Travel',
    price_usd: 50,
    location: { city: 'London', region_code: 'LND', country_code: 'GB' },
    badges: ['responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Drex Lee',
    platform: 'tiktok',
    followers: 4000000,
    followers_short: '4.0m',
    rating: 5.0,
    rating_count: 245,
    tagline: 'Comedy & Entertainment | Viral Content Creator',
    price_usd: 35000,
    location: { city: 'San Jose', region_code: 'CA', country_code: 'US' },
    badges: ['top_creator', 'responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    name: 'Md Amaan Waris',
    platform: 'youtube',
    followers: 255100,
    followers_short: '255.1k',
    rating: 4.8,
    rating_count: 34,
    tagline: 'Tech Reviews & Tutorials | Unboxing Expert',
    price_usd: 50,
    location: { city: 'Kanpur', region_code: 'UP', country_code: 'IN' },
    badges: [],
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'Alex Rivera',
    platform: 'instagram',
    followers: 89000,
    followers_short: '89k',
    rating: 4.9,
    rating_count: 56,
    tagline: 'Fitness Coach | Health & Wellness',
    price_usd: 150,
    location: { city: 'Miami', region_code: 'FL', country_code: 'US' },
    badges: ['top_creator'],
    image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    name: 'James Chen',
    platform: 'tiktok',
    followers: 1250000,
    followers_short: '1.2m',
    rating: 5.0,
    rating_count: 189,
    tagline: 'Food & Drink Content | Recipe Creator',
    price_usd: 800,
    location: { city: 'Los Angeles', region_code: 'CA', country_code: 'US' },
    badges: ['top_creator', 'responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop'
  },
  {
    id: '6',
    name: 'Michael Torres',
    platform: 'youtube',
    followers: 450000,
    followers_short: '450k',
    rating: 4.7,
    rating_count: 78,
    tagline: 'Gaming Content | Live Streamer',
    price_usd: 300,
    location: { city: 'Austin', region_code: 'TX', country_code: 'US' },
    badges: ['responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop'
  },
  {
    id: '7',
    name: 'Ryan Park',
    platform: 'instagram',
    followers: 320000,
    followers_short: '320k',
    rating: 4.9,
    rating_count: 92,
    tagline: 'Fashion & Lifestyle | Model',
    price_usd: 500,
    location: { city: 'New York', region_code: 'NY', country_code: 'US' },
    badges: ['top_creator'],
    image_url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=300&fit=crop'
  },
  {
    id: '8',
    name: 'David Kim',
    platform: 'tiktok',
    followers: 780000,
    followers_short: '780k',
    rating: 4.8,
    rating_count: 145,
    tagline: 'Comedy Skits | Entertainment',
    price_usd: 600,
    location: { city: 'Seattle', region_code: 'WA', country_code: 'US' },
    badges: ['responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=300&fit=crop'
  },
  {
    id: '9',
    name: 'Chris Anderson',
    platform: 'youtube',
    followers: 2100000,
    followers_short: '2.1m',
    rating: 5.0,
    rating_count: 312,
    tagline: 'Tech Reviews | Product Testing',
    price_usd: 2500,
    location: { city: 'San Francisco', region_code: 'CA', country_code: 'US' },
    badges: ['top_creator', 'responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=400&h=300&fit=crop'
  },
  {
    id: '10',
    name: 'Jordan Smith',
    platform: 'instagram',
    followers: 125000,
    followers_short: '125k',
    rating: 4.6,
    rating_count: 23,
    tagline: 'Travel & Adventure | Photography',
    price_usd: 200,
    location: { city: 'Denver', region_code: 'CO', country_code: 'US' },
    badges: [],
    image_url: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400&h=300&fit=crop'
  },
  {
    id: '11',
    name: 'Marcus Johnson',
    platform: 'tiktok',
    followers: 560000,
    followers_short: '560k',
    rating: 4.9,
    rating_count: 167,
    tagline: 'Dance & Music | Choreography',
    price_usd: 450,
    location: { city: 'Chicago', region_code: 'IL', country_code: 'US' },
    badges: ['top_creator'],
    image_url: 'https://images.unsplash.com/photo-1507984211203-76701d7bb120?w=400&h=300&fit=crop'
  },
  {
    id: '12',
    name: 'Kevin Zhang',
    platform: 'youtube',
    followers: 950000,
    followers_short: '950k',
    rating: 4.8,
    rating_count: 198,
    tagline: 'Education & Business | Entrepreneur',
    price_usd: 1200,
    location: { city: 'Boston', region_code: 'MA', country_code: 'US' },
    badges: ['responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=400&h=300&fit=crop'
  },
  {
    id: '13',
    name: 'Brandon Lee',
    platform: 'instagram',
    followers: 67000,
    followers_short: '67k',
    rating: 4.7,
    rating_count: 18,
    tagline: 'Fitness & Health | Personal Trainer',
    price_usd: 100,
    location: { city: 'Phoenix', region_code: 'AZ', country_code: 'US' },
    badges: [],
    image_url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=300&fit=crop'
  },
  {
    id: '14',
    name: 'Nathan Brown',
    platform: 'tiktok',
    followers: 340000,
    followers_short: '340k',
    rating: 4.9,
    rating_count: 89,
    tagline: 'Comedy & Pranks | Entertainment',
    price_usd: 350,
    location: { city: 'Portland', region_code: 'OR', country_code: 'US' },
    badges: ['responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop'
  },
  {
    id: '15',
    name: 'Tyler Wilson',
    platform: 'youtube',
    followers: 1800000,
    followers_short: '1.8m',
    rating: 5.0,
    rating_count: 276,
    tagline: 'Gaming & Tech | Live Streaming',
    price_usd: 2000,
    location: { city: 'Las Vegas', region_code: 'NV', country_code: 'US' },
    badges: ['top_creator', 'responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop'
  },
  {
    id: '16',
    name: 'Adrian Martinez',
    platform: 'instagram',
    followers: 280000,
    followers_short: '280k',
    rating: 4.8,
    rating_count: 67,
    tagline: 'Fashion & Style | Men\'s Lifestyle',
    price_usd: 400,
    location: { city: 'Houston', region_code: 'TX', country_code: 'US' },
    badges: ['top_creator'],
    image_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=300&fit=crop'
  },
  {
    id: '17',
    name: 'Ethan Davis',
    platform: 'tiktok',
    followers: 890000,
    followers_short: '890k',
    rating: 4.9,
    rating_count: 156,
    tagline: 'Cooking & Recipes | Food Content',
    price_usd: 700,
    location: { city: 'Nashville', region_code: 'TN', country_code: 'US' },
    badges: ['responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
  },
  {
    id: '18',
    name: 'Connor Murphy',
    platform: 'youtube',
    followers: 125000,
    followers_short: '125k',
    rating: 4.6,
    rating_count: 29,
    tagline: 'Automotive Reviews | Car Content',
    price_usd: 180,
    location: { city: 'Detroit', region_code: 'MI', country_code: 'US' },
    badges: [],
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
  },
  {
    id: '19',
    name: 'Lucas Garcia',
    platform: 'instagram',
    followers: 450000,
    followers_short: '450k',
    rating: 4.9,
    rating_count: 134,
    tagline: 'Travel & Photography | Adventure',
    price_usd: 550,
    location: { city: 'San Diego', region_code: 'CA', country_code: 'US' },
    badges: ['top_creator', 'responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop'
  },
  {
    id: '20',
    name: 'Owen Taylor',
    platform: 'tiktok',
    followers: 2100000,
    followers_short: '2.1m',
    rating: 5.0,
    rating_count: 289,
    tagline: 'Comedy & Vlogs | Daily Life',
    price_usd: 2800,
    location: { city: 'Atlanta', region_code: 'GA', country_code: 'US' },
    badges: ['top_creator', 'responds_fast'],
    image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=300&fit=crop'
  }
]

export const platforms = [
  'Any',
  'Instagram',
  'TikTok',
  'User Generated Content',
  'YouTube',
  'Twitter',
  'Twitch',
  'Amazon'
]

export const categories = [
  'Suggested',
  'Popular',
  'Lifestyle',
  'Beauty',
  'Fashion',
  'Travel',
  'Health & Fitness',
  'Food & Drink',
  'Family & Children',
  'Comedy & Entertainment',
  'Art & Photography',
  'Music & Dance',
  'Model',
  'Animals & Pets',
  'Adventure & Outdoors',
  'Entrepreneur & Business',
  'Education',
  'Athlete & Sports',
  'Gaming',
  'Technology',
  'LGBTQ2+',
  'Healthcare',
  'Automotive',
  'Actor',
  'Vegan',
  'Celebrity & Public Figure',
  'Skilled Trades',
  'Cannabis'
]

export const contentTypes = [
  'Livestream',
  'Video',
  'Photo',
  'Product Video',
  'Product Photo',
  'Video Ad',
  'Photo Ad',
  'Tutorial',
  'Testimonial/Review',
  'Unboxing',
  'Blog',
  'Photo Feed Post',
  'Reel',
  'Story',
  'Live',
  'Video Short',
  'Tweet',
  'Thread',
  'Retweet'
]

export const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'India', 'China', 'Japan', 'South Korea', 'Singapore', 'Thailand',
  'Brazil', 'Mexico', 'Argentina', 'Chile', 'South Africa', 'Egypt',
  'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Turkey', 'Russia',
  'Poland', 'Belgium', 'Switzerland', 'Austria', 'Portugal', 'Greece',
  'Ireland', 'New Zealand', 'Philippines', 'Indonesia', 'Malaysia',
  'Vietnam', 'Taiwan', 'Hong Kong'
]

export const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Russian',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
  'Turkish', 'Greek', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian',
  'Malay', 'Tagalog', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian'
]

export const ethnicities = [
  'Caucasian',
  'Hispanic or Latino',
  'Black or African American',
  'Asian/Pacific Islander',
  'Native American or American Indian',
  'Other'
]

