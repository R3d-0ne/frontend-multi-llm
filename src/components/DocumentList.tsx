import { Grid, Paper, Typography, Button, Box, CircularProgress, Alert, alpha, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DocumentResponse } from "../types/document";
import DocumentCard from "./DocumentCard";

interface DocumentListProps {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  onDocumentClick: (doc: DocumentResponse) => void;
  onAddClick: () => void;
}

export default function DocumentList({ 
  documents, 
  loading, 
  error, 
  onDocumentClick, 
  onAddClick 
}: DocumentListProps) {
  const theme = useTheme();

  if (loading) {
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
    </Grid>
  );
} 