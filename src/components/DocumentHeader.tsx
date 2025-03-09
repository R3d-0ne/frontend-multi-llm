import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface DocumentHeaderProps {
  onAddClick: () => void;
}

export default function DocumentHeader({ onAddClick }: DocumentHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Documents
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Ajouter un document
      </Button>
    </Box>
  );
} 