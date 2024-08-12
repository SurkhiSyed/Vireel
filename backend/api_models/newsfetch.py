import requests
import logging
import re
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NEWS_API_KEY = '49c12beadb564b1a91a0128cc94898b7'

def extract_video_url(article_url):
    response = requests.get(article_url)
    html_content = response.text
    video_match = re.search(r'<video.*?src=["\'](.+?)["\']', html_content, re.DOTALL)
    if video_match:
        return video_match.group(1)
    return None

def scrape_full_article(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract the main content of the article
        paragraphs = soup.find_all('p')
        full_text = ' '.join([p.get_text() for p in paragraphs])
        
        return full_text
    except Exception as e:
        logger.error(f"Error scraping article: {e}")
        return "Full content not available."

def fetch_news_by_query(query, page=2, page_size=20):
    url = f'https://newsapi.org/v2/everything?q={query}&pageSize={page_size}&page={page}&apiKey={NEWS_API_KEY}'
    
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()

    articles = []
    for article in data.get('articles', []):
        if article:
            content_url = article.get('url')
            full_content = scrape_full_article(content_url)
            
            video_url = extract_video_url(content_url)
            articles.append({
                'title': article.get('title', 'No title'),
                'content': full_content,
                'publisher': article.get('source', {}).get('name', 'Unknown publisher'),
                'urlToImage': article.get('urlToImage'),  # Include the image URL
                'video_url': video_url,
                'url': content_url
            })

    return articles
