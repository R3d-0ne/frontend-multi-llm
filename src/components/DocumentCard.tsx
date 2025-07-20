import { Card, CardMedia, CardContent, Box, Typography, useTheme, alpha, Stack, Chip, Popper, Paper } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { DocumentResponse } from "../types/document";
import { formatFileName, getDocumentId, getDocumentImage } from "../utils/documentUtils";
import { useState } from "react";

interface DocumentCardProps {
  document: DocumentResponse;
  onClick: (document: DocumentResponse) => void;
  index: number;
}

export default function DocumentCard({ document: doc, onClick, index }: DocumentCardProps) {
  const theme = useTheme();
  const image = getDocumentImage(doc);
  const llmEntities = doc.metadata?.llm_entities || [];
  const llmSummary = doc.metadata?.llm_summary || '';
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[1],
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: theme.shadows[8],
          '& .MuiCardMedia-root': {
            transform: 'scale(1.5)',
          }
        }
      }}
      onClick={() => onClick(doc)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
        {image ? (
          <CardMedia
            component="img"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              bgcolor: '#f5f5f5',
              transition: 'transform 0.3s ease'
            }}
            image={image.startsWith('data:') ? image : `data:image/png;base64,${image}`}
            alt={doc.title || `Document ${index + 1}`}
            onError={(e) => {
              console.error("Erreur de chargement de l'image:", e);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const icon = document.createElement('div');
                icon.style.display = 'flex';
                icon.style.alignItems = 'center';
                icon.style.justifyContent = 'center';
                icon.style.width = '100%';
                icon.style.height = '100%';
                icon.style.backgroundColor = '#f5f5f5';
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="#3f51b5" opacity="0.7"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';
                parent.appendChild(icon);
              }
            }}
          />
        ) : (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
          </Box>
        )}
      </Box>
      <CardContent sx={{ 
        py: 1, 
        px: 2,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {doc.metadata?.filename && (
          <Typography variant="body2" align="center" noWrap>
            {formatFileName(doc.metadata.filename)}
          </Typography>
        )}
      </CardContent>

      <Popper 
        open={open && (!!llmSummary || llmEntities.length > 0)} 
        anchorEl={anchorEl}
        placement="right"
        sx={{ zIndex: 1300 }}
      >
        <Paper 
          sx={{ 
            p: 2, 
            maxWidth: 300,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[8],
            borderRadius: 2,
            mt: 1,
            ml: 1
          }}
        >
          {llmSummary && (
            <Typography 
              variant="body2" 
              sx={{ 
                fontStyle: 'italic',
                color: 'text.secondary',
                fontSize: '0.85rem',
                mb: llmEntities.length > 0 ? 2 : 0
              }}
            >
              {llmSummary}
            </Typography>
          )}

          {llmEntities.length > 0 && (
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              justifyContent: 'flex-end'
            }}>
              {llmEntities.slice(0, 5).map((entity: any, idx: number) => (
                <Chip
                  key={idx}
                  label={entity.text}
                  size="small"
                  sx={{ 
                    height: 24,
                    fontSize: '0.75rem',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Popper>
    </Card>
  );
}