import os
import aiohttp
from typing import List, Dict, Any, Optional
import asyncio


class YouTubeAPI:
    """YouTube Data API v3 client for fetching channel and video data"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/youtube/v3"
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make async request to YouTube API"""
        session = await self._get_session()
        params['key'] = self.api_key
        
        async with session.get(f"{self.base_url}/{endpoint}", params=params) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"YouTube API error: {response.status} - {error_text}")
            return await response.json()
    
    async def search_channels(self, query: str, max_results: int = 10, region_code: str = 'IN') -> List[Dict[str, Any]]:
        """Search for YouTube channels by query"""
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'channel',
            'maxResults': min(max_results, 50),  # YouTube API limit
            'order': 'relevance',
            'regionCode': region_code
        }
        
        response = await self._make_request('search', params)
        
        channels = []
        for item in response.get('items', []):
            channel_id = item['id']['channelId']
            snippet = item['snippet']
            
            channels.append({
                'channel_id': channel_id,
                'title': snippet['title'],
                'description': snippet.get('description', ''),
                'thumbnail': snippet['thumbnails'].get('medium', {}).get('url', ''),
                'published_at': snippet.get('publishedAt', '')
            })
        
        return channels
    
    async def get_channels_details(self, channel_ids: List[str]) -> List[Dict[str, Any]]:
        """Get detailed information for multiple channels"""
        if not channel_ids:
            return []
        
        # YouTube API allows up to 50 channels per request
        all_channels = []
        for i in range(0, len(channel_ids), 50):
            batch = channel_ids[i:i+50]
            params = {
                'part': 'snippet,statistics,contentDetails,brandingSettings',
                'id': ','.join(batch)
            }
            
            response = await self._make_request('channels', params)
            
            for item in response.get('items', []):
                snippet = item.get('snippet', {})
                stats = item.get('statistics', {})
                branding = item.get('brandingSettings', {})
                
                channel_data = {
                    'channel_id': item['id'],
                    'title': snippet.get('title', ''),
                    'description': snippet.get('description', ''),
                    'thumbnail': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                    'published_at': snippet.get('publishedAt', ''),
                    'country': snippet.get('country', ''),
                    'custom_url': snippet.get('customUrl', ''),
                    'subscriber_count': int(stats.get('subscriberCount', 0)),
                    'video_count': int(stats.get('videoCount', 0)),
                    'view_count': int(stats.get('viewCount', 0)),
                    'keywords': snippet.get('keywords', '').split(' ') if snippet.get('keywords') else [],
                    'topic_categories': snippet.get('topicCategories', []),
                }
                
                # Get recent videos for better analysis
                recent_videos = await self.get_channel_videos(item['id'], max_results=5)
                channel_data['recent_videos'] = recent_videos
                
                all_channels.append(channel_data)
        
        return all_channels
    
    async def get_channel_videos(self, channel_id: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Get recent videos from a channel"""
        try:
            # First, get the uploads playlist ID
            params = {
                'part': 'contentDetails',
                'id': channel_id
            }
            channel_response = await self._make_request('channels', params)
            
            if not channel_response.get('items'):
                return []
            
            uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            
            # Get videos from the uploads playlist
            params = {
                'part': 'snippet,contentDetails',
                'playlistId': uploads_playlist_id,
                'maxResults': min(max_results, 50)
            }
            videos_response = await self._make_request('playlistItems', params)
            
            videos = []
            for item in videos_response.get('items', []):
                snippet = item.get('snippet', {})
                video_id = snippet.get('resourceId', {}).get('videoId')
                
                if video_id:
                    # Get video statistics
                    video_stats = await self.get_video_details(video_id)
                    videos.append({
                        'video_id': video_id,
                        'title': snippet.get('title', ''),
                        'description': snippet.get('description', ''),
                        'published_at': snippet.get('publishedAt', ''),
                        'thumbnail': snippet.get('thumbnails', {}).get('medium', {}).get('url', ''),
                        'view_count': video_stats.get('view_count', 0),
                        'like_count': video_stats.get('like_count', 0),
                        'comment_count': video_stats.get('comment_count', 0)
                    })
            
            return videos
        except Exception as e:
            print(f"Error fetching videos for channel {channel_id}: {e}")
            return []
    
    async def get_video_details(self, video_id: str) -> Dict[str, Any]:
        """Get details for a specific video"""
        params = {
            'part': 'statistics',
            'id': video_id
        }
        
        response = await self._make_request('videos', params)
        
        if response.get('items'):
            stats = response['items'][0].get('statistics', {})
            return {
                'view_count': int(stats.get('viewCount', 0)),
                'like_count': int(stats.get('likeCount', 0)),
                'comment_count': int(stats.get('commentCount', 0))
            }
        return {}

    async def search_videos(self, query: str, max_results: int = 10, order: str = 'relevance', region_code: str = 'IN', language: str = 'English', video_duration: str = 'any') -> List[Dict[str, Any]]:
        """Search for YouTube videos by query and return basic info with stats - with language and duration filtering"""
        
        # Map language to YouTube language codes
        language_codes = {
            'English': 'en',
            'Hindi': 'hi',
            'Tamil': 'ta',
            'Telugu': 'te',
            'Kannada': 'kn',
            'Malayalam': 'ml',
            'Bengali': 'bn',
            'Marathi': 'mr',
            'Gujarati': 'gu',
            'Punjabi': 'pa',
            'Hinglish': 'en'  # Hinglish uses English code but searches in India region
        }
        
        relevance_language = language_codes.get(language, 'en')
        
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': min(max_results, 50),
            'order': order,
            'regionCode': region_code,  # Set to India by default
            'relevanceLanguage': relevance_language,  # Language-specific filtering
        }
        
        # Add duration filter if specified
        # YouTube API supports: 'short' (< 4 min), 'medium' (4-20 min), 'long' (> 20 min), 'any'
        if video_duration in ['short', 'medium', 'long', 'any']:
            if video_duration != 'any':
                params['videoDuration'] = video_duration
        
        response = await self._make_request('search', params)

        videos: List[Dict[str, Any]] = []
        for item in response.get('items', []):
            video_id = item['id']['videoId']
            snippet = item['snippet']
            stats = await self.get_video_details(video_id)
            
            # Get high quality thumbnail if available
            thumbnails = snippet.get('thumbnails', {})
            thumbnail_url = (
                thumbnails.get('high', {}).get('url', '') or
                thumbnails.get('medium', {}).get('url', '') or
                thumbnails.get('default', {}).get('url', '')
            )
            
            videos.append({
                'video_id': video_id,
                'title': snippet.get('title', ''),
                'description': snippet.get('description', ''),
                'published_at': snippet.get('publishedAt', ''),
                'thumbnail': thumbnail_url,
                'channel_id': snippet.get('channelId', ''),
                'channel_title': snippet.get('channelTitle', ''),
                **stats
            })
        return videos

    async def get_video_comments(self, video_id: str, max_results: int = 100) -> List[Dict[str, Any]]:
        """Fetch top-level comments for a video (basic fields)"""
        params = {
            'part': 'snippet',
            'videoId': video_id,
            'maxResults': min(max_results, 100),
            'order': 'relevance',
            'textFormat': 'plainText'
        }
        try:
            response = await self._make_request('commentThreads', params)
            comments: List[Dict[str, Any]] = []
            for item in response.get('items', []):
                top = item.get('snippet', {}).get('topLevelComment', {}).get('snippet', {})
                if top:
                    comments.append({
                        'author': top.get('authorDisplayName', ''),
                        'author_channel_id': top.get('authorChannelId', {}).get('value', ''),
                        'text': top.get('textDisplay', ''),
                        'like_count': int(top.get('likeCount', 0)),
                        'published_at': top.get('publishedAt', '')
                    })
            return comments
        except Exception as e:
            print(f"Error fetching comments for video {video_id}: {e}")
            return []
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()


