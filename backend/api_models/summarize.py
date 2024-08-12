import google.generativeai as genai
import os
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use environment variable for API key
#api_key = os.getenv('GEMINI_API_KEY')
#if not api_key:
 #   logger.error("GEMINI_API_KEY environment variable not set")
  #  raise ValueError("GEMINI_API_KEY not set")

genai.configure(api_key="AIzaSyCrzevdrYbFwmsOnFdc0O4XcYPfxavPIr8")

# In your summarize_article function
def summarize_article(content):
    if not content or content == 'No content available':
        logger.warning("No content available for summarization")
        return None
    
    # Log the content that's being summarized
    logger.info(f"Summarizing content: {content}")
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"Provide a brief context in a few words, then summarize the following news article in about 100-125 words:\n\n{content}"
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error summarizing article: {str(e)}", exc_info=True)
        return None


def summarize_articles(articles):
    summaries = []
    for index, article in enumerate(articles):
        logger.info(f"Processing article {index + 1} of {len(articles)}")
        
        content = article.get('content')
        if not content or content == 'Full content not available.':
            logger.warning(f"Article {index + 1} has no valid content, skipping.")
            continue  # Skip this article
        
        summary = summarize_article(content)
        
        if summary:
            summaries.append({
                'title': article.get('title', 'No title'),
                'summary': summary,
                'content': article.get('content', ''),  # Include original content
                'publisher': article.get('publisher', 'Unknown publisher'),
                'urlToImage': article.get('urlToImage', ''),  # Preserve the image URL
                'url': article.get('url', '')  # Preserve the article URL
            })
        else:
            logger.warning(f"Failed to summarize article {index + 1}, skipping.")
        
        time.sleep(1)  # Add a 1-second delay between API calls
    
    return summaries
