import { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { createDiscussion, updateDiscussion } from '../services/discussions_services';

interface NewDiscussionButtonProps {
  onDiscussionCreated: (discussionId: string) => void;
  mode?: 'create' | 'update';
  discussionId?: string;
  initialTitle?: string;
  onClose?: () => void;
}

const NewDiscussionButton = ({ 
  onDiscussionCreated, 
  mode = 'create',
  discussionId = '',
  initialTitle = '',
  onClose
}: NewDiscussionButtonProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(mode === 'update');
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'update') {
      setTitle(initialTitle);
      setOpen(true);
    }
  }, [mode, initialTitle]);

  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    if (mode === 'create') {
      setTitle('');
    }
    setError(null);
    if (onClose) {
      onClose();
    }
  };

  const handleAction = async () => {
    if (!title.trim()) {
      setError('Veuillez entrer un titre pour la discussion');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'create') {
        console.log("Tentative de création d'une nouvelle discussion avec le titre:", title);
        const discussionId = await createDiscussion(title);
        if (!discussionId) {
          throw new Error("Réponse vide du serveur");
        }
        console.log("Discussion créée avec succès, ID:", discussionId);
        onDiscussionCreated(discussionId);
      } else {
        console.log("Tentative de mise à jour de la discussion avec le titre:", title);
        await updateDiscussion(discussionId, title);
        console.log("Discussion mise à jour avec succès");
        onDiscussionCreated(discussionId);
      }
      handleClose();
    } catch (err) {
      console.error('Erreur lors de l\'opération sur la discussion:', err);
      let errorMessage = "Erreur inconnue";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(`Erreur lors de l'opération sur la discussion: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip title={mode === 'create' ? "Nouvelle discussion" : "Modifier la discussion"}>
        <IconButton
          color="primary"
          onClick={handleClickOpen}
          size="medium"
          sx={{
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          {mode === 'create' ? <AddIcon /> : <EditIcon />}
        </IconButton>
      </Tooltip>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            bgcolor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle 
          component="div"
          sx={{ 
            pb: 1, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography 
            variant="h6" 
            component="h2" 
            fontWeight={600}
          >
            {mode === 'create' ? 'Créer une nouvelle discussion' : 'Modifier la discussion'}
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose} 
            aria-label="close"
            sx={{ 
              borderRadius: 1.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.action.active, 0.08)
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Titre de la discussion"
            type="text"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            error={!title.trim() && !!error}
            helperText={!title.trim() && !!error ? "Ce champ est requis" : ""}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5
              }
            }}
          />
          
          {error && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 1.5, 
                borderRadius: 1.5, 
                bgcolor: alpha(theme.palette.error.main, 0.08)
              }}
            >
              <Typography color="error.main" variant="body2">
                {error}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Annuler
          </Button>
          <Box sx={{ position: 'relative' }}>
            <Button 
              onClick={handleAction} 
              variant="contained" 
              color="primary"
              disabled={loading || !title.trim()}
              sx={{ 
                borderRadius: 1.5,
                px: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              {mode === 'create' ? 'Créer' : 'Mettre à jour'}
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error && !open} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 1.5,
            boxShadow: 3
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NewDiscussionButton; 