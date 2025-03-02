import {useState, useEffect} from "react";
import {Box, Button, Collapse, Grid, MenuItem, TextField, Typography, IconButton, Tooltip} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MemoryIcon from "@mui/icons-material/Memory";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Icône du bouton Valider
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

interface SettingsPanelProps {
    settings: any[];
    models: string[];
    modes: string[];
    onSettingChange?: (settingId: string) => void;
    selectedSettingId?: string | null;
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
}

export default function SettingsPanel({
    settings, 
    models, 
    modes, 
    onSettingChange,
    selectedSettingId,
    collapsed = false,
    onCollapse
}: SettingsPanelProps) {
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState({
        settings: "",
        model: "",
        mode: "",
    });

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

    const handleValidate = () => {
        console.log("Requête à construire:", selectedValues);
        // Si onSettingChange est défini et qu'une valeur est sélectionnée, appeler la fonction
        if (onSettingChange && selectedValues.settings) {
            onSettingChange(selectedValues.settings);
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
                right: 0, 
                top: '80px', 
                zIndex: 1000,
                width: 'auto'
            }}>
                <Tooltip title="Masquer les paramètres">
                    <IconButton 
                        onClick={toggleCollapse} 
                        size="large"
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '& svg': {
                                fontSize: '1.8rem'
                            }
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            
            {/* Contenu du panneau - avec marge en haut pour laisser place au bouton */}
            <Box sx={{ mt: '60px', width: '100%' }}>
                {/* Conteneur des boutons principaux */}
                <Box
                    sx={{display: "flex", width: "100%", p: 2, bgcolor: "transparent", boxShadow: "none", borderRadius: 0}}>
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

                {/* Panneau Settings */}
                <Collapse in={selectedTab === "settings"} sx={{width: "100%", mt: 2}}>
                    <Box sx={{p: 2, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1}}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Paramètres
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
                            label="Sélectionner un paramètre"
                            value={selectedValues.settings}
                            onChange={handleChange("settings")}
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
                            {settings.map((setting) => (
                                <MenuItem key={setting.id} value={setting.id} sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="body1" fontWeight="bold" sx={{ wordBreak: 'break-word' }}>
                                            {setting.payload?.title || "Sans titre"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, wordBreak: 'break-word' }}>
                                            {setting.payload?.content 
                                                ? (setting.payload.content.length > 80 
                                                    ? setting.payload.content.substring(0, 80) + '...' 
                                                    : setting.payload.content) 
                                                : "Aucun contenu"}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                                            ID: {setting.id.substring(0, 8)}...
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Collapse>

                {/* Panneau Models */}
                <Collapse in={selectedTab === "models"} sx={{width: "100%", mt: 2}}>
                    <Box sx={{p: 2, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1}}>
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
                <Collapse in={selectedTab === "mode"} sx={{width: "100%", mt: 2}}>
                    <Box sx={{p: 2, bgcolor: "background.paper", borderRadius: 2, boxShadow: 1}}>
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
        </>
    );
}
