from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from collections import Counter
import math
from datetime import datetime, timedelta


class InfluencerMatcher:
    """AI-based influencer matching using content analysis and ML"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),  # Unigrams and bigrams
            min_df=1,
            max_df=0.95
        )
    
    def find_matches(
        self,
        channels_data: List[Dict[str, Any]],
        brand_keywords: List[str],
        target_audience: Optional[List[str]] = None,
        min_subscribers: Optional[int] = None,
        max_subscribers: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Find best matching influencers based on brand criteria.
        
        Returns sorted list of influencers with match scores.
        """
        if not channels_data or not brand_keywords:
            return []
        
        # Filter by subscriber count if specified
        filtered_channels = self._filter_by_subscribers(
            channels_data,
            min_subscribers,
            max_subscribers
        )
        
        if not filtered_channels:
            return []
        
        # Calculate match scores
        matches = []
        brand_text = ' '.join(brand_keywords).lower()
        
        for channel in filtered_channels:
            score = self._calculate_match_score(
                channel,
                brand_keywords,
                brand_text,
                target_audience
            )
            
            matches.append({
                'channel_id': channel.get('channel_id', ''),
                'title': channel.get('title', ''),
                'description': channel.get('description', ''),
                'subscriber_count': channel.get('subscriber_count', 0),
                'video_count': channel.get('video_count', 0),
                'view_count': channel.get('view_count', 0),
                'thumbnail': channel.get('thumbnail', ''),
                'country': channel.get('country', ''),
                'match_score': round(score, 4),
                'match_breakdown': self._get_match_breakdown(
                    channel,
                    brand_keywords,
                    target_audience
                )
            })
        
        # Sort by match score (descending)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matches
    
    def _filter_by_subscribers(
        self,
        channels: List[Dict[str, Any]],
        min_subscribers: Optional[int],
        max_subscribers: Optional[int]
    ) -> List[Dict[str, Any]]:
        """Filter channels by subscriber count"""
        filtered = []
        
        for channel in channels:
            sub_count = channel.get('subscriber_count', 0)
            
            if min_subscribers and sub_count < min_subscribers:
                continue
            if max_subscribers and sub_count > max_subscribers:
                continue
            
            filtered.append(channel)
        
        return filtered
    
    def _calculate_match_score(
        self,
        channel: Dict[str, Any],
        brand_keywords: List[str],
        brand_text: str,
        target_audience: Optional[List[str]]
    ) -> float:
        """Calculate overall match score - SUBSCRIBER COUNT NEUTRAL"""
        scores = []
        
        # 1. Content relevance (TF-IDF similarity) - 35% weight (most important)
        content_score = self._calculate_content_relevance(channel, brand_text)
        scores.append(('content_relevance', content_score * 0.35))
        
        # 2. Keyword matching - 30% weight (very important for relevance)
        keyword_score = self._calculate_keyword_match(channel, brand_keywords)
        scores.append(('keyword_match', keyword_score * 0.30))
        
        # 3. Engagement quality - 20% weight (engagement rate, not size)
        engagement_score = self._calculate_engagement_score(channel)
        scores.append(('engagement', engagement_score * 0.20))
        
        # 4. Audience fit (if target audience specified) - 10% weight
        if target_audience:
            audience_score = self._calculate_audience_fit(channel, target_audience)
            scores.append(('audience_fit', audience_score * 0.10))
        else:
            scores.append(('audience_fit', 0.5 * 0.10))  # Neutral score
        
        # 5. Channel authority - 5% weight (consistency/activity, NOT subscriber count)
        authority_score = self._calculate_authority_score(channel)
        scores.append(('authority', authority_score * 0.05))
        
        # Calculate weighted sum
        total_score = sum(score for _, score in scores)
        
        return min(total_score, 1.0)  # Cap at 1.0
    
    def _calculate_content_relevance(
        self,
        channel: Dict[str, Any],
        brand_text: str
    ) -> float:
        """Calculate content relevance using TF-IDF"""
        try:
            # Combine channel description and video titles/descriptions
            channel_text = channel.get('description', '').lower()
            
            # Add video titles
            for video in channel.get('recent_videos', [])[:10]:
                channel_text += ' ' + video.get('title', '').lower()
                channel_text += ' ' + video.get('description', '').lower()
            
            if not channel_text.strip() or not brand_text.strip():
                return 0.0
            
            # Create TF-IDF vectors
            texts = [channel_text, brand_text]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return float(similarity)
        except Exception as e:
            print(f"Error calculating content relevance: {e}")
            return 0.0
    
    def _calculate_keyword_match(
        self,
        channel: Dict[str, Any],
        brand_keywords: List[str]
    ) -> float:
        """Calculate keyword overlap score"""
        # Extract keywords from channel
        channel_keywords = set()
        
        # Add explicit keywords
        if channel.get('keywords'):
            channel_keywords.update(k.lower() for k in channel['keywords'])
        
        # Extract from description
        description = channel.get('description', '').lower()
        words = description.split()
        channel_keywords.update(word.strip('.,!?;:()[]{}"\'') for word in words if len(word) > 3)
        
        # Extract from video titles
        for video in channel.get('recent_videos', []):
            title = video.get('title', '').lower()
            words = title.split()
            channel_keywords.update(word.strip('.,!?;:()[]{}"\'') for word in words if len(word) > 3)
        
        # Calculate overlap
        brand_keywords_lower = set(k.lower() for k in brand_keywords)
        overlap = len(channel_keywords & brand_keywords_lower)
        
        # Normalize by number of brand keywords
        if not brand_keywords_lower:
            return 0.0
        
        return min(overlap / len(brand_keywords_lower), 1.0)
    
    def _calculate_engagement_score(self, channel: Dict[str, Any]) -> float:
        """Calculate engagement quality score - SUBSCRIBER COUNT NEUTRAL"""
        subscriber_count = channel.get('subscriber_count', 0)
        view_count = channel.get('view_count', 0)
        video_count = channel.get('video_count', 0)
        
        if video_count == 0:
            return 0.0
        
        videos = channel.get('recent_videos', [])
        if not videos:
            return 0.0
        
        # Calculate engagement metrics from recent videos (not subscriber count)
        total_likes = sum(v.get('like_count', 0) for v in videos)
        total_comments = sum(v.get('comment_count', 0) for v in videos)
        total_views = sum(v.get('view_count', 0) for v in videos)
        
        if total_views == 0:
            return 0.0
        
        # Engagement rates (subscriber-agnostic)
        like_rate = total_likes / total_views  # Likes per view
        comment_rate = total_comments / total_views  # Comments per view
        
        # Normalize: good engagement is 0.01-0.05 like rate, 0.001-0.005 comment rate
        like_score = min(like_rate / 0.05, 1.0) * 2  # Cap at 2x multiplier
        comment_score = min(comment_rate / 0.005, 1.0) * 2
        
        # Video consistency: more videos = more active (but cap benefit)
        consistency_score = min(video_count / 100, 1.0)  # 100+ videos = max
        
        # Average engagement per video (higher is better)
        avg_engagement = (total_likes + total_comments * 10) / len(videos)  # Comments weighted 10x
        avg_engagement_score = min(math.log10(avg_engagement + 1) / 4, 1.0)  # Log scale
        
        # Combine: 40% like rate, 30% comment rate, 15% consistency, 15% avg engagement
        return min(
            like_score * 0.4 + 
            comment_score * 0.3 + 
            consistency_score * 0.15 + 
            avg_engagement_score * 0.15,
            1.0
        )
    
    def _calculate_audience_fit(
        self,
        channel: Dict[str, Any],
        target_audience: List[str]
    ) -> float:
        """Calculate how well channel matches target audience"""
        # This is a simplified version
        # In a real implementation, you might analyze:
        # - Video comments for audience demographics
        # - Content themes
        # - Geographic location
        
        channel_text = channel.get('description', '').lower()
        channel_text += ' ' + ' '.join(channel.get('keywords', [])).lower()
        
        # Check if target audience keywords appear in channel content
        matches = sum(1 for audience_term in target_audience 
                     if audience_term.lower() in channel_text)
        
        return min(matches / len(target_audience), 1.0) if target_audience else 0.5
    
    def _calculate_authority_score(self, channel: Dict[str, Any]) -> float:
        """Calculate channel authority - NO SUBSCRIBER COUNT BIAS"""
        video_count = channel.get('video_count', 0)
        view_count = channel.get('view_count', 0)
        videos = channel.get('recent_videos', [])
        
        # Authority based on activity and consistency, NOT size
        # 1. Video count (consistency) - more videos = more established
        if video_count > 0:
            video_score = min(math.log10(video_count + 1) / 3, 1.0)  # 1000+ videos = max
        else:
            video_score = 0
        
        # 2. Recent activity (recent video uploads)
        if videos:
            # Check if videos are recent (within last 6 months ideally)
            recent_threshold = datetime.now() - timedelta(days=180)
            recent_count = 0
            for v in videos[:10]:
                try:
                    pub_date = datetime.fromisoformat(v.get('published_at', '').replace('Z', '+00:00'))
                    if pub_date.replace(tzinfo=None) > recent_threshold:
                        recent_count += 1
                except:
                    pass
            activity_score = min(recent_count / 10, 1.0)
        else:
            activity_score = 0
        
        # 3. Content quality signals (views per video stability)
        if videos and len(videos) > 0:
            view_counts = [v.get('view_count', 0) for v in videos if v.get('view_count', 0) > 0]
            if view_counts:
                avg_views = sum(view_counts) / len(view_counts)
                # Consistency: lower variance = more reliable
                if len(view_counts) > 1:
                    variance = sum((x - avg_views) ** 2 for x in view_counts) / len(view_counts)
                    std_dev = math.sqrt(variance)
                    consistency = 1.0 - min(std_dev / (avg_views + 1), 1.0)  # Lower variance = higher score
                else:
                    consistency = 0.5
                quality_score = min(math.log10(avg_views + 1) / 6, 1.0) * consistency
            else:
                quality_score = 0
        else:
            quality_score = 0
        
        # Combine: 40% video count, 30% activity, 30% quality (NO subscriber bias)
        return min(video_score * 0.4 + activity_score * 0.3 + quality_score * 0.3, 1.0)
    
    def _get_match_breakdown(
        self,
        channel: Dict[str, Any],
        brand_keywords: List[str],
        target_audience: Optional[List[str]]
    ) -> Dict[str, float]:
        """Get detailed breakdown of match scores"""
        brand_text = ' '.join(brand_keywords).lower()
        
        return {
            'content_relevance': round(self._calculate_content_relevance(channel, brand_text), 3),
            'keyword_match': round(self._calculate_keyword_match(channel, brand_keywords), 3),
            'engagement': round(self._calculate_engagement_score(channel), 3),
            'audience_fit': round(
                self._calculate_audience_fit(channel, target_audience) if target_audience else 0.5,
                3
            ),
            'authority': round(self._calculate_authority_score(channel), 3)
        }

