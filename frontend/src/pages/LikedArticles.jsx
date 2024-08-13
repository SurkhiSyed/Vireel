import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { collection, getDocs, doc } from 'firebase/firestore';
import './news.css'; // Reuse the existing news.css for styling

function LikedArticles() {
  const [likedArticles, setLikedArticles] = useState([]);

  useEffect(() => {
    const fetchLikedArticles = async () => {
      const user = auth.currentUser;

      if (user) {
        const likedArticlesCollectionRef = collection(doc(db, 'users', user.uid), 'likedArticles');
        const likedArticlesSnapshot = await getDocs(likedArticlesCollectionRef);
        const articles = likedArticlesSnapshot.docs.map(doc => doc.data());
        setLikedArticles(articles);
      }
    };

    fetchLikedArticles();
  }, []);

  return (
    <div className='news-container'>
      <h1 className="news-heading">Liked Articles</h1> {/* Use the same class as the news heading */}
      <div className='newspage'>
        {likedArticles.map((article, index) => (
          <div className='card' key={index}>
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} className='card-image' />
            )}
            <h2 className='card-title'>{article.title}</h2>
            <p className='card-summary'>{article.summary}</p>
            <p className='card-publisher'>Published by: {article.publisher}</p>
            <a href={article.url} target='_blank' rel='noopener noreferrer' className='card-link'>
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LikedArticles;
