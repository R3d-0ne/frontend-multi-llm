const API_BASE_URL = "http://localhost:8000"; // URL du backend

// Interface pour la réponse du téléchargement de document
interface DocumentResponse {
  document_id?: string;
  message?: string;
  metadata?: any;
  [key: string]: any;
}

/**
 * Télécharge un document sur le serveur
 * @param file Le fichier à télécharger
 * @returns L'ID du document téléchargé
 */
export const uploadDocument = async (file: File): Promise<DocumentResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/documents/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement du document: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du téléchargement du document:", error);
    throw error;
  }
}; 