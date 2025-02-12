const API_URL = "http://localhost:8000/history"; // Assurez-vous que le backend tourne sur ce port

export interface HistoryEntry {
  id: string;
  discussion_id: string;
  question: string;
  response: string;
  context_id?: string | null;
}

/**
 * 🔹 Ajoute un échange à l'historique.
 */
export async function addHistory(
  discussion_id: string,
  question: string,
  response: string,
  context_id?: string
): Promise<HistoryEntry> {
  const payload = { discussion_id, question, response, context_id };

  const res = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Erreur lors de l'ajout à l'historique");

  return res.json();
}

/**
 * 🔹 Récupère l'ensemble de l'historique.
 */
export async function listHistory(): Promise<HistoryEntry[]> {
  const res = await fetch(`${API_URL}/`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Erreur lors de la récupération de l'historique");

  return res.json();
}

/**
 * 🔹 Récupère un échange spécifique via son `history_id`.
 */
export async function getHistory(history_id: string): Promise<HistoryEntry> {
  const res = await fetch(`${API_URL}/${history_id}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Échange introuvable");

  return res.json();
}

/**
 * 🔹 Supprime un échange spécifique via son `history_id`.
 */
export async function deleteHistory(history_id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/${history_id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Erreur lors de la suppression de l'historique");

  return res.json();
}
