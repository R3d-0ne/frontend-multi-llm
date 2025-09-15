import { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { deleteDocument } from "../services/document_service";
import { DocumentResponse } from "../types/document";
import { useDocuments } from "../hooks/useDocuments";
import DocumentHeader from "./DocumentHeader";
import DocumentList from "./DocumentList";
import DocumentViewer from "./DocumentViewer";
import DocumentUpload from "./DocumentUpload";

interface DocumentsProps {
  selectedDocument?: any;
}

export default function Documents({ selectedDocument: propSelectedDocument }: DocumentsProps = {}) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);
  
  // Utiliser le hook personnalisé pour la gestion des documents
  const {
    documents,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    refresh,
    isLoadingMore
  } = useDocuments({ limit: 20, enableCache: true });

  // Gérer le document sélectionné passé en prop
  useEffect(() => {
    if (propSelectedDocument) {
      // Chercher le document correspondant dans la liste
      const matchingDoc = documents.find(doc => 
        doc.id === propSelectedDocument.id || 
        doc.title === propSelectedDocument.title
      );
      
      if (matchingDoc) {
        setSelectedDocument(matchingDoc);
      } else {
        // Si le document n'est pas trouvé dans la liste, créer un DocumentResponse à partir des données
        const documentResponse: DocumentResponse = {
          id: propSelectedDocument.id || '',
          title: propSelectedDocument.title,
          metadata: propSelectedDocument.metadata || {}
        };
        setSelectedDocument(documentResponse);
      }
    }
  }, [propSelectedDocument, documents]);

  // Gérer la suppression d'un document
  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDocument(id);
        refresh(); // Rafraîchir la liste après suppression
      } catch (err) {
        console.error("Erreur lors de la suppression du document:", err);
      }
    }
  };

  // Gérer la fermeture du dialogue d'upload
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    refresh(); // Rafraîchir la liste après upload
  };

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto", width: "100%" }}>
      <DocumentHeader onAddClick={() => setUploadDialogOpen(true)} />

      {/* Affichage du nombre total de documents */}
      {total > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {documents.length} document{documents.length > 1 ? 's' : ''} sur {total}
        </Typography>
      )}

      <DocumentList
        documents={documents}
        loading={loading}
        error={error}
        onDocumentClick={setSelectedDocument}
        onAddClick={() => setUploadDialogOpen(true)}
        showSkeletons={isLoadingMore}
        skeletonCount={6}
      />

      {/* Bouton pour charger plus de documents */}
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={isLoadingMore}
            startIcon={isLoadingMore ? <CircularProgress size={20} /> : null}
          >
            {isLoadingMore ? 'Chargement...' : 'Charger plus de documents'}
          </Button>
        </Box>
      )}

      <DocumentViewer
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
        onDelete={handleDeleteDocument}
      />

      <DocumentUpload
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
      />
    </Box>
  );
} 