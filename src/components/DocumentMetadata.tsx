import { Box, Typography } from "@mui/material";
import { DocumentResponse } from "../types/document";
import { MetadataTag, METADATA_COLORS } from "../types/metadata";
import { formatDate, getDocumentId, extractMetadataTags, extractBestEntities } from "../utils/documentUtils";

interface DocumentMetadataProps {
  document: DocumentResponse;
}

export default function DocumentMetadata({ document: doc }: DocumentMetadataProps) {
  const tags = extractMetadataTags(doc);
  const bestEntities = extractBestEntities(doc);

  const formatScore = (score?: number) => {
    if (score === undefined) return '';
    return `${Math.round(score * 100)}%`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informations générales
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gap: 2,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <MetadataField label="ID" value={getDocumentId(doc)} />
          {doc.title && <MetadataField label="Titre" value={doc.title} />}
          {doc.filename && <MetadataField label="Nom du fichier" value={doc.filename} />}
          {doc.upload_date && <MetadataField label="Date de dépôt" value={formatDate(doc.upload_date)} />}
          {doc.source && <MetadataField label="Source" value={doc.source} />}
          {doc.created_at && <MetadataField label="Date d'ajout" value={formatDate(doc.created_at)} />}
        </Box>
      </Box>

      {bestEntities.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Entités principales
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {bestEntities.map((tag, index) => (
              <Box
                key={`${tag.category}-${tag.text}-${index}`}
                sx={{
                  bgcolor: `${METADATA_COLORS[tag.category]}15`,
                  color: METADATA_COLORS[tag.category],
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: `1px solid ${METADATA_COLORS[tag.category]}30`
                }}
              >
                <span>{tag.text}</span>
                {tag.score && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      opacity: 0.7,
                      fontWeight: 600
                    }}
                  >
                    {formatScore(tag.score)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {tags.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Tous les tags
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {tags.map((tag, index) => (
              <Box
                key={`${tag.category}-${tag.text}-${index}`}
                sx={{
                  bgcolor: `${METADATA_COLORS[tag.category]}15`,
                  color: METADATA_COLORS[tag.category],
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: `1px solid ${METADATA_COLORS[tag.category]}30`
                }}
              >
                <span>{tag.text}</span>
                {tag.score && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      opacity: 0.7,
                      fontWeight: 600
                    }}
                  >
                    {formatScore(tag.score)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface MetadataFieldProps {
  label: string;
  value: string;
}

function MetadataField({ label, value }: MetadataFieldProps) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">
        {value}
      </Typography>
    </Box>
  );
} 