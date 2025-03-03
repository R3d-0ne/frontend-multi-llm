import {useState, useEffect} from "react";
import {Box, Button, Collapse, Grid, MenuItem, TextField, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MemoryIcon from "@mui/icons-material/Memory";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Icône du bouton Valider
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { createSettings, Settings } from "../services/settings_service";
import { List, ListItem, ListItemText } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

interface SettingsPanelProps {
    settings: any[];
    models: string[];
    modes: string[];
    onSettingChange?: (settingId: string) => void;
    selectedSettingId?: string | null;
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    onSettingsUpdated?: () => void;
}

export default function SettingsPanel({
    settings, 
    models, 
    modes, 
    onSettingChange,
    selectedSettingId,
    collapsed = false,
    onCollapse,
    onSettingsUpdated
}: SettingsPanelProps) {
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState({
        settings: "",
        model: "",
        mode: "",
    });
    const [newSettingDialogOpen, setNewSettingDialogOpen] = useState(false);
    const [newSetting, setNewSetting] = useState<Settings>({
        title: '',
        content: ''
    });
    const theme = useTheme();

    // Mettre à jour la valeur sélectionnée lorsque selectedSettingId change
    useEffect(() => {
        if (selectedSettingId) {
            setSelectedValues(prev => ({...prev, settings: selectedSettingId}));
        }
    }, [selectedSettingId]);

    const togglePanel = (tab: string) => {
        setSelectedTab(selectedTab === tab ? null : tab);
    };

    const toggleCollapse = () => {
        if (onCollapse) {
            onCollapse(!collapsed);
        }
        // Fermer le panneau sélectionné si on déplie
        if (collapsed) {
            setSelectedTab(null);
        }
    };

    const handleChange = (field: string) => (event: any) => {
        const newValue = event.target.value;
        setSelectedValues((prev) => ({...prev, [field]: newValue}));
        
        // Si le champ est "settings" et que onSettingChange est défini, appeler la fonction
        if (field === "settings" && onSettingChange) {
            onSettingChange(newValue);
        }
    };

    const handleListItemClick = (settingId: string) => {
        // Uniquement mettre à jour la sélection dans le state local
        setSelectedValues(prev => ({...prev, settings: settingId}));
    };

    const handleValidate = () => {
        // Appliquer le setting sélectionné à la discussion
        const settingToApply = selectedValues.settings;
        if (settingToApply && onSettingChange) {
            // On envoie l'ID du setting pour que le backend puisse le récupérer
            onSettingChange(settingToApply);
        }
    };

    const handleCreateSetting = async () => {
        try {
            await createSettings(newSetting);
            setNewSettingDialogOpen(false);
            setNewSetting({ title: '', content: '' });
            if (onSettingsUpdated) {
                onSettingsUpdated();
            }
        } catch (error) {
            console.error("Erreur lors de la création des paramètres:", error);
        }
    };

    // Fonction pour obtenir le nom d'un paramètre à partir de son ID
    const getSettingName = (settingId: string) => {
        const setting = settings.find(s => s.id === settingId);
        return setting?.payload?.title || "Paramètre sans titre";
    };

    if (collapsed) {
        return (
            <Box sx={{ 
                position: 'fixed', 
                right: 0, 
                top: '80px', 
                zIndex: 1000 
            }}>
                <Tooltip title="Afficher les paramètres">
                    <IconButton 
                        onClick={toggleCollapse}
                        sx={{ 
                            bgcolor: 'background.paper', 
                            boxShadow: 2,
                            borderRadius: '50% 0 0 50%',
                            p: 1.5,
                            '& svg': {
                                fontSize: '2rem'
                            }
                        }}
                    >
                        <KeyboardArrowLeftIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    return (
        <>
            {/* Bouton pour replier le panneau - position fixe en haut */}
            <Box sx={{ 
                position: 'fixed', 
                right: collapsed ? '10px' : '300px', 
                top: '80px', 
                zIndex: 1000,
                width: 'auto',
                transition: 'right 0.3s ease'
            }}>
                <Tooltip title={collapsed ? "Afficher les paramètres" : "Masquer les paramètres"}>
                    <IconButton 
                        onClick={toggleCollapse} 
                        size="large"
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            borderRadius: '8px',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08)
                            },
                            '& svg': {
                                fontSize: '1.8rem',
                                transform: collapsed ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.3s ease'
                            }
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            
            {/* Contenu du panneau - avec marge en haut pour laisser place au bouton */}
            <Box sx={{ 
                mt: '60px', 
                width: '100%',
                height: 'calc(100vh - 80px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Conteneur des boutons principaux */}
                <Box sx={{
                    p: 2, 
                    bgcolor: "transparent", 
                    boxShadow: "none", 
                    borderRadius: 0
                }}>
                    <Grid container spacing={2} direction="column" justifyContent="center" width={"100%"}>
                        {[
                            {label: "Paramètres", icon: <SettingsIcon fontSize="large" />, value: "settings"},
                            {label: "Modèles", icon: <MemoryIcon fontSize="large" />, value: "models"},
                            {label: "Mode", icon: <SettingsSuggestIcon fontSize="large" />, value: "mode"},
                        ].map((item) => (
                            <Grid item key={item.value}>
                                <Button
                                    fullWidth
                                    variant={selectedTab === item.value ? "contained" : "outlined"}
                                    onClick={() => togglePanel(item.value)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        gap: 2,
                                        height: '50px'
                                    }}
                                >
                                    {item.icon}
                                    <Typography variant="body2" fontWeight="medium">
                                        {item.label}
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Zone de contenu principal */}
                <Box sx={{ mt: 2 }}>
                    {/* Récapitulatif - affiché quand aucun panneau n'est sélectionné */}
                    <Collapse in={!selectedTab}>
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1
                        }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                Sélections actuelles :
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <SettingsIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        Paramètre : {selectedValues.settings ? 
                                            getSettingName(selectedValues.settings) : 
                                            "Aucun paramètre sélectionné"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <MemoryIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        Modèle : {selectedValues.model || "Aucun modèle sélectionné"}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <SettingsSuggestIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        Mode : {selectedValues.mode || "Aucun mode sélectionné"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Collapse>

                    {/* Panneau Settings */}
                    <Collapse in={selectedTab === "settings"}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1,
                            height: '100%',
                            mb: 2
                        }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                alignItems: 'center',
                                p: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                gap: 1
                            }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setNewSettingDialogOpen(true)}
                                    startIcon={<AddIcon />}
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                >
                                    Nouveau
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleValidate}
                                    disabled={!selectedValues.settings}
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                >
                                    Appliquer
                                </Button>
                            </Box>
                            <List sx={{ 
                                flexGrow: 1, 
                                overflow: 'auto',
                                p: 0
                            }}>
                                {settings.map((setting) => (
                                    <ListItem
                                        component="div"
                                        key={setting.id}
                                        onClick={() => handleListItemClick(setting.id)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            py: 0.75,
                                            px: 2,
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            },
                                            ...(selectedValues.settings === setting.id && {
                                                bgcolor: 'action.selected',
                                                borderLeft: '3px solid',
                                                borderColor: 'primary.main'
                                            })
                                        }}
                                    >
                                        <ListItemText 
                                            primary={setting.payload?.title || "Sans titre"}
                                            secondary={setting.payload?.content || "Aucun contenu"}
                                            primaryTypographyProps={{
                                                variant: 'body1',
                                                sx: { fontWeight: 500 }
                                            }}
                                            secondaryTypographyProps={{
                                                sx: {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Collapse>

                    {/* Panneau Models */}
                    <Collapse in={selectedTab === "models"}>
                        <Box sx={{p: 2, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1, mb: 2}}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Modèles
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<CheckCircleOutlineIcon/>}
                                    onClick={handleValidate}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.8,
                                        fontWeight: 'bold',
                                        boxShadow: 1
                                    }}
                                >
                                    Valider
                                </Button>
                            </Box>
                            <TextField
                                select
                                fullWidth
                                label="Sélectionner un modèle"
                                value={selectedValues.model}
                                onChange={handleChange("model")}
                                variant="outlined"
                                margin="normal"
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300
                                            }
                                        }
                                    }
                                }}
                            >
                                {models.map((option, index) => (
                                    <MenuItem key={index} value={option} sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <Typography variant="body1">{option}</Typography>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Collapse>

                    {/* Panneau Mode */}
                    <Collapse in={selectedTab === "mode"}>
                        <Box sx={{p: 2, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1, mb: 2}}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Mode
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<CheckCircleOutlineIcon/>}
                                    onClick={handleValidate}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.8,
                                        fontWeight: 'bold',
                                        boxShadow: 1
                                    }}
                                >
                                    Valider
                                </Button>
                            </Box>
                            <TextField
                                select
                                fullWidth
                                label="Sélectionner un mode"
                                value={selectedValues.mode}
                                onChange={handleChange("mode")}
                                variant="outlined"
                                margin="normal"
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300
                                            }
                                        }
                                    }
                                }}
                            >
                                {modes.map((option, index) => (
                                    <MenuItem key={index} value={option} sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <Typography variant="body1">{option}</Typography>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Collapse>
                </Box>
            </Box>

            {/* Dialog pour créer un nouveau paramètre */}
            <Dialog 
                open={newSettingDialogOpen} 
                onClose={() => setNewSettingDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Nouveau paramètre</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Titre"
                        fullWidth
                        value={newSetting.title}
                        onChange={(e) => setNewSetting({ ...newSetting, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Contenu"
                        fullWidth
                        multiline
                        rows={4}
                        value={newSetting.content}
                        onChange={(e) => setNewSetting({ ...newSetting, content: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewSettingDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreateSetting} variant="contained" color="primary">
                        Créer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
