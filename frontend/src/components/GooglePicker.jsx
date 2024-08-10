import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load the Google Picker API
    const script = document.createElement('script');
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load('auth', { 'callback': onAuthApiLoad });
      window.gapi.load('picker', { 'callback': onPickerApiLoad });
    };
    document.body.appendChild(script);
  }, []);

  let oauthToken;
  let developerKey = '';
  let clientId = '332707624525-eu7cdo36na4ovvviil70rboe6epre2l8.apps.googleusercontent.com';
  let pickerApiLoaded = false;

  function onAuthApiLoad() {
    window.gapi.auth.authorize(
      {
        'client_id': clientId,
        'scope': ['https://www.googleapis.com/auth/drive.file'],
        'immediate': false
      },
      handleAuthResult
    );
  }

  function onPickerApiLoad() {
    pickerApiLoaded = true;
    createPicker();
  }

  function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      oauthToken = authResult.access_token;
      createPicker();
    }
  }

  function createPicker() {
    if (pickerApiLoaded && oauthToken) {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(oauthToken)
        .setDeveloperKey(developerKey)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
    }
  }

  function pickerCallback(data) {
    if (data.action === window.google.picker.Action.PICKED) {
      const fileId = data.docs[0].id;
      handleDownload(fileId, oauthToken);
    }
  }

  const handleDownload = async (fileId, oauthToken) => {
    try {
      const response = await axios.post('http://localhost:5000/download', {
        fileId,
        oauthToken,
      });
      console.log('Activities received:', response.data);
      setActivities(response.data);
      setError('Works');
    } catch (error) {
      setError('Error downloading the file');
      console.error('Error downloading the file', error);
    }
  };

  return (
    <div>
      <h1>Upload Google Takeout File</h1>
      <button onClick={() => createPicker()}>Select from Google Drive</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>Extracted Activities</h2>
      <ul>
        {activities.map((activity, index) => (
          <li key={index}>
            <strong>Title:</strong> {activity.title}<br />
            <strong>Link:</strong> <a href={activity.link}>{activity.link}</a><br />
            <strong>Time:</strong> {activity.time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
