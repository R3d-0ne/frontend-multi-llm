import { Grid, Paper, Typography, Button, Box, CircularProgress, Alert, alpha, useTheme, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DocumentResponse } from "../types/document";
import DocumentCard from "./DocumentCard";

interface DocumentListProps {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  onDocumentClick: (doc: DocumentResponse) => void;
  onAddClick: () => void;
  showSkeletons?: boolean;
  skeletonCount?: number;
}

export default function DocumentList({ 
  documents, 
  loading, 
  error, 
  onDocumentClick, 
  onAddClick,
  showSkeletons = false,
  skeletonCount = 6
}: DocumentListProps) {
  const theme = useTheme();

  // Composant de skeleton pour le chargement
  const DocumentSkeleton = () => (
    <Grid item xs={6} sm={4} md={3} lg={2}>
      <Paper sx={{ p: 2, height: 200 }}>
        <Skeleton variant="rectangular" height={120} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={16} width="60%" />
      </Paper>
    </Grid>
  );

  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Aucun document disponible
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
        >
          Ajouter un document
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {documents.map((doc, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={doc.id || index}>
          <DocumentCard
            document={doc}
            onClick={onDocumentClick}
            index={index}
          />
        </Grid>
      ))}
      
      {/* Afficher les skeletons pour le chargement de plus de documents */}
      {showSkeletons && Array.from({ length: skeletonCount }).map((_, index) => (
        <DocumentSkeleton key={`skeleton-${index}`} />
      ))}
    </Grid>
  );
} 