import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db, auth } from '../firebase-config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection } from 'firebase/firestore';
import './news.css';

function News() {
  const [news, setNews] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [pageNumbers, setPageNumbers] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null); // For the popup
  const [comments, setComments] = useState([]); // Comments for the selected article
  const [commentText, setCommentText] = useState(''); // New comment text

  useEffect(() => {
    const fetchUserInterests = async () => {
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const interests = userDoc.data().interests || [];
          setUserInterests(interests);

          // Initialize page numbers for each interest
          const initialPageNumbers = interests.reduce((acc, interest) => {
            acc[interest] = 1;
            return acc;
          }, {});
          setPageNumbers(initialPageNumbers);
        }
      }
    };

    fetchUserInterests();
  }, []);

  const fetchNewsFromAllInterests = async () => {
    let allFetchedArticles = [];

    for (const interest of userInterests) {
      const currentPage = pageNumbers[interest] || 1;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/news/${interest}?page=${currentPage}`
        );
        allFetchedArticles.push(...response.data);

        setPageNumbers((prevPageNumbers) => ({
          ...prevPageNumbers,
          [interest]: prevPageNumbers[interest] + 1,
        }));
      } catch (error) {
        console.error(`Error fetching news for ${interest}:`, error);
      }
    }

    const randomArticles = [];
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * allFetchedArticles.length);
      randomArticles.push(allFetchedArticles[randomIndex]);
    }

    setNews(randomArticles);
    localStorage.setItem('news', JSON.stringify(randomArticles));

    // Save each article to Firebase
    randomArticles.forEach(async (article) => {
      try {
        const articleDocRef = doc(db, 'articles', encodeURIComponent(article.url));
        await setDoc(articleDocRef, {
          title: article.title,
          summary: article.summary,
          urlToImage: article.urlToImage,
          url: article.url,
          comments: [], // Initialize with an empty comments array
        }, { merge: true });
      } catch (error) {
        console.error("Error saving article to Firestore: ", error);
      }
    });
  };

  const handleLike = async (article) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You need to be logged in to like an article.");
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const likedArticlesCollection = collection(userDocRef, 'likedArticles');
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

  const handleOpenComments = async (article) => {
    setSelectedArticle(article);
    try {
      const articleDocRef = doc(db, 'articles', encodeURIComponent(article.url));
      const articleDoc = await getDoc(articleDocRef);

      if (articleDoc.exists()) {
        setComments(articleDoc.data().comments || []);
      }
    } catch (error) {
      console.error("Error loading comments: ", error);
    }
  };

  const handleCloseComments = () => {
    setSelectedArticle(null);
    setComments([]);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const user = auth.currentUser;

    if (!user) {
      alert("You need to be logged in to comment.");
      return;
    }

    try {
      const articleDocRef = doc(db, 'articles', encodeURIComponent(selectedArticle.url));

      await updateDoc(articleDocRef, {
        comments: arrayUnion({
          author: user.email,
          text: commentText,
          createdAt: new Date(),
        }),
      });

      // Update local comments state
      setComments((prevComments) => [
        ...prevComments,
        { author: user.email, text: commentText, createdAt: new Date() },
      ]);

      setCommentText('');
    } catch (error) {
      console.error("Error submitting comment: ", error);
      alert("Error submitting comment.");
    }
  };

  return (
    <div className="news-container">
      <h1 className='news-heading'>News</h1>
      <button onClick={fetchNewsFromAllInterests}>Generate New Articles</button>
      <div className="newspage">
        {news.map((article, index) => (
          <div className="card" key={index}>
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} className="card-image" />
            )}
            <h2 className="card-title">{article.title}</h2>
            <p className="card-summary">{article.summary}</p>
            <p className="card-publisher">Published by: {article.publisher}</p>
            <button onClick={() => handleLike(article)} className="like-button">Like</button>
            <button onClick={() => handleOpenComments(article)} className="comment-button">Comments</button>
          </div>
        ))}
      </div>

      {/* Comment Popup */}
      {selectedArticle && (
        <>
          <div className="popup-overlay" onClick={handleCloseComments}></div>
          <div className="comment-popup">
            <h2>Comments for {selectedArticle.title}</h2>
            <div className="comment-list">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div className="comment-item" key={index}>
                    <div className="comment-author">{comment.author}</div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                ))
              ) : (
                <div className="no-comments">No comments yet.</div>
              )}
            </div>
            <form onSubmit={handleSubmitComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows="3"
                placeholder="Add a comment..."
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default News;
