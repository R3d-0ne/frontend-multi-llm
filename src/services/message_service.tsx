const API_BASE_URL = "http://localhost:8000"; // URL du backend Docker

// Interface pour un message
interface Message {
  id?: string;
  discussion_id: string;
  sender: string;
  text: string;
  timestamp?: string;
  [key: string]: any;
}

// Interface pour la réponse d'un message
interface MessageResponse {
  id?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Envoie un message
 * @param message Les données du message à envoyer
 * @returns Un message de confirmation et l'ID du message
 */
export const sendMessage = async (message: Message): Promise<MessageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de l'envoi du message: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
};

/**
 * Met à jour un message existant
 * @param messageId L'ID du message à mettre à jour
 * @param newData Les nouvelles données du message
 * @returns Un message de confirmation
 */
export const updateMessage = async (messageId: string, newData: Partial<Message>): Promise<MessageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour du message: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du message:", error);
    throw error;
  }
};

/**
 * Supprime un message spécifique
 * @param messageId L'ID du message à supprimer
 * @returns Un message de confirmation
 */
export const deleteMessage = async (messageId: string): Promise<MessageResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression du message: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la suppression du message:", error);
    throw error;
  }
};

/**
 * Récupère tous les messages d'une discussion
 * @param discussionId L'ID de la discussion
 * @returns La liste des messages de la discussion
 */
export const getMessagesByDiscussion = async (discussionId: string): Promise<Message[]> => {
  try {
    console.log(`Récupération des messages pour la discussion: ${discussionId}`);
    const response = await fetch(`${API_BASE_URL}/messages?discussion_id=${discussionId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la récupération des messages: ${response.status}`, errorText);
      throw new Error(`Erreur lors de la récupération des messages: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Messages récupérés:", data);
    
    // Vérifier si data est un tableau (format direct) ou s'il contient une propriété messages
    if (Array.isArray(data)) {
      return data;
    }
    return data.messages || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    throw error;
  }
}; 