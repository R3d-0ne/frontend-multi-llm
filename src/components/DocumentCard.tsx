import { Card, CardMedia, CardContent, Box, Typography, useTheme, alpha } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { DocumentResponse } from "../types/document";
import { formatFileName, getDocumentId, getDocumentImage } from "../utils/documentUtils";

interface DocumentCardProps {
  document: DocumentResponse;
  onClick: (document: DocumentResponse) => void;
  index: number;
}

export default function DocumentCard({ document: doc, onClick, index }: DocumentCardProps) {
  const theme = useTheme();
  const image = getDocumentImage(doc);

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
        px: 1, 
        flexGrow: 1,
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {doc.metadata?.filename && (
          <Typography variant="body2" align="center" noWrap>
            {formatFileName(doc.metadata.filename)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}