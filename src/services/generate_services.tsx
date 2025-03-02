const API_BASE_URL = "http://localhost:8000"; // URL du backend Docker

// Interface pour la requête de génération
interface GenerateRequest {
  discussion_id?: string;  // Optionnel : si non fourni, une discussion sera créée
  settings_id?: string;    // Le setting_id à utiliser, s'il y en a plusieurs
  current_message: string;
  additional_info?: string;
}

// Interface pour la réponse de génération
interface GenerateResponse {
  response: string;
  context_id: string;
  discussion_id: string;
}

/**
 * Génère une réponse à partir du message de l'utilisateur
 * @param request Les paramètres de la requête
 * @returns La réponse générée avec les IDs de contexte et de discussion
 */
export const generateResponse = async (request: GenerateRequest): Promise<GenerateResponse> => {
  try {
    console.log("Envoi de la requête de génération:", request);
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la génération de la réponse: ${response.status}`, errorText);
      throw new Error(`Erreur lors de la génération de la réponse: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Réponse générée:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse:", error);
    throw error;
  }
};

/**
 * Génère une réponse dans une nouvelle discussion
 * @param message Le message de l'utilisateur
 * @param additionalInfo Informations supplémentaires (optionnel)
 * @param settingsId ID des paramètres à utiliser (optionnel)
 * @returns La réponse générée avec les IDs de contexte et de discussion
 */
export const generateNewDiscussion = async (
  message: string,
  additionalInfo?: string,
  settingsId?: string
): Promise<GenerateResponse> => {
  console.log(`Création d'une nouvelle discussion avec le message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  console.log(`Paramètres utilisés: ${settingsId || 'aucun'}`);
  
  try {
    const response = await generateResponse({
      current_message: message,
      additional_info: additionalInfo,
      settings_id: settingsId
    });
    
    console.log(`Nouvelle discussion créée avec succès. ID: ${response.discussion_id}`);
    return response;
  } catch (error) {
    console.error("Échec de la création d'une nouvelle discussion:", error);
    throw error;
  }
};

/**
 * Continue une discussion existante
 * @param discussionId ID de la discussion
 * @param message Le message de l'utilisateur
 * @param additionalInfo Informations supplémentaires (optionnel)
 * @param settingsId ID des paramètres à utiliser (optionnel)
 * @returns La réponse générée avec les IDs de contexte et de discussion
 */
export const continueDiscussion = async (
  discussionId: string,
  message: string,
  additionalInfo?: string,
  settingsId?: string
): Promise<GenerateResponse> => {
  console.log(`Continuation de la discussion ${discussionId} avec le message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  console.log(`Paramètres utilisés: ${settingsId || 'aucun'}`);
  
  try {
    const response = await generateResponse({
      discussion_id: discussionId,
      current_message: message,
      additional_info: additionalInfo,
      settings_id: settingsId
    });
    
    console.log(`Réponse générée avec succès pour la discussion ${discussionId}`);
    return response;
  } catch (error) {
    console.error(`Échec de la continuation de la discussion ${discussionId}:`, error);
    throw error;
  }
};
