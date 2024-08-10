import React, { useEffect, useState } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import axios from 'axios';

function UploadData() {
    const [openPicker, data, authResponse] = useDrivePicker();
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState('');

    const handleOpenPicker = () => {
        openPicker({
            clientId: "332707624525-eu7cdo36na4ovvviil70rboe6epre2l8.apps.googleusercontent.com",
            developerKey: "AIzaSyANHKhz9Ciqd7AA4tFkbazhEzScYrxSV4w",
            viewId: "DOCS",
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false
        });
    };

    useEffect(() => {
        if (data && authResponse) {
            console.log('Data from picker:', data);
            console.log('Auth response:', authResponse);

            const file = data.docs[0];
            const fileId = file.id;
            const oauthToken = authResponse.access_token;

            axios.post('http://localhost:5000/download', { fileId, oauthToken })
                .then(response => {
                    console.log('Activities from backend:', response.data);
                    setActivities(response.data);
                })
                .catch(error => {
                    setError('Error fetching activities');
                    console.error('Error fetching activities:', error);
                });
        }
    }, [data, authResponse]);

    return (
        <div>
            <button onClick={handleOpenPicker}>Open Picker</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>Extracted Activities</h2>
            <ul>
                {activities.map((activity, index) => (
                    <li key={index}>
                        <strong>Title:</strong> {activity.title}<br />
                        <strong>Link:</strong> <a href={activity.link} target="_blank" rel="noopener noreferrer">{activity.link}</a><br />
                        <strong>Time:</strong> {activity.time}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UploadData;
