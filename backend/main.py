from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from youtube_api import YouTubeAPI
from network_analyzer import NetworkAnalyzer
from matcher import InfluencerMatcher
from database import Database
from llm import KeywordLLM

load_dotenv()

app = FastAPI(title="GAIM - YouTube Influencer Matching API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
youtube_api = YouTubeAPI(api_key=os.getenv("YOUTUBE_API_KEY"))
network_analyzer = NetworkAnalyzer()
matcher = InfluencerMatcher()
database = Database()
llm = KeywordLLM(api_key=os.getenv("GEMINI_API_KEY"))


class KeywordExpandRequest(BaseModel):
    campaign_text: str
    seed_keywords: List[str] = []
    max_related_per_keyword: int = 5
    languages: List[str] = ['English']


class SearchTopVideosRequest(BaseModel):
    keywords: List[str]
    top_videos_per_keyword: int = 5
    order: str = 'viewCount'
    video_duration: str = 'any'  # short|medium|long|any
    languages: List[str] = ['English']


class SelectInfluencersRequest(BaseModel):
    campaign_text: str
    seed_keywords: List[str] = []
    keywords: Optional[List[str]] = None
    top_videos_per_keyword: int = 10
    past_videos_to_check: int = 5
    top_n: int = 20
    use_network: bool = True
    max_comments_per_video: int = 50


@app.post('/api/expand-keywords')
async def expand_keywords(request: KeywordExpandRequest):
    """Generate keywords using AI or fallback to text analysis"""
    try:
        all_llm_keywords: List[str] = []
        
        # Try Gemini AI first
        if llm and llm.enabled:
            for language in request.languages:
                try:
                    llm_keywords = llm.expand_keywords(
                        request.campaign_text,
                        request.seed_keywords,
                        max_keywords=max(5, 30 // max(len(request.languages), 1)),
                        language=language
                    )
                    all_llm_keywords.extend(llm_keywords)
                except Exception as e:
                    print(f"LLM error for {language}: {e}")
                    continue
        
        # Fallback if AI fails
        if not all_llm_keywords:
            base_tokens = set()
            for token in (request.campaign_text or '').lower().split():
                token = token.strip('.,!?:;"\'()')
                if len(token) >= 4:
                    base_tokens.add(token)
            all_llm_keywords = list(set(request.seed_keywords) | base_tokens)[:30]
        
        return JSONResponse(content={
            'suggested_keywords': all_llm_keywords,
            'languages': request.languages,
            'method': 'gemini_ai' if (llm and llm.enabled) else 'fallback'
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/search-top-videos')
async def search_top_videos(request: SearchTopVideosRequest):
    """Search for top videos with quota conservation"""
    try:
        # Quota conservation settings
        max_search_calls = int(os.getenv('YT_MAX_SEARCH_CALLS_PER_REQUEST', '25'))
        max_langs = int(os.getenv('YT_MAX_LANGUAGES_PER_KEYWORD', '1'))
        
        languages = (request.languages or ['English'])[:max_langs]
        search_calls = 0
        limited = False
        
        results: Dict[str, List[Dict[str, Any]]] = {}
        
        for kw in request.keywords[:20]:  # Limit keywords too
            if search_calls >= max_search_calls:
                limited = True
                break
            
            keyword_videos: List[Dict[str, Any]] = []
            
            for lang in languages:
                if search_calls >= max_search_calls:
                    limited = True
                    break
                
                try:
                    vids = await youtube_api.search_videos(
                        kw,
                        max_results=request.top_videos_per_keyword,
                        order=request.order,
                        region_code='IN',
                        language=lang,
                        video_duration=request.video_duration
                    )
                    search_calls += 1
                    keyword_videos.extend(vids)
                    
                    # Cache videos
                    for v in vids:
                        cid = v.get('channel_id')
                        if cid:
                            database.save_videos(cid, [v])
                
                except Exception as api_error:
                    txt = str(api_error)
                    if 'quotaExceeded' in txt or '403' in txt:
                        return JSONResponse(status_code=429, content={
                            'error': 'quota_exceeded',
                            'message': 'YouTube API quota exceeded. Try after midnight PT or rotate key.',
                            'partial_results': results,
                            'search_calls': search_calls
                        })
                    raise
            
            results[kw] = keyword_videos
        
        return JSONResponse(content={
            'results': results,
            'limited': limited,
            'search_calls': search_calls,
            'languages_used': languages
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/select-influencers')
async def select_influencers(request: SelectInfluencersRequest):
    """Find and rank influencers based on campaign requirements"""
    try:
        # Get keywords if not provided
        if not request.keywords:
            expand_resp = await expand_keywords(KeywordExpandRequest(
                campaign_text=request.campaign_text,
                seed_keywords=request.seed_keywords
            ))
            if hasattr(expand_resp, 'body'):
                import json
                request.keywords = json.loads(expand_resp.body.decode('utf-8')).get('suggested_keywords', [])
        
        keywords = request.keywords[:40]  # Limit keywords
        
        # Track channel hits and videos
        channel_hits: Dict[str, int] = {}
        video_map: Dict[str, List[Dict[str, Any]]] = {}
        
        # Search for videos for each keyword
        for kw in keywords:
            try:
                vids = await youtube_api.search_videos(
                    kw,
                    max_results=request.top_videos_per_keyword,
                    order='viewCount',
                    region_code='IN',
                    language='English'  # Single language to conserve quota
                )
            except Exception:
                vids = []
            
            for v in vids:
                cid = v.get('channel_id')
                if not cid:
                    continue
                
                channel_hits[cid] = channel_hits.get(cid, 0) + 1
                video_map.setdefault(cid, []).append(v)
                database.save_videos(cid, [v])
        
        # Get channel details
        channel_ids = list(channel_hits.keys())
        channels_data = await youtube_api.get_channels_details(channel_ids) if channel_ids else []
        
        # Get initial matches
        matches = matcher.find_matches(
            channels_data=channels_data,
            brand_keywords=keywords,
            target_audience=None,
            min_subscribers=None,
            max_subscribers=None
        )
        
        # Simple scoring without heavy comment analysis for quota conservation
        enriched = []
        for m in matches:
            cid = m.get('channel_id')
            if not cid:
                continue
            
            hit_score = min(channel_hits.get(cid, 0) / max(len(keywords), 1), 1.0)
            base_match = m.get('match_score', 0.0)
            
            # Bonus for frequent appearances
            final_score = base_match * 0.7 + hit_score * 0.3
            if channel_hits.get(cid, 0) >= 3:
                final_score = min(final_score * 1.1, 1.0)
            
            enriched.append({
                **m,
                'hit_score': round(hit_score, 3),
                'final_score': round(final_score, 4),
                'sampled_videos': [v.get('video_id') for v in video_map.get(cid, [])[:3]]
            })
        
        # Sort and return top results
        enriched.sort(key=lambda x: x['final_score'], reverse=True)
        top = enriched[:request.top_n]
        
        return JSONResponse(content={
            'ranked': top,
            'keywords_used': keywords,
            'channels_considered': len(channels_data)
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/health')
async def health():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'youtube_api': youtube_api.api_key is not None,
        'gemini_api': llm.enabled if llm else False
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
