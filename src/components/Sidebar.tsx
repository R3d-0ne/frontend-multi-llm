import {useEffect, useState} from "react";
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
    CircularProgress,
    Tooltip,
    Menu,
    MenuItem,
    alpha,
    useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {fetchDiscussions, deleteDiscussion} from "../services/discussions_services";
import NewDiscussionButton from "./NewDiscussionButton";

// Interface pour les discussions
interface Discussion {
    id: string;
    payload?: {
        title?: string;
        text?: string;
    };
    vector?: any;
    [key: string]: any;
}

export default function SideBar({onSelectConversation, modelName}: {
    onSelectConversation: (id: string) => void;
    modelName: string
}) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
    const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const loadDiscussions = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Chargement des discussions...");
            const discussionsData = await fetchDiscussions();
            console.log("Discussions chargées:", discussionsData);
            setDiscussions(discussionsData || []);
        } catch (error) {
            console.error("Erreur lors du chargement des discussions:", error);
            setError("Impossible de charger les discussions");
            setDiscussions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDiscussions();
    }, []);

    // Fonction pour gérer la création d'une nouvelle discussion
    const handleDiscussionCreated = (discussionId: string) => {
        console.log("Nouvelle discussion créée:", discussionId);
        loadDiscussions();
        handleSelectConversation(discussionId);
        setOpen(true);
    };

    // Fonction pour obtenir le titre d'une discussion
    const getDiscussionTitle = (discussion: Discussion, index: number): string => {
        if (discussion.payload && discussion.payload.title) {
            return discussion.payload.title;
        }
        
        if (discussion.title) {
            return discussion.title;
        }
        
        return `Discussion ${index + 1}`;
    };

    // Fonction pour gérer la suppression d'une discussion
    const handleDeleteDiscussion = async () => {
        if (!selectedDiscussionId) return;
        
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
            try {
                setDeletingId(selectedDiscussionId);
                await deleteDiscussion(selectedDiscussionId);
                await loadDiscussions();
                
                // Si la discussion active est supprimée, réinitialiser
                if (activeDiscussionId === selectedDiscussionId) {
                    setActiveDiscussionId(null);
                }
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                setError("Impossible de supprimer la discussion");
            } finally {
                setDeletingId(null);
                handleMenuClose();
            }
        }
    };

    // Fonction pour gérer l'édition d'une discussion
    const handleEditDiscussion = (event: React.MouseEvent<HTMLElement>, discussionId: string) => {
        event.stopPropagation();
        setSelectedDiscussionId(discussionId);
        setEditDialogOpen(true);
        setMenuAnchorEl(null);
    };

    // Fonctions pour gérer le menu
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, discussionId: string) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedDiscussionId(discussionId);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };
    
    // Fonction pour gérer la sélection d'une conversation
    const handleSelectConversation = (id: string) => {
        setActiveDiscussionId(id);
        onSelectConversation(id);
    };

    return (
        <>
            {/* Barre d'application fixe avec un style moderne */}
            <AppBar 
                position="fixed" 
                sx={{
                    bgcolor: "background.paper", 
                    boxShadow: theme.shadows[3],
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
                elevation={0}
            >
                <Toolbar>
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        onClick={toggleDrawer} 
                        sx={{
                            mr: 2,
                            borderRadius: 1.5,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08)
                            }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            flexGrow: 1, 
                            fontWeight: 600,
                            letterSpacing: '0.02em'
                        }}
                    >
                        {modelName}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Espace réservé pour éviter que le contenu soit caché sous l'AppBar */}
            <Box sx={{mt: "64px"}}>
                <Drawer 
                    anchor="left" 
                    open={open} 
                    onClose={toggleDrawer}
                    PaperProps={{
                        sx: {
                            bgcolor: theme.palette.background.default,
                            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }
                    }}
                >
                    <Box
                        sx={{
                            width: 320,
                            height: "100vh",
                            bgcolor: "background.default",
                            boxShadow: 'none',
                            overflowY: "auto",
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600,
                                    letterSpacing: '0.02em'
                                }}
                            >
                                Conversations
                            </Typography>
                            
                            <NewDiscussionButton onDiscussionCreated={handleDiscussionCreated} />
                        </Box>
                        
                        <Divider sx={{ mb: 2, opacity: 0.6 }} />
                        
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                <CircularProgress size={28} color="primary" />
                            </Box>
                        )}
                        
                        {error && (
                            <Box 
                                sx={{ 
                                    my: 2, 
                                    p: 2, 
                                    borderRadius: 2, 
                                    bgcolor: alpha(theme.palette.error.main, 0.08)
                                }}
                            >
                                <Typography color="error.main" variant="body2">
                                    {error}
                                </Typography>
                            </Box>
                        )}
                        
                        <List sx={{ width: '100%', p: 0 }}>
                            {discussions.length > 0 ? (
                                discussions.map((discussion, index) => (
                                    <ListItem 
                                        key={discussion.id || index} 
                                        disablePadding
                                        onMouseEnter={() => setHoveredId(discussion.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        sx={{ 
                                            position: 'relative', 
                                            mb: 0.75,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <ListItemButton 
                                            onClick={() => handleSelectConversation(discussion.id)}
                                            sx={{ 
                                                borderRadius: 2,
                                                py: 1.5,
                                                transition: 'all 0.2s ease',
                                                bgcolor: activeDiscussionId === discussion.id 
                                                    ? alpha(theme.palette.primary.main, 0.12)
                                                    : 'transparent',
                                                '&:hover': {
                                                    bgcolor: activeDiscussionId === discussion.id 
                                                        ? alpha(theme.palette.primary.main, 0.16)
                                                        : alpha(theme.palette.action.hover, 0.1)
                                                }
                                            }}
                                        >
                                            <ListItemText 
                                                primary={
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: activeDiscussionId === discussion.id ? 600 : 500,
                                                            color: activeDiscussionId === discussion.id 
                                                                ? 'primary.main' 
                                                                : 'text.primary',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {getDiscussionTitle(discussion, index)}
                                                    </Typography>
                                                }
                                            />
                                            {hoveredId === discussion.id && (
                                                <Box component="span" sx={{ position: 'relative' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, discussion.id)}
                                                        sx={{ 
                                                            ml: 1,
                                                            color: 'text.secondary',
                                                            '&:hover': {
                                                                color: 'text.primary',
                                                                bgcolor: alpha(theme.palette.action.active, 0.12)
                                                            }
                                                        }}
                                                    >
                                                        <MoreVertIcon fontSize="small" />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={menuAnchorEl}
                                                        open={Boolean(menuAnchorEl) && selectedDiscussionId === discussion.id}
                                                        onClose={handleMenuClose}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'right',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'right',
                                                        }}
                                                        PaperProps={{
                                                            elevation: 3,
                                                            sx: {
                                                                minWidth: 150,
                                                                borderRadius: 1.5,
                                                                mt: 0.5,
                                                                p: 0.5,
                                                                '& .MuiMenuItem-root': {
                                                                    borderRadius: 1,
                                                                    mx: 0.5,
                                                                    my: 0.25,
                                                                    px: 1.5
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={(e) => handleEditDiscussion(e, discussion.id)}
                                                            sx={{ 
                                                                color: 'primary.main',
                                                                '&:hover': { 
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                                                                }
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                            Modifier
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={handleDeleteDiscussion}
                                                            sx={{ 
                                                                color: 'error.main',
                                                                '&:hover': { 
                                                                    bgcolor: alpha(theme.palette.error.main, 0.08)
                                                                }
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
                                                            Supprimer
                                                        </MenuItem>
                                                    </Menu>
                                                </Box>
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            ) : !loading && !error ? (
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        py: 4,
                                        px: 2,
                                        textAlign: 'center',
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                        border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`
                                    }}
                                >
                                    <AddCircleOutlineIcon 
                                        sx={{ 
                                            fontSize: 40, 
                                            color: 'text.secondary',
                                            opacity: 0.6,
                                            mb: 1
                                        }} 
                                    />
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        Aucune conversation disponible
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        color="text.disabled"
                                    >
                                        Créez une nouvelle conversation pour commencer
                                    </Typography>
                                </Box>
                            ) : null}
                        </List>
                    </Box>
                </Drawer>
            </Box>

            {/* Dialog de modification */}
            {editDialogOpen && selectedDiscussionId && (
                <NewDiscussionButton
                    mode="update"
                    discussionId={selectedDiscussionId}
                    initialTitle={discussions.find(d => d.id === selectedDiscussionId)?.payload?.title || ''}
                    onDiscussionCreated={(id) => {
                        loadDiscussions();
                        setEditDialogOpen(false);
                        setSelectedDiscussionId(null);
                    }}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setSelectedDiscussionId(null);
                    }}
                />
            )}
        </>
    );
}
