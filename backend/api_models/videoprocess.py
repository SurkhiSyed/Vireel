import requests
import os

def download_video(video_url, output_path):
    response = requests.get(video_url, stream=True)
    response.raise_for_status()
    
    with open(output_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)
    
    return output_path

def process_videos(articles):
    video_files = []
    for i, article in enumerate(articles):
        video_url = article.get('video_url')
        if video_url:
            output_path = f"video_{i}.mp4"
            try:
                video_file = download_video(video_url, output_path)
                video_files.append(video_file)
                article['video_file'] = video_file
            except Exception as e:
                print(f"Error downloading video for article {i}: {str(e)}")
    return video_files