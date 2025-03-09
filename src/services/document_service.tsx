const API_BASE_URL = "http://localhost:8000"; // URL du backend

// Interface pour la réponse du document
interface DocumentResponse {
  document_id?: string;
  message?: string;
  metadata?: any;
  [key: string]: any;
}

/**
 * Récupère les informations d'un document spécifique
 * @param documentId L'ID du document à récupérer
 * @returns Les informations du document
 */
export const getDocument = async (documentId: string): Promise<DocumentResponse> => {
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
    const response = await fetch(`${API_BASE_URL}/documents/`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des documents: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return [];
  }
};

/**
 * Met à jour les métadonnées d'un document
 * @param documentId L'ID du document à mettre à jour
 * @param metadata Les nouvelles métadonnées
 * @returns Le document mis à jour
 */
export const updateDocumentMetadata = async (documentId: string, metadata: any): Promise<DocumentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour des métadonnées: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des métadonnées:", error);
    throw error;
  }
}; 