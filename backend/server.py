from flask import Flask, jsonify, request
from flask_cors import CORS
from api_models.newsfetch import fetch_news_by_query
from api_models.summarize import summarize_articles
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/api/news/<string:category>')
def get_news_by_query(category):
    
    # Use 'category' instead of 'query' in your function
    try:
        news_articles = fetch_news_by_query(query=category)
        # ... rest of your function
        # news_articles = fetch_news_by_query(query=query)
        #logger.info(f"Fetched {len(news_articles)} articles for query: {query}")
        if not news_articles:
            logger.warning("No articles fetched")
            return jsonify([]), 200
        summarized_articles = summarize_articles(news_articles)
        logger.info(f"Summarized {len(summarized_articles)} articles")
        return jsonify(summarized_articles)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
