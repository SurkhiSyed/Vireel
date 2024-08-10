import io
import os
import zipfile
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaIoBaseDownload

def download_file(file_id, oauth_token, download_folder):
    creds = Credentials(oauth_token)
    try:
        service = build("drive", "v3", credentials=creds)
        request = service.files().get_media(fileId=file_id)
        file = io.BytesIO()
        downloader = MediaIoBaseDownload(file, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Download {int(status.progress() * 100)}%.")

        file.seek(0)
        with open(os.path.join(download_folder, 'takeout.zip'), 'wb') as f:
            f.write(file.read())

    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

    return os.path.join(download_folder, 'takeout.zip')

def extract_zip_file(zip_path, extract_to):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
