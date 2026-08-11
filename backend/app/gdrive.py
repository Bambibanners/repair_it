import os
import uuid
import shutil
from typing import Optional, Dict, Any

try:
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials as UserCredentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    GDRIVE_AVAILABLE = True
except ImportError:
    GDRIVE_AVAILABLE = False

CREDENTIALS_FILE = os.getenv("GDRIVE_CREDENTIALS_FILE", "gdrive_credentials.json")
LOCAL_UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../uploads"))

os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)

class GoogleDriveManager:
    def reload_credentials(self):
        """Triggers credentials check log"""
        if os.path.exists(CREDENTIALS_FILE):
            print(f"[GoogleDrive] Reloaded Service Account credentials from {CREDENTIALS_FILE}")
        else:
            print(f"[GoogleDrive] Service Account credentials file {CREDENTIALS_FILE} removed or missing.")

    def get_service_for_token(self, access_token: Optional[str] = None):
        """
        Builds a Google Drive service object using a User OAuth Token if provided,
        otherwise falls back to Service Account credentials file if present.
        """
        if not GDRIVE_AVAILABLE:
            return None

        # 1. Try Service Account JSON (permanent)
        if os.path.exists(CREDENTIALS_FILE):
            try:
                scopes = ['https://www.googleapis.com/auth/drive.file']
                creds = service_account.Credentials.from_service_account_file(
                    CREDENTIALS_FILE, scopes=scopes
                )
                return build('drive', 'v3', credentials=creds)
            except Exception as e:
                print(f"[GoogleDrive] Error building service from service account: {e}")

        # 2. Try User OAuth Token
        if access_token:
            try:
                creds = UserCredentials(token=access_token)
                return build('drive', 'v3', credentials=creds)
            except Exception as e:
                print(f"[GoogleDrive] Error building service from OAuth token: {e}")

        return None

    def upload_file(
        self, 
        file_path: str, 
        file_name: str, 
        mime_type: str, 
        folder_name: Optional[str] = "Repair-It Media",
        access_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Uploads a file to Google Drive (or local storage fallback).
        """
        service = self.get_service_for_token(access_token)

        if service:
            try:
                # 1. Check/create target Google Drive folder
                folder_id = self._get_or_create_folder(service, folder_name)

                # 2. Prepare upload payload
                file_metadata = {
                    'name': file_name,
                    'parents': [folder_id] if folder_id else []
                }
                media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)

                drive_file = service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id, name, webViewLink, thumbnailLink'
                ).execute()

                # 3. Set public/domain read permissions on file
                try:
                    service.permissions().create(
                        fileId=drive_file['id'],
                        body={'type': 'anyone', 'role': 'reader'}
                    ).execute()
                except Exception:
                    pass

                drive_id = drive_file.get('id')
                return {
                    "gdrive_file_id": drive_id,
                    "web_view_link": drive_file.get('webViewLink'),
                    "thumbnail_link": drive_file.get('thumbnailLink') or f"https://lh3.googleusercontent.com/d/{drive_id}",
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

    def _get_or_create_folder(self, service, folder_name: str) -> Optional[str]:
        if not service or not folder_name:
            return None
        try:
            query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            results = service.files().list(q=query, fields="files(id, name)").execute()
            files = results.get('files', [])
            if files:
                return files[0]['id']

            # Create folder
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            folder = service.files().create(body=folder_metadata, fields='id').execute()
            return folder.get('id')
        except Exception as e:
            print(f"[GoogleDrive] Error creating folder '{folder_name}': {e}")
            return None

gdrive_manager = GoogleDriveManager()
