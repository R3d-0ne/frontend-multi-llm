const API_BASE_URL = "http://localhost:8000"; // URL du backend

// Interface pour la réponse du téléchargement de document
interface DocumentResponse {
  document_id?: string;
  message?: string;
  path?: string;
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
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
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

/**
 * Récupère le chemin d'un document spécifique
 * @param documentId L'ID du document à récupérer
 * @returns Le chemin du document
 */
export const getDocumentPath = async (documentId: string): Promise<DocumentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du document: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération du document:", error);
    throw error;
  }
};

/**
 * Supprime un document spécifique
 * @param documentId L'ID du document à supprimer
 * @returns Un message de confirmation
 */
export const deleteDocument = async (documentId: string): Promise<DocumentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression du document: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    throw error;
  }
};

/**
 * Récupère la liste de tous les documents
 * @returns La liste des documents
 */
export const listDocuments = async (): Promise<DocumentResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des documents: ${response.status}`);
    }
    
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    throw error;
  }
}; 