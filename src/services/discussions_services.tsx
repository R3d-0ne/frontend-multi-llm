import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // 🔹 Mettre l'URL de ton backend

// 🔹 Récupérer toutes les discussions
export const fetchDiscussions = async () => {
  const response = await axios.get(`${API_BASE_URL}/discussions`);
  return response.data.discussions;
};

// 🔹 Récupérer une discussion spécifique
export const fetchDiscussion = async (discussionId: string) => {
  const response = await axios.get(`${API_BASE_URL}/discussions/${discussionId}`);
  return response.data.discussion;
};

// 🔹 Créer une nouvelle discussion
export const createDiscussion = async (contextId: string) => {
  const response = await axios.post(`${API_BASE_URL}/discussions`, { context_id: contextId });
  return response.data.discussion_id;
};

// 🔹 Mettre à jour le résumé d'une discussion
export const updateSummary = async (discussionId: string, question: string, responseText: string) => {
  await axios.patch(`${API_BASE_URL}/discussions/${discussionId}/summary`, {
    question,
    response: responseText
  });
};

// 🔹 Supprimer une discussion
export const deleteDiscussion = async (discussionId: string) => {
  await axios.delete(`${API_BASE_URL}/discussions/${discussionId}`);
};
