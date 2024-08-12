import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db, auth } from '../firebase-config';
import { collection, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './news.css';

const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

function News() {
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchNews(selectedCategory, page);
    }
  }, [selectedCategory, page]);

  const fetchNews = async (category, page) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/news/${category}?page=${page}`);
      console.log('Fetched Articles:', response.data);
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  const handleLike = async (article) => {
    if (!currentUser) {
      alert("You need to be logged in to like an article.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const likedArticlesCollection = collection(userDocRef, 'likedArticles');

      // Use the URL (encoded) as the document ID
      const articleId = encodeURIComponent(article.url);

      await setDoc(doc(likedArticlesCollection, articleId), {
        title: article.title,
        summary: article.summary,
        urlToImage: article.urlToImage,
        url: article.url,
        likedAt: new Date(),
      });

      alert("Article information saved successfully!");
    } catch (error) {
      console.error("Error saving article information: ", error);
      alert("Error saving article information.");
    }
  };

  return (
    <div className='container'>
      <h1>News</h1>
      <div className='categorylist'>
        {categories.map(category => (
          <button 
            key={category} 
            onClick={() => {
              setSelectedCategory(category);
              setPage(1); // Reset to page 1 when changing category
            }}
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
            <button onClick={() => handleLike(article)} className='like-button'>Like</button>
          </div>
        ))}
      </div>
      <div className='pagination'>
        <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
        <span>Page {page}</span>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
}

export default News;
