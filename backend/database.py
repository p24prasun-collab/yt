import sqlite3
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import os


class Database:
    """SQLite database for caching influencer data"""
    
    def __init__(self, db_path: str = "gaim_database.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Influencers table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS influencers (
                channel_id TEXT PRIMARY KEY,
                platform TEXT DEFAULT 'youtube',
                title TEXT,
                description TEXT,
                subscriber_count INTEGER,
                video_count INTEGER,
                view_count INTEGER,
                country TEXT,
                custom_url TEXT,
                thumbnail TEXT,
                keywords TEXT,
                topic_categories TEXT,
                engagement_rate REAL,
                last_updated TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Videos table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                video_id TEXT PRIMARY KEY,
                channel_id TEXT,
                title TEXT,
                description TEXT,
                view_count INTEGER,
                like_count INTEGER,
                comment_count INTEGER,
                published_at TEXT,
                thumbnail TEXT,
                FOREIGN KEY (channel_id) REFERENCES influencers(channel_id)
            )
        ''')

        # Comments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT,
                author TEXT,
                author_channel_id TEXT,
                text TEXT,
                like_count INTEGER,
                published_at TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES videos(video_id)
            )
        ''')
        
        # Network edges table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS network_edges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id TEXT,
                target_id TEXT,
                connection_type TEXT,
                weight REAL,
                similarity REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES influencers(channel_id),
                FOREIGN KEY (target_id) REFERENCES influencers(channel_id),
                UNIQUE(source_id, target_id)
            )
        ''')
        
        # Brand matches table (for caching match results)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS brand_matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand_keywords TEXT,
                target_audience TEXT,
                channel_id TEXT,
                match_score REAL,
                match_breakdown TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES influencers(channel_id)
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_influencers_subscribers 
            ON influencers(subscriber_count)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_influencers_country 
            ON influencers(country)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_videos_channel 
            ON videos(channel_id)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_comments_video 
            ON comments(video_id)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_edges_source 
            ON network_edges(source_id)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_edges_target 
            ON network_edges(target_id)
        ''')
        
        conn.commit()
        conn.close()
    
    def save_influencer(self, channel_data: Dict[str, Any]) -> bool:
        """Save or update influencer data"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Calculate engagement rate
            subscriber_count = channel_data.get('subscriber_count', 0)
            view_count = channel_data.get('view_count', 0)
            engagement_rate = (view_count / subscriber_count) if subscriber_count > 0 else 0
            
            cursor.execute('''
                INSERT OR REPLACE INTO influencers (
                    channel_id, platform, title, description, subscriber_count,
                    video_count, view_count, country, custom_url, thumbnail,
                    keywords, topic_categories, engagement_rate, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                channel_data.get('channel_id', ''),
                'youtube',
                channel_data.get('title', ''),
                channel_data.get('description', ''),
                subscriber_count,
                channel_data.get('video_count', 0),
                view_count,
                channel_data.get('country', ''),
                channel_data.get('custom_url', ''),
                channel_data.get('thumbnail', ''),
                json.dumps(channel_data.get('keywords', [])),
                json.dumps(channel_data.get('topic_categories', [])),
                engagement_rate,
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error saving influencer: {e}")
            return False
    
    def save_influencers_batch(self, channels_data: List[Dict[str, Any]]) -> int:
        """Save multiple influencers in batch"""
        saved_count = 0
        for channel in channels_data:
            if self.save_influencer(channel):
                saved_count += 1
                # Save videos too
                self.save_videos(channel.get('channel_id', ''), channel.get('recent_videos', []))
        return saved_count
    
    def save_videos(self, channel_id: str, videos: List[Dict[str, Any]]):
        """Save videos for a channel"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for video in videos:
                cursor.execute('''
                    INSERT OR REPLACE INTO videos (
                        video_id, channel_id, title, description,
                        view_count, like_count, comment_count,
                        published_at, thumbnail
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    video.get('video_id', ''),
                    channel_id,
                    video.get('title', ''),
                    video.get('description', ''),
                    video.get('view_count', 0),
                    video.get('like_count', 0),
                    video.get('comment_count', 0),
                    video.get('published_at', ''),
                    video.get('thumbnail', '')
                ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving videos: {e}")

    def save_comments(self, video_id: str, comments: List[Dict[str, Any]]):
        """Save comments for a video"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            for comment in comments:
                cursor.execute('''
                    INSERT INTO comments (
                        video_id, author, author_channel_id, text, like_count, published_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    video_id,
                    comment.get('author', ''),
                    comment.get('author_channel_id', ''),
                    comment.get('text', ''),
                    comment.get('like_count', 0),
                    comment.get('published_at', '')
                ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving comments: {e}")
    
    def get_influencer(self, channel_id: str) -> Optional[Dict[str, Any]]:
        """Get influencer by channel ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM influencers WHERE channel_id = ?', (channel_id,))
            row = cursor.fetchone()
            
            if row:
                data = dict(row)
                # Parse JSON fields
                data['keywords'] = json.loads(data.get('keywords', '[]'))
                data['topic_categories'] = json.loads(data.get('topic_categories', '[]'))
                # Get videos
                data['recent_videos'] = self.get_channel_videos(channel_id)
                conn.close()
                return data
            
            conn.close()
            return None
        except Exception as e:
            print(f"Error getting influencer: {e}")
            return None
    
    def get_channel_videos(self, channel_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get videos for a channel"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM videos 
                WHERE channel_id = ? 
                ORDER BY published_at DESC 
                LIMIT ?
            ''', (channel_id, limit))
            
            videos = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return videos
        except Exception as e:
            print(f"Error getting videos: {e}")
            return []
    
    def search_influencers(
        self,
        min_subscribers: Optional[int] = None,
        max_subscribers: Optional[int] = None,
        country: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Search influencers with filters"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = 'SELECT * FROM influencers WHERE 1=1'
            params = []
            
            if min_subscribers:
                query += ' AND subscriber_count >= ?'
                params.append(min_subscribers)
            
            if max_subscribers:
                query += ' AND subscriber_count <= ?'
                params.append(max_subscribers)
            
            if country:
                query += ' AND country = ?'
                params.append(country)
            
            query += ' ORDER BY subscriber_count DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            influencers = []
            for row in rows:
                data = dict(row)
                data['keywords'] = json.loads(data.get('keywords', '[]'))
                data['topic_categories'] = json.loads(data.get('topic_categories', '[]'))
                influencers.append(data)
            
            conn.close()
            return influencers
        except Exception as e:
            print(f"Error searching influencers: {e}")
            return []
    
    def save_network_edge(
        self,
        source_id: str,
        target_id: str,
        weight: float,
        connection_type: str = 'similarity'
    ):
        """Save network edge"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO network_edges 
                (source_id, target_id, connection_type, weight, similarity)
                VALUES (?, ?, ?, ?, ?)
            ''', (source_id, target_id, connection_type, weight, weight))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving network edge: {e}")
    
    def get_network_edges(self, channel_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get network edges, optionally filtered by channel"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            if channel_id:
                cursor.execute('''
                    SELECT * FROM network_edges 
                    WHERE source_id = ? OR target_id = ?
                ''', (channel_id, channel_id))
            else:
                cursor.execute('SELECT * FROM network_edges')
            
            edges = [dict(row) for row in cursor.fetchall()]
            conn.close()
            return edges
        except Exception as e:
            print(f"Error getting network edges: {e}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            stats = {}
            
            # Count influencers
            cursor.execute('SELECT COUNT(*) FROM influencers')
            stats['total_influencers'] = cursor.fetchone()[0]
            
            # Count videos
            cursor.execute('SELECT COUNT(*) FROM videos')
            stats['total_videos'] = cursor.fetchone()[0]
            
            # Count edges
            cursor.execute('SELECT COUNT(*) FROM network_edges')
            stats['total_edges'] = cursor.fetchone()[0]
            
            # Average subscribers
            cursor.execute('SELECT AVG(subscriber_count) FROM influencers')
            avg_subs = cursor.fetchone()[0]
            stats['average_subscribers'] = round(avg_subs, 0) if avg_subs else 0
            
            conn.close()
            return stats
        except Exception as e:
            print(f"Error getting statistics: {e}")
            return {}

