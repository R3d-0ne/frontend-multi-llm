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

// Interface pour la réponse paginée
interface PaginatedDocumentsResponse {
  documents: DocumentResponse[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  next_offset: number | null;
}

/**
 * Récupère la liste des documents avec pagination
 * @param limit Nombre maximum de documents à récupérer (défaut: 50)
 * @param offset Nombre de documents à ignorer (défaut: 0)
 * @returns La réponse paginée avec les documents
 */
export const listDocuments = async (limit: number = 50, offset: number = 0): Promise<PaginatedDocumentsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des documents: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return {
      documents: [],
      total: 0,
      limit,
      offset,
      has_more: false,
      next_offset: null
    };
  }
};

/**
 * Récupère tous les documents (pour compatibilité avec l'ancien code)
 * @returns La liste de tous les documents
 */
export const listAllDocuments = async (): Promise<DocumentResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des documents: ${response.status}`);
    }
    
    const data = await response.json();
    // Si c'est la nouvelle structure paginée, retourner seulement les documents
    if (data.documents) {
      return data.documents;
    }
    // Sinon, retourner la réponse telle quelle (compatibilité)
    return data;
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