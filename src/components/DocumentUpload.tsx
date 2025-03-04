import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Paper
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { UploadProgress, uploadMultipleFiles } from '../services/upload_service';

interface DocumentUploadProps {
  open: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/json': ['.json']
};

export default function DocumentUpload({ open, onClose }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Le fichier ${file.name} dépasse la taille maximale autorisée (10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: true
  });

  const handleRemoveFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setCurrentTask('Préparation de l\'upload...');

    try {
      await uploadMultipleFiles(files, (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [progress.fileName]: progress
        }));

        // Mise à jour du texte de la tâche en cours
        if (progress.status === 'uploading') {
          setCurrentTask(`Upload en cours : ${progress.fileName} (${Math.round(progress.progress)}%)`);
        } else if (progress.status === 'completed') {
          setCurrentTask(`Traitement du fichier : ${progress.fileName}`);
        } else if (progress.status === 'error') {
          setCurrentTask(`Erreur lors du traitement de : ${progress.fileName}`);
        }
      });

      // Réinitialiser après un succès
      setFiles([]);
      setUploadProgress({});
      setCurrentTask('');
      onClose();
    } catch (err) {
      setError('Une erreur est survenue lors de l\'upload des fichiers');
      console.error('Erreur d\'upload:', err);
      setCurrentTask('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileStatusIcon = (fileName: string) => {
    const progress = uploadProgress[fileName];
    if (!progress) return null;

    switch (progress.status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  // Calcul de la progression globale
  const getOverallProgress = () => {
    if (files.length === 0) return 0;
    const totalProgress = Object.values(uploadProgress).reduce((acc, curr) => acc + curr.progress, 0);
    return totalProgress / files.length;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Déposer des Documents</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Paper
            {...getRootProps()}
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Déposez les fichiers ici...'
                : 'Glissez-déposez des fichiers ici, ou cliquez pour sélectionner'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Formats acceptés : PDF, TXT, JSON (max 10MB)
            </Typography>
          </Paper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isUploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={getOverallProgress()}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              {currentTask}
            </Typography>
          </Box>
        )}

        {files.length > 0 && (
          <List>
            {files.map((file) => (
              <ListItem key={file.name} divider>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {uploadProgress[file.name] && (
                      <Box sx={{ width: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress[file.name].progress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                    {getFileStatusIcon(file.name)}
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(file.name)}
                      disabled={isUploading}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? 'Upload en cours...' : 'Uploader'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 