import os
import uuid
import shutil
from typing import Optional, Dict, Any

# Google API client imports with safety fallback
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    GDRIVE_AVAILABLE = True
except ImportError:
    GDRIVE_AVAILABLE = False

CREDENTIALS_FILE = os.getenv("GDRIVE_CREDENTIALS_FILE", "gdrive_credentials.json")
LOCAL_UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads"))

os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)

class GoogleDriveManager:
    def __init__(self):
        self.service = None
        self.is_gdrive_active = False

        if GDRIVE_AVAILABLE and os.path.exists(CREDENTIALS_FILE):
            try:
                scopes = ['https://www.googleapis.com/auth/drive.file']
                creds = service_account.Credentials.from_service_account_file(
                    CREDENTIALS_FILE, scopes=scopes
                )
                self.service = build('drive', 'v3', credentials=creds)
                self.is_gdrive_active = True
                print(f"[GoogleDrive] Successfully connected to Google Drive API via {CREDENTIALS_FILE}")
            except Exception as e:
                print(f"[GoogleDrive] Warning: Failed to initialize Google Drive service: {e}")
                self.is_gdrive_active = False
        else:
            print("[GoogleDrive] Running in Local Storage Mode (gdrive_credentials.json not found). Uploads will save locally.")

    def upload_file(
        self, 
        file_path: str, 
        file_name: str, 
        mime_type: str, 
        folder_name: Optional[str] = "Repair-It Media"
    ) -> Dict[str, Any]:
        """
        Uploads a file to Google Drive (or local storage fallback).
        Returns metadata containing file_id, web_view_link, thumbnail_link.
        """
        if self.is_gdrive_active and self.service:
            try:
                # 1. Check/create target Google Drive folder
                folder_id = self._get_or_create_folder(folder_name)

                # 2. Prepare upload payload
                file_metadata = {
                    'name': file_name,
                    'parents': [folder_id] if folder_id else []
                }
                media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)

                drive_file = self.service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, name, webViewLink, thumbnailLink'
                ).execute()

                # 3. Set public/domain read permissions on file
                try:
                    self.service.permissions().create(
                        fileId=drive_file['id'],
                        body={'type': 'anyone', 'role': 'reader'}
                    ).execute()
                except Exception:
                    pass

                return {
                    "gdrive_file_id": drive_file.get('id'),
                    "web_view_link": drive_file.get('webViewLink'),
                    "thumbnail_link": drive_file.get('thumbnailLink') or drive_file.get('webViewLink'),
                    "storage_mode": "gdrive"
                }
            except Exception as e:
                print(f"[GoogleDrive] Error uploading file to Google Drive: {e}. Falling back to local storage.")

        # Local storage fallback
        dest_filename = f"{uuid.uuid4().hex[:8]}_{file_name}"
        dest_path = os.path.join(LOCAL_UPLOADS_DIR, dest_filename)
        shutil.copy(file_path, dest_path)

        local_url = f"/uploads/{dest_filename}"
        return {
            "gdrive_file_id": None,
            "web_view_link": local_url,
            "thumbnail_link": local_url,
            "storage_mode": "local"
        }

    def _get_or_create_folder(self, folder_name: str) -> Optional[str]:
        if not self.service or not folder_name:
            return None
        try:
            query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            results = self.service.files().list(q=query, fields="files(id, name)").execute()
            files = results.get('files', [])
            if files:
                return files[0]['id']

            # Create folder
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            folder = self.service.files().create(body=folder_metadata, fields='id').execute()
            return folder.get('id')
        except Exception as e:
            print(f"[GoogleDrive] Error creating folder '{folder_name}': {e}")
            return None

gdrive_manager = GoogleDriveManager()
