import { useState, useEffect } from "react";
import { Box, Button, Collapse, Grid, MenuItem, TextField, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MemoryIcon from "@mui/icons-material/Memory";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { createSettings, Settings } from "../services/settings_service";
import { List, ListItem, ListItemText } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import DocumentUpload from "./DocumentUpload";
import { getAvailableModels, selectModel } from "../services/generate_services"; // Importer les fonctions

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  size?: number;
}

interface SettingsPanelProps {
    settings: any[];
    onSettingChange?: (settingId: string) => void;
    selectedSettingId?: string | null;
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
    onSettingsUpdated?: () => void;
    onModelChange?: (modelId: string) => void; // Ajout de cette prop pour gérer le changement de modèle
}

export default function SettingsPanel({
    settings,
    onSettingChange,
    selectedSettingId,
    collapsed = false,
    onCollapse,
    onSettingsUpdated,
    onModelChange
}: SettingsPanelProps) {
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState({
        settings: "",
        model: "",
    });
    const [newSettingDialogOpen, setNewSettingDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [newSetting, setNewSetting] = useState<Settings>({
        title: '',
        content: ''
    });
    const theme = useTheme();

    // État pour stocker les modèles LLM disponibles
    const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
    const [loadingModels, setLoadingModels] = useState<boolean>(false);
    const [modelError, setModelError] = useState<string | null>(null);

    // Charger les modèles disponibles
    useEffect(() => {
        const fetchModels = async () => {
            try {
                setLoadingModels(true);
                const models = await getAvailableModels();
                setAvailableModels(models);
                setModelError(null);
            } catch (error) {
                console.error("Erreur lors du chargement des modèles LLM:", error);
                setModelError("Impossible de charger la liste des modèles");
            } finally {
                setLoadingModels(false);
            }
        };

        fetchModels();
    }, []);

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
    };

    const handleListItemClick = (settingId: string) => {
        // Uniquement mettre à jour la sélection dans le state local
        setSelectedValues(prev => ({...prev, settings: settingId}));
    };

    // Fonction séparée pour appliquer le paramètre sélectionné
    const applySettings = () => {
        const settingToApply = selectedValues.settings;
        if (settingToApply && onSettingChange) {
            console.log("Tentative d'application du paramètre:", settingToApply);
            onSettingChange(settingToApply);
        }
    };

    // Fonction séparée pour appliquer le modèle sélectionné
    const applyModel = () => {
        const modelToApply = selectedValues.model;
        if (modelToApply && onModelChange) {
            console.log("Tentative de sélection du modèle:", modelToApply);

            // Appeler l'API pour définir le modèle côté serveur
            selectModel(modelToApply)
                .then(response => {
                    console.log("Réponse de sélection du modèle:", response);
                    // Vérifier si la sélection a réussi
                    if (response && response.status === "success") {
                        console.log("Modèle sélectionné avec succès:", modelToApply);
                        // Informer le composant parent du changement
                        onModelChange(modelToApply);
                    } else {
                        console.error("Échec de la sélection du modèle:", response);
                    }
                })
                .catch(error => {
                    console.error("Erreur lors de la sélection du modèle:", error);
                });
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

    // Fonction pour obtenir le nom d'affichage d'un modèle
    const getModelDisplayName = (modelId: string) => {
        const model = availableModels.find(m => m.id === modelId);
        if (model) {
            const sizeDisplay = model.size ? ` (${Math.round(model.size / 1024 / 1024)}MB)` : '';
            return `${model.name}${sizeDisplay}`;
        }
        return modelId;
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
                            {label: "Déposer des Documents", icon: <UploadFileIcon fontSize="large" />, value: "upload"},
                        ].map((item) => (
                            <Grid item key={item.value}>
                                <Button
                                    fullWidth
                                    variant={selectedTab === item.value ? "contained" : "outlined"}
                                    onClick={() => {
                                        if (item.value === "upload") {
                                            setUploadDialogOpen(true);
                                        } else {
                                            togglePanel(item.value);
                                        }
                                    }}
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
                                        Modèle : {selectedValues.model ?
                                            getModelDisplayName(selectedValues.model) :
                                            "Aucun modèle sélectionné"}
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
                                    onClick={applySettings}
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

                    {/* Panneau Models - Modifié pour utiliser les modèles dynamiques */}
                    <Collapse in={selectedTab === "models"}>
                        <Box sx={{p: 2, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1, mb: 2}}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Modèles LLM
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    startIcon={<CheckCircleOutlineIcon/>}
                                    onClick={applyModel}
                                    disabled={!selectedValues.model}
                                    sx={{
                                        borderRadius: 2,
                                        py: 0.8,
                                        fontWeight: 'bold',
                                        boxShadow: 1
                                    }}
                                >
                                    Appliquer
                                </Button>
                            </Box>

                            {loadingModels ? (
                                <Typography variant="body2" color="text.secondary">
                                    Chargement des modèles...
                                </Typography>
                            ) : modelError ? (
                                <Typography variant="body2" color="error">
                                    {modelError}
                                </Typography>
                            ) : (
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
                                    {availableModels.map((model) => (
                                        <MenuItem
                                            key={model.id}
                                            value={model.id}
                                            sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <Typography variant="body1">
                                                {model.name} {model.size ? `(${Math.round(model.size / 1024 / 1024)}MB)` : ''}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
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

            {/* Dialog pour le dépôt de documents */}
            <DocumentUpload
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
            />
        </>
    );
}