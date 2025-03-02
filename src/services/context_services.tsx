const API_BASE_URL = "http://localhost:8000"; // URL du backend Docker

// Interface pour la réponse du contexte
interface ContextResponse {
  id: string;
  prompt?: string;
  [key: string]: any;
}

/**
 * Récupère un contexte spécifique par son ID
 * @param contextId L'ID du contexte à récupérer
 * @returns Les données du contexte
 */
export const getContext = async (contextId: string): Promise<ContextResponse> => {
  try {
    console.log(`Récupération du contexte avec l'ID: ${contextId}`);
    const response = await fetch(`${API_BASE_URL}/contexts/${contextId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la récupération du contexte: ${response.status}`, errorText);
      throw new Error(`Erreur lors de la récupération du contexte: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Contexte récupéré:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du contexte:", error);
    throw error;
  }
};

/**
 * Sauvegarde un contexte complet pour une discussion
 * @param discussionId L'ID de la discussion
 * @param currentMessage Le message actuel de l'utilisateur
 * @param settingsId L'ID des paramètres à utiliser (optionnel)
 * @param additionalInfo Informations supplémentaires (optionnel)
 * @returns L'ID du contexte créé
 */
export const saveFullContext = async (
  discussionId: string,
  currentMessage: string,
  settingsId?: string,
  additionalInfo?: string
): Promise<ContextResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/contexts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        discussion_id: discussionId,
        current_message: currentMessage,
        settings_id: settingsId,
        additional_info: additionalInfo
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la sauvegarde du contexte: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contexte:", error);
    throw error;
  }
};

/**
 * Supprime un contexte spécifique
 * @param contextId L'ID du contexte à supprimer
 * @returns Un message de confirmation
 */
export const deleteContext = async (contextId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/contexts/${contextId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression du contexte: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la suppression du contexte:", error);
    throw error;
  }
};
