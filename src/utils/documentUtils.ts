import { DocumentResponse } from '../types/document';
import { MetadataTag, MetadataCategory } from '../types/metadata';

/**
 * Formate une date en format français
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Récupère l'ID du document
 */
export const getDocumentId = (doc: DocumentResponse): string => {
  return doc.id || doc.document_id || '';
};

/**
 * Récupère l'image du document depuis différentes sources possibles
 */
export const getDocumentImage = (doc: DocumentResponse): string | null => {
  // Vérifier si le document a une image directement
  if (doc.image) {
    return doc.image;
  }
  
  // Si pas d'image directe, essayer de la trouver dans les métadonnées
  if (doc.metadata) {
    // Cas 1: Si metadata est directement un tableau
    if (Array.isArray(doc.metadata)) {
      const pages = doc.metadata as any[];
      if (pages.length > 0 && pages[0].data) {
        return pages[0].data;
      }
    }
    
    // Cas 2: Si metadata a une propriété numérique
    const numericKeys = Object.keys(doc.metadata).filter(key => !isNaN(Number(key)));
    if (numericKeys.length > 0) {
      const firstKey = numericKeys[0];
      const metadata = doc.metadata as {[key: string]: any};
      if (metadata[firstKey] && metadata[firstKey].data) {
        return metadata[firstKey].data;
      }
    }
    
    // Cas 3: Si metadata a une propriété 'images'
    const metadata = doc.metadata as {[key: string]: any};
    if (metadata.images && Array.isArray(metadata.images) && metadata.images.length > 0) {
      if (metadata.images[0].data) {
        return metadata.images[0].data;
      }
    }
  }
  
  return null;
};

/**
 * Filtre les métadonnées pour supprimer les données volumineuses
 */
export const filterMetadata = (metadata: any): any => {
  if (!metadata) return {};
  
  const filteredMetadata: any = { ...metadata };
  
  const keysToRemove = [
    'embeddings', 'tokens', 'tokens_no_stopwords', 'stemmed_tokens', 
     'image', 'images'
  ];
  
  keysToRemove.forEach(key => {
    if (key in filteredMetadata) {
      delete filteredMetadata[key];
    }
  }); 
  
  if (Array.isArray(filteredMetadata)) {
    return filteredMetadata.map(item => {
      if (item && typeof item === 'object') {
        if ('data' in item) {
          return {
            ...item,
            data: item.data ? '[Image data]' : null
          };
        }
        return item;
      }
      return item;
    });
  }
  
  return filteredMetadata;
};

/**
 * Extrait et catégorise les métadonnées d'un document
 */
export const extractMetadataTags = (doc: DocumentResponse): MetadataTag[] => {
  const tags: MetadataTag[] = [];
  const metadata = doc.metadata;

  if (!metadata) return tags;

  // Fonction helper pour ajouter un tag
  const addTag = (text: string, category: MetadataCategory, score?: number) => {
    if (text && typeof text === 'string' && !tags.some(tag => tag.text === text)) {
      tags.push({ text, category, score });
    }
  };

  // Traitement des entités nommées de CamemBERT (named_entities_bert)
  if (metadata.named_entities_bert?.entities) {
    metadata.named_entities_bert.entities.forEach((entity: any) => {
      let category: MetadataCategory = 'autre';
      
      switch(entity.label) {
        case 'PER':
          category = 'personne';
          break;
        case 'LOC':
          category = 'lieu';
          break;
        case 'ORG':
          category = 'organisation';
          break;
        case 'DATE':
          category = 'date';
          break;
        default:
          category = 'entité';
      }
      
      addTag(entity.text, category, entity.score);
    });
  }


  // Traitement des dates extraites
  if (metadata.dates && Array.isArray(metadata.dates)) {
    metadata.dates.forEach(date => addTag(date, 'date'));
  }

  // Traitement des montants financiers
  if (metadata.money_amounts && Array.isArray(metadata.money_amounts)) {
    metadata.money_amounts.forEach(amount => addTag(amount, 'autre'));
  }

  // Traitement des pourcentages
  if (metadata.percentages && Array.isArray(metadata.percentages)) {
    metadata.percentages.forEach(percentage => addTag(percentage, 'autre'));
  }

  // Traitement des emails
  if (metadata.emails && Array.isArray(metadata.emails)) {
    metadata.emails.forEach(email => addTag(email, 'autre'));
  }

  // Traitement des numéros de téléphone
  if (metadata.phone_numbers && Array.isArray(metadata.phone_numbers)) {
    metadata.phone_numbers.forEach(phone => addTag(phone, 'autre'));
  }

  return tags;
};

/**
 * Extrait les meilleures entités de chaque catégorie
 */
export const extractBestEntities = (doc: DocumentResponse): MetadataTag[] => {
  const allTags = extractMetadataTags(doc);
  const bestByCategory = new Map<MetadataCategory, MetadataTag>();

  allTags.forEach(tag => {
    const currentBest = bestByCategory.get(tag.category);
    if (!currentBest || (tag.score && (!currentBest.score || tag.score > currentBest.score))) {
      bestByCategory.set(tag.category, tag);
    }
  });

  return Array.from(bestByCategory.values());
};

// Fonction pour formater le nom du fichier
export const formatFileName = (filename: string): string => {
  if (!filename) return '';
  return filename.split('.').slice(0, -1).join('.');
}; 