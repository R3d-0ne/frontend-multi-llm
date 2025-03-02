const API_BASE_URL = "http://localhost:8000"; // URL du backend Docker

// Interface pour les paramètres
interface Settings {
  name: string;
  content: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  [key: string]: any;
}

// Interface pour la réponse des paramètres
interface SettingsResponse {
  document_id?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Récupère tous les paramètres disponibles
 * @returns La liste des paramètres
 */
export const getSettings = async (): Promise<Settings[]> => {
  try {
    console.log("Récupération des paramètres...");
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la récupération des paramètres: ${response.status} - ${errorText}`);
      throw new Error(`Erreur lors de la récupération des paramètres: ${response.status}`);
    }
    const data = await response.json();
    console.log("Paramètres récupérés:", data);
    
    // Vérifier si data est un tableau (format direct) ou s'il contient une propriété settings
    if (Array.isArray(data)) {
      return data;
    }
    return data.settings || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return [];
  }
};

/**
 * Récupère des paramètres spécifiques par leur ID
 * @param settingsId L'ID des paramètres à récupérer
 * @returns Les données des paramètres
 */
export const getSettingsById = async (settingsId: string): Promise<Settings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${settingsId}`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des paramètres: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    throw error;
  }
};

/**
 * Crée de nouveaux paramètres
 * @param settings Les données des paramètres à créer
 * @returns Un message de confirmation et l'ID des paramètres créés
 */
export const createSettings = async (settings: Settings): Promise<SettingsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la création des paramètres: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la création des paramètres:", error);
    throw error;
  }
};

/**
 * Met à jour des paramètres existants
 * @param settingsId L'ID des paramètres à mettre à jour
 * @param settings Les nouvelles données des paramètres
 * @returns Un message de confirmation
 */
export const updateSettings = async (settingsId: string, settings: Settings): Promise<SettingsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${settingsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour des paramètres: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    throw error;
  }
};

/**
 * Supprime des paramètres spécifiques
 * @param settingsId L'ID des paramètres à supprimer
 * @returns Un message de confirmation
 */
export const deleteSettings = async (settingsId: string): Promise<SettingsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${settingsId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression des paramètres: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la suppression des paramètres:", error);
    throw error;
  }
};
