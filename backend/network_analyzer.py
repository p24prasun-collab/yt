import networkx as nx
from typing import List, Dict, Any, Optional
import json
from collections import Counter
import math


class NetworkAnalyzer:
    """Builds and analyzes network graphs from influencer data"""
    
    def __init__(self):
        self.graph = nx.Graph()
    
    def build_network(self, channels_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Build network graph from channel data.
        Creates connections based on:
        - Similar content (keywords, topics)
        - Similar subscriber counts
        - Geographic proximity
        - Video collaborations (if detectable)
        """
        # Create a new graph
        G = nx.Graph()
        
        # Add nodes (influencers)
        for channel in channels_data:
            channel_id = channel.get('channel_id', '')
            if not channel_id:
                continue
            
            # Calculate engagement rate (views per subscriber)
            subscriber_count = channel.get('subscriber_count', 0)
            view_count = channel.get('view_count', 0)
            engagement_rate = (view_count / subscriber_count) if subscriber_count > 0 else 0
            
            # Extract keywords from description and videos
            all_keywords = self._extract_keywords(channel)
            
            G.add_node(
                channel_id,
                title=channel.get('title', ''),
                subscriber_count=subscriber_count,
                video_count=channel.get('video_count', 0),
                view_count=view_count,
                engagement_rate=engagement_rate,
                country=channel.get('country', ''),
                keywords=all_keywords,
                topic_categories=channel.get('topic_categories', []),
                thumbnail=channel.get('thumbnail', ''),
                description=channel.get('description', '')
            )
        
        # Add edges (connections)
        channel_list = list(G.nodes(data=True))
        
        for i, (node1, data1) in enumerate(channel_list):
            for j, (node2, data2) in enumerate(channel_list[i+1:], start=i+1):
                weight = self._calculate_similarity(data1, data2)
                
                # Only add edge if similarity is above threshold
                if weight > 0.1:  # Threshold for connection
                    G.add_edge(node1, node2, weight=weight, similarity=weight)
        
        self.graph = G
        
        # Calculate network metrics
        metrics = self._calculate_network_metrics(G)
        
        # Convert to JSON-serializable format for API response
        network_data = self._graph_to_dict(G)
        
        return {
            'nodes': network_data['nodes'],
            'edges': network_data['edges'],
            'metrics': metrics,
            'statistics': {
                'total_nodes': G.number_of_nodes(),
                'total_edges': G.number_of_edges(),
                'density': nx.density(G)
            }
        }
    
    def _extract_keywords(self, channel: Dict[str, Any]) -> List[str]:
        """Extract keywords from channel data"""
        keywords = set()
        
        # Add explicit keywords
        if channel.get('keywords'):
            keywords.update(channel['keywords'])
        
        # Extract from description (simple word extraction)
        description = channel.get('description', '').lower()
        # Common words to ignore
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'just', 'should', 'now'}
        
        # Simple keyword extraction (can be improved with NLP)
        words = description.split()
        for word in words:
            # Remove punctuation and check length
            word = word.strip('.,!?;:()[]{}"\'').lower()
            if len(word) > 3 and word not in stop_words:
                keywords.add(word)
        
        # Extract from video titles
        for video in channel.get('recent_videos', []):
            title = video.get('title', '').lower()
            words = title.split()
            for word in words:
                word = word.strip('.,!?;:()[]{}"\'').lower()
                if len(word) > 3 and word not in stop_words:
                    keywords.add(word)
        
        return list(keywords)[:20]  # Limit to top 20 keywords
    
    def _calculate_similarity(self, data1: Dict[str, Any], data2: Dict[str, Any]) -> float:
        """Calculate similarity score between two channels"""
        similarity_scores = []
        
        # 1. Keyword overlap (Jaccard similarity)
        keywords1 = set(data1.get('keywords', []))
        keywords2 = set(data2.get('keywords', []))
        if keywords1 or keywords2:
            keyword_sim = len(keywords1 & keywords2) / len(keywords1 | keywords2) if (keywords1 | keywords2) else 0
            similarity_scores.append(keyword_sim * 0.4)  # 40% weight
        
        # 2. Topic category overlap
        topics1 = set(data1.get('topic_categories', []))
        topics2 = set(data2.get('topic_categories', []))
        if topics1 or topics2:
            topic_sim = len(topics1 & topics2) / len(topics1 | topics2) if (topics1 | topics2) else 0
            similarity_scores.append(topic_sim * 0.3)  # 30% weight
        
        # 3. Subscriber count similarity (logarithmic scale)
        sub1 = data1.get('subscriber_count', 0)
        sub2 = data2.get('subscriber_count', 0)
        if sub1 > 0 and sub2 > 0:
            # Use logarithmic scale for better comparison
            log_sub1 = math.log10(sub1 + 1)
            log_sub2 = math.log10(sub2 + 1)
            sub_diff = abs(log_sub1 - log_sub2) / max(log_sub1, log_sub2)
            sub_sim = 1 - min(sub_diff, 1.0)
            similarity_scores.append(sub_sim * 0.2)  # 20% weight
        
        # 4. Geographic similarity
        country1 = data1.get('country', '')
        country2 = data2.get('country', '')
        if country1 and country2:
            geo_sim = 1.0 if country1 == country2 else 0.0
            similarity_scores.append(geo_sim * 0.1)  # 10% weight
        
        # Return weighted average
        return sum(similarity_scores) if similarity_scores else 0.0
    
    def _calculate_network_metrics(self, G: nx.Graph) -> Dict[str, Any]:
        """Calculate network analysis metrics"""
        if G.number_of_nodes() == 0:
            return {}
        
        metrics = {}
        
        # Centrality measures
        try:
            degree_centrality = nx.degree_centrality(G)
            metrics['degree_centrality'] = {
                node: round(value, 4) 
                for node, value in sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)[:10]
            }
        except:
            pass
        
        try:
            betweenness_centrality = nx.betweenness_centrality(G)
            metrics['betweenness_centrality'] = {
                node: round(value, 4) 
                for node, value in sorted(betweenness_centrality.items(), key=lambda x: x[1], reverse=True)[:10]
            }
        except:
            pass
        
        try:
            # PageRank for influence ranking
            pagerank = nx.pagerank(G)
            metrics['pagerank'] = {
                node: round(value, 4) 
                for node, value in sorted(pagerank.items(), key=lambda x: x[1], reverse=True)[:10]
            }
        except:
            pass
        
        # Community detection
        try:
            communities = nx.community.greedy_modularity_communities(G)
            metrics['communities'] = {
                f'community_{i}': list(comm) 
                for i, comm in enumerate(communities[:10])
            }
        except:
            pass
        
        return metrics
    
    def _graph_to_dict(self, G: nx.Graph) -> Dict[str, Any]:
        """Convert NetworkX graph to dictionary for JSON serialization"""
        nodes = []
        edges = []
        
        for node, data in G.nodes(data=True):
            nodes.append({
                'id': node,
                **{k: v for k, v in data.items() if k != 'keywords' or isinstance(v, list)}
            })
            # Handle keywords separately for JSON serialization
            if 'keywords' in data:
                nodes[-1]['keywords'] = data['keywords']
        
        for source, target, data in G.edges(data=True):
            edges.append({
                'source': source,
                'target': target,
                'weight': round(data.get('weight', 0), 4),
                'similarity': round(data.get('similarity', 0), 4)
            })
        
        return {'nodes': nodes, 'edges': edges}
    
    def export_to_gexf(self, filepath: str) -> bool:
        """Export graph to GEXF format for Gephi"""
        try:
            nx.write_gexf(self.graph, filepath)
            return True
        except Exception as e:
            print(f"Error exporting to GEXF: {e}")
            return False
    
    def export_to_graphml(self, filepath: str) -> bool:
        """Export graph to GraphML format (also Gephi-compatible)"""
        try:
            nx.write_graphml(self.graph, filepath)
            return True
        except Exception as e:
            print(f"Error exporting to GraphML: {e}")
            return False
    
    def get_network_statistics(self) -> Dict[str, Any]:
        """Get comprehensive network statistics"""
        if self.graph.number_of_nodes() == 0:
            return {}
        
        return {
            'nodes': self.graph.number_of_nodes(),
            'edges': self.graph.number_of_edges(),
            'density': round(nx.density(self.graph), 4),
            'average_clustering': round(nx.average_clustering(self.graph), 4),
            'is_connected': nx.is_connected(self.graph),
            'number_of_components': nx.number_connected_components(self.graph)
        }

