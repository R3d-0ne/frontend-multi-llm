import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { listDocuments, deleteDocument } from "../services/document_service";
import { DocumentResponse } from "../types/document";
import DocumentHeader from "./DocumentHeader";
import DocumentList from "./DocumentList";
import DocumentViewer from "./DocumentViewer";
import DocumentUpload from "./DocumentUpload";

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null);

  // Charger les documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const docs = await listDocuments();
        console.log("Documents récupérés:", JSON.stringify(docs, null, 2));
        setDocuments(docs);
      } catch (err) {
        console.error("Erreur lors du chargement des documents:", err);
        setError("Impossible de charger les documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [refreshTrigger]);

  // Gérer la suppression d'un document
  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDocument(id);
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Erreur lors de la suppression du document:", err);
        setError("Impossible de supprimer le document");
      }
    }
  };

  // Gérer la fermeture du dialogue d'upload
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto", width: "100%" }}>
      <DocumentHeader onAddClick={() => setUploadDialogOpen(true)} />

      <DocumentList
        documents={documents}
        loading={loading}
        error={error}
        onDocumentClick={setSelectedDocument}
        onAddClick={() => setUploadDialogOpen(true)}
      />

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