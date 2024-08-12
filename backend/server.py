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
    try:
        page = request.args.get('page', 1, type=int)
        news_articles = fetch_news_by_query(query=category, page=page)
        if not news_articles:
            logger.warning("No valid articles fetched")
            return jsonify([]), 200
        
        summarized_articles = summarize_articles(news_articles)
        
        if not summarized_articles:
            logger.warning("No articles successfully summarized.")
            return jsonify([]), 200
        
        logger.info(f"Returning {len(summarized_articles)} summarized articles.")
        return jsonify(summarized_articles)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
