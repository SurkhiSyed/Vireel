import React, { useState } from 'react';
import { db, auth } from '../firebase-config';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import './home.css';

function Home() {
  const [interest, setInterest] = useState('');

  const handleAddInterest = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert('You need to be logged in to add interests.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);

      await updateDoc(userDocRef, {
        interests: arrayUnion(interest),
      });

      setInterest('');
      alert('Interest added successfully!');
    } catch (error) {
      console.error('Error adding interest:', error);
      alert('Failed to add interest.');
    }
  };

  return (
    <div className='home-container'>
      <h1 className='home-header'>Set Your Interests</h1>
      <div className='home-content'>
        <input
          type='text'
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          placeholder='Enter an interest'
          className='home-input'
        />
        <button onClick={handleAddInterest} className='home-button'>
          Add Interest
        </button>
      </div>
    </div>
  );
}

export default Home;
