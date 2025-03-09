export interface DocumentResponse {
  document_id?: string;
  id?: string;
  title?: string;
  source?: string;
  created_at?: string;
  message?: string;
  path?: string;
  image?: string;
  metadata?: {
    [key: string]: any;
  };
  [key: string]: any;
} 