import os
from typing import List

try:
    import google.generativeai as genai
except ImportError:
    genai = None


class KeywordLLM:
    def __init__(self, api_key: str | None):
        self.api_key = api_key
        self.enabled = bool(api_key and genai)
        if self.enabled:
            genai.configure(api_key=api_key)
            # Use Gemini 2.0 Flash for better performance
            self.model = genai.GenerativeModel(
                'gemini-2.0-flash-exp',
                system_instruction="""You are a professional marketing strategist and influencer marketing expert with 10+ years of experience. 
Your specialty is identifying the perfect keywords and search terms to discover relevant YouTube influencers for brand campaigns.

When given a campaign brief, you analyze:
- The brand's target audience and demographics
- The product/service category and niche
- The marketing goals and objectives
- Cultural and regional context (especially for Indian market)
- Current trends and popular content themes

You generate highly relevant, specific YouTube search keywords that will help discover influencers whose content aligns perfectly with the campaign goals.
Your keywords are:
- Specific and actionable (not too broad)
- Naturally used by the target audience
- Mix of niche-specific and broader category terms
- Culturally appropriate and regionally relevant
- Optimized for YouTube search behavior"""
            )

    def expand_keywords(self, campaign_text: str, seed_keywords: List[str], max_keywords: int = 30, language: str = 'English') -> List[str]:
        """Generate marketing-focused keywords from campaign brief using professional marketer AI"""
        if not self.enabled:
            return []
        
        # Language-specific instructions
        language_guidance = {
            'English': 'Generate keywords in English that Indian creators and audiences commonly use.',
            'Hindi': 'Generate keywords in Hindi (Devanagari script) that are commonly used by Hindi-speaking creators and audiences. Mix of Hindi and Hinglish is fine.',
            'Tamil': 'Generate keywords in Tamil script that are commonly used by Tamil-speaking creators and audiences in Tamil Nadu.',
            'Telugu': 'Generate keywords in Telugu script that are commonly used by Telugu-speaking creators and audiences in Andhra Pradesh and Telangana.',
            'Kannada': 'Generate keywords in Kannada script that are commonly used by Kannada-speaking creators in Karnataka.',
            'Malayalam': 'Generate keywords in Malayalam script that are commonly used by Malayalam-speaking creators in Kerala.',
            'Bengali': 'Generate keywords in Bengali script that are commonly used by Bengali-speaking creators in West Bengal.',
            'Marathi': 'Generate keywords in Marathi (Devanagari script) that are commonly used by Marathi-speaking creators in Maharashtra.',
            'Gujarati': 'Generate keywords in Gujarati script that are commonly used by Gujarati-speaking creators in Gujarat.',
            'Punjabi': 'Generate keywords in Punjabi (Gurmukhi script) that are commonly used by Punjabi-speaking creators in Punjab.',
            'Hinglish': 'Generate keywords mixing Hindi and English (Roman script) as commonly used in urban India. Use Romanized Hindi words mixed with English.'
        }
        
        lang_instruction = language_guidance.get(language, language_guidance['English'])
        
        # Build a comprehensive prompt
        prompt = f"""Analyze this influencer marketing campaign brief and generate {max_keywords} highly relevant YouTube search keywords IN {language.upper()}.

**Campaign Brief:**
{campaign_text}

**Initial Seed Keywords (if provided):**
{', '.join(seed_keywords) if seed_keywords else 'None provided - generate from scratch'}

**Target Language:** {language}
**Language Instructions:** {lang_instruction}

**Instructions:**
1. Understand the campaign's target audience, goals, and product/service
2. Generate {max_keywords} specific, actionable YouTube search keywords IN {language}
3. Include a mix of:
   - Niche-specific terms (e.g., "vegan protein reviews", "budget tech unboxing")
   - Broader category terms (e.g., "fitness lifestyle", "tech tutorials")
   - Audience-focused terms (e.g., "college students", "working professionals")
   - Content format terms (e.g., "vlogs", "reviews", "tutorials")
4. IMPORTANT: All keywords must be in {language} script/language
5. Think about what someone would actually search on YouTube in {language}
6. Consider regional Indian context and cultural nuances

**Output Format:**
Return ONLY a comma-separated list of keywords in {language}. No explanations, no numbering, no extra text.
Example format: keyword1, keyword2, keyword3

Generate the keywords now:"""

        try:
            resp = self.model.generate_content(prompt)
            text = resp.text or ''
            
            # Parse and clean the keywords
            items = [k.strip() for k in text.split(',') if k.strip()]
            
            # Deduplicate and limit
            seen = set()
            result = []
            for k in items:
                kl = k.lower()
                # Remove any numbering or bullets if present
                k_clean = k.lstrip('0123456789.-) ').strip()
                kl_clean = k_clean.lower()
                
                if kl_clean and kl_clean not in seen and len(result) < max_keywords:
                    seen.add(kl_clean)
                    result.append(k_clean)
            
            return result
        except Exception as e:
            print(f"Error generating keywords with Gemini: {e}")
            return []
