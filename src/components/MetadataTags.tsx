import React from 'react';
import { Box, Chip, Typography, Tooltip, useTheme } from '@mui/material';
import { MetadataTag, METADATA_COLORS } from '../types/metadata';

interface MetadataTagsProps {
  tags: MetadataTag[];
  showCategories?: boolean;
}

const MetadataTags: React.FC<MetadataTagsProps> = ({ tags, showCategories = false }) => {
  const theme = useTheme();

  // Grouper les tags par catégorie
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, MetadataTag[]>);

  // Fonction pour formater le score
  const formatScore = (score?: number) => {
    if (score === undefined) return '';
    return `${Math.round(score * 100)}%`;
  };

  // Fonction pour rendre un tag
  const renderTag = (tag: MetadataTag, index: number) => {
    const chipContent = (
      <Chip
        key={`${tag.text}-${index}`}
        label={tag.text}
        size="small"
        sx={{
          backgroundColor: `${METADATA_COLORS[tag.category]}15`,
          color: METADATA_COLORS[tag.category],
          borderRadius: 1,
          '&:hover': {
            backgroundColor: `${METADATA_COLORS[tag.category]}25`,
          }
        }}
      />
    );

    return tag.score ? (
      <Tooltip 
        key={`${tag.text}-${index}`}
        title={`Score de confiance: ${formatScore(tag.score)}`}
        arrow
      >
        {chipContent}
      </Tooltip>
    ) : chipContent;
  };

  if (tags.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Aucune métadonnée disponible
      </Typography>
    );
  }

  return (
    <Box>
      {showCategories ? (
        // Affichage groupé par catégorie
        Object.entries(groupedTags).map(([category, categoryTags]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1,
                color: METADATA_COLORS[category as keyof typeof METADATA_COLORS],
                textTransform: 'capitalize'
              }}
            >
              {category}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categoryTags.map((tag, index) => renderTag(tag, index))}
            </Box>
          </Box>
        ))
      ) : (
        // Affichage simple sans groupement
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {tags.map((tag, index) => renderTag(tag, index))}
        </Box>
      )}
    </Box>
  );
};

export default MetadataTags; 