const API_BASE_URL = "http://localhost:8000";

export interface UploadResponse {
  success: boolean;
  message: string;
  document_id?: string;
  error?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Upload un fichier vers le backend
 * @param file Le fichier à uploader
 * @param onProgress Callback pour suivre la progression
 * @returns La réponse du serveur
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress({
            fileName: file.name,
            progress,
            status: 'uploading'
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          if (onProgress) {
            onProgress({
              fileName: file.name,
              progress: 100,
              status: 'completed'
            });
          }
          resolve(response);
        } else {
          const error = `Erreur lors de l'upload: ${xhr.status}`;
          if (onProgress) {
            onProgress({
              fileName: file.name,
              progress: 0,
              status: 'error',
              error
            });
          }
          reject(new Error(error));
        }
      });

      xhr.addEventListener('error', () => {
        const error = 'Erreur réseau lors de l\'upload';
        if (onProgress) {
          onProgress({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error
          });
        }
        reject(new Error(error));
      });

      xhr.open('POST', `${API_BASE_URL}/documents/`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw error;
  }
};

/**
 * Upload plusieurs fichiers en parallèle
 * @param files Les fichiers à uploader
 * @param onProgress Callback pour suivre la progression de chaque fichier
 * @returns Les réponses du serveur pour chaque fichier
 */
export const uploadMultipleFiles = async (
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadFile(file, onProgress));
  return Promise.all(uploadPromises);
}; 