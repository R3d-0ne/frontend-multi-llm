import { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, IconButton, Drawer, Box, List, ListItem, ListItemText, ListItemButton, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { fetchDiscussions } from "../services/discussions_services"; // 🔹 Import du service API

export default function SideBar({ onSelectConversation, modelName }) {
  const [open, setOpen] = useState(false);
  const [discussions, setDiscussions] = useState<{ id: string; summary: string }[]>([]); // 🔹 Initialisation correcte

  const toggleDrawer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        const discussionsData = await fetchDiscussions();
        setDiscussions(discussionsData || []); // 🔹 Sécurisation de la valeur pour éviter `null`
      } catch (error) {
        console.error("Erreur lors du chargement des discussions:", error);
        setDiscussions([]); // 🔹 En cas d'erreur, éviter un état `null`
      }
    };

    loadDiscussions();
  }, []);

  return (
    <>
      {/* Barre d'application fixe avec une hauteur normale */}
      <AppBar position="fixed" sx={{ bgcolor: "background.default", boxShadow: 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {modelName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Espace réservé pour éviter que le contenu soit caché sous l'AppBar */}
      <Box sx={{ mt: "64px" }}>
        <Drawer anchor="left" open={open} onClose={toggleDrawer}>
          <Box
            sx={{
              width: 300,
              height: "100vh",
              bgcolor: "background.default",
              boxShadow: 3,
              overflowY: "auto",
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Conversations
            </Typography>
            <Divider />
            <List>
                <>
                {discussions.length > 0 ? (
                discussions.map((discussion, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton onClick={() => onSelectConversation(discussion.id)}>
                      <ListItemText primary={`Discussion ${index + 1}`} secondary={discussion.summary} />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Aucune discussion disponible
                </Typography>
              )}

                </>

            </List>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
