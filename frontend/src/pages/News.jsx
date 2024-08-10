import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './news.css';

const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

function News() {
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (selectedCategory) {
      fetchNews(selectedCategory);
    }
  }, [selectedCategory]);
  
  const fetchNews = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/news/${category}`);
      console.log('Fetched Articles:', response.data);  // Inspect the data
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };
  

  return (
    <div className='container'>
      <h1>News</h1>
      <div className='categorylist'>
        {categories.map(category => (
          <button 
            key={category} 
            onClick={() => setSelectedCategory(category)}
            style={{backgroundColor: selectedCategory === category ? '#ddd' : ''}}
          >
            {category}
          </button>
        ))}
      </div>
      <div className='newspage'>
        {news.map((article, index) => (
          <div className='card' key={index}>
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} className='card-image' />
            )}
            <h2 className='card-title'>{article.title}</h2>
            <p className='card-summary'>{article.summary}</p>
            <p className='card-publisher'>Published by: {article.publisher}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
