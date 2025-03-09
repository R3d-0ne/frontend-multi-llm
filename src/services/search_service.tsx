const API_BASE_URL = "http://localhost:8000"; // URL du backend Docker

// Interface pour les filtres de recherche
export interface SearchFilters {
  has_tables?: boolean;
  has_named_entities?: boolean;
  has_dates?: boolean;
  has_money_amounts?: boolean;
  has_emails?: boolean;
  has_phone_numbers?: boolean;
  upload_date_range?: {
    start: string;
    end: string;
  };
  filename_contains?: string;
}

// Interface pour la requête de recherche interne
export interface InternalSearchRequest {
  query: string;
  discussion_id?: string;
  settings_id?: string;
  limit?: number;
  filters?: SearchFilters;
}

// Interface pour un document dans les résultats
export interface DocumentResult {
  id: string;
  score: number;
  payload: {
    document_id: string;
    filename: string;
    upload_date: string;
    cleaned_text: string;
    [key: string]: any; // Autres champs dynamiques
  };
}

// Interface pour la réponse de recherche interne
export interface InternalSearchResponse {
  response: string;
  discussion_id: string;
  context_id: string;
  documents_used: Array<{
    id: string;
    title: string;
    score: number;
    text: string;
  }>;
  search_results: DocumentResult[];
}

// Interface pour la requête de recherche standard
export interface SearchRequest {
  query: string;
  limit?: number;
  filters?: SearchFilters;
  use_llm_reranking?: boolean;
  boost_keywords?: boolean;
  generate_answer?: boolean;
}

// Interface pour la réponse de recherche standard
export interface SearchResponse {
  results: DocumentResult[];
  total_found: number;
  query: string;
  generated_answer?: string;
}

/**
 * Effectue une recherche interne en utilisant le service de génération
 * @param request Les paramètres de la requête
 * @returns La réponse générée avec le contexte des documents
 */
export const searchInternal = async (request: InternalSearchRequest): Promise<InternalSearchResponse> => {
  try {
    console.log("Envoi de la requête de recherche interne:", request);
    const response = await fetch(`${API_BASE_URL}/search/internal/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la recherche interne: ${response.status}`, errorText);
      throw new Error(`Erreur lors de la recherche interne: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Réponse de recherche interne:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la recherche interne:", error);
    throw error;
  }
};

/**
 * Effectue une recherche standard dans les documents
 * @param request Les paramètres de la requête
 * @returns Les résultats de recherche
 */
export const search = async (request: SearchRequest): Promise<SearchResponse> => {
  try {
    console.log("Envoi de la requête de recherche standard:", request);
    const response = await fetch(`${API_BASE_URL}/search/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la recherche: ${response.status}`, errorText);
      throw new Error(`Erreur lors de la recherche: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Résultats de recherche:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    throw error;
  }
};

/**
 * Effectue une recherche simple
 * @param query La requête de recherche
 * @param limit Nombre maximum de résultats
 * @param generateAnswer Génère une réponse basée sur les résultats
 * @returns Les résultats de recherche
 */
export const searchSimple = async (
  query: string,
  limit: number = 5,
  generateAnswer: boolean = false
): Promise<SearchResponse> => {
  try {
    console.log(`Recherche simple pour: "${query}" (limite: ${limit}, génération: ${generateAnswer})`);
    const url = new URL(`${API_BASE_URL}/search/simple`);
    url.searchParams.append('q', query);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('generate_answer', generateAnswer.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors de la recherche simple: ${response.status}`, errorText);
      throw new Error(`Erreur lors de la recherche simple: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Résultats de recherche simple:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la recherche simple:", error);
    throw error;
  }
}; 