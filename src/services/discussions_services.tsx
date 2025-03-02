// Modifier l'URL pour utiliser l'adresse Docker
const API_BASE_URL = "http://localhost:8000"; // URL du backend Docker

// 🔹 Récupérer toutes les discussions
export const fetchDiscussions = async () => {
  try {
    console.log("Tentative de récupération des discussions...");
    const response = await fetch(`${API_BASE_URL}/discussions`);
    if (!response.ok) {
      console.error(`Erreur lors de la récupération des discussions: ${response.status}`);
      throw new Error(`Erreur lors de la récupération des discussions: ${response.status}`);
    }
    const data = await response.json();
    console.log("Discussions récupérées:", data);
    
    // Vérifier si data est un tableau (format direct) ou s'il contient une propriété discussions
    if (Array.isArray(data)) {
      return data;
    }
    return data.discussions || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des discussions:", error);
    return [];
  }
};

// 🔹 Récupérer une discussion spécifique
export const fetchDiscussion = async (discussionId: string) => {
  try {
    console.log(`Tentative de récupération de la discussion ${discussionId}...`);
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la récupération de la discussion: ${response.status} - ${errorText}`);
      throw new Error(`Erreur lors de la récupération de la discussion: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Discussion ${discussionId} récupérée:`, data);
    return data.discussion;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la discussion ${discussionId}:`, error);
    throw error;
  }
};

// 🔹 Créer une nouvelle discussion
export const createDiscussion = async (title: string = "Nouvelle discussion") => {
  try {
    console.log(`Tentative de création d'une nouvelle discussion avec le titre: ${title}...`);
    
    const response = await fetch(`${API_BASE_URL}/discussions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        title: title
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la création de la discussion: ${response.status} - ${errorText}`);
      throw new Error(`Erreur lors de la création de la discussion: ${response.status}`);
    }
    const data = await response.json();
    console.log("Nouvelle discussion créée:", data);
    return data.id;
  } catch (error) {
    console.error("Erreur lors de la création de la discussion:", error);
    throw error;
  }
};


// 🔹 Supprimer une discussion
export const deleteDiscussion = async (discussionId: string) => {
  try {
    console.log(`Tentative de suppression de la discussion ${discussionId}...`);
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la suppression de la discussion: ${response.status} - ${errorText}`);
      throw new Error(`Erreur lors de la suppression de la discussion: ${response.status}`);
    }
    console.log(`Discussion ${discussionId} supprimée avec succès`);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la discussion ${discussionId}:`, error);
    throw error;
  }
};

// 🔹 Mettre à jour une discussion
export const updateDiscussion = async (discussionId: string, title: string) => {
  try {
    console.log(`Tentative de mise à jour de la discussion ${discussionId}...`);
    const response = await fetch(`${API_BASE_URL}/discussions/${discussionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: discussionId,
        title: title,
        created_at: new Date().toISOString()
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la mise à jour de la discussion: ${response.status} - ${errorText}`);
      throw new Error(`Erreur lors de la mise à jour de la discussion: ${response.status}`);
    }
    console.log(`Discussion ${discussionId} mise à jour avec succès`);
    return discussionId;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la discussion ${discussionId}:`, error);
    throw error;
  }
};
