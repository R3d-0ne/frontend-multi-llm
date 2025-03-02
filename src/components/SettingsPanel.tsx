import {useState} from "react";
import {Box, Button, Collapse, Grid, MenuItem, TextField, Typography} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from "@mui/icons-material/Memory";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Icône du bouton Valider

export default function SettingsPanel({contexts, settings, models, modes}: {
    contexts: string[];
    settings: string[];
    models: string[];
    modes: string[]
}) {
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [selectedValues, setSelectedValues] = useState({
        settings: "",
        context: "",
        model: "",
        mode: "",
    });

    const togglePanel = (tab: string) => {
        setSelectedTab(selectedTab === tab ? null : tab);
    };

    const handleChange = (field: string) => (event: any) => {
        setSelectedValues((prev) => ({...prev, [field]: event.target.value}));
    };

    const handleValidate = () => {
        console.log("Requête à construire:", selectedValues);
    };

    return (
        <>
            {/* Conteneur des boutons principaux */}
            <Box
                sx={{display: "flex", width: "100%", p: 1, bgcolor: "transparent", boxShadow: "none", borderRadius: 0}}>
                <Grid container spacing={2} justifyContent="center" width={"100%"}>
                    <>
                        {[
                            {label: "Settings", icon: <SettingsIcon/>, value: "settings"},
                            {label: "Contexte", icon: <StorageIcon/>, value: "context"},
                            {label: "Models", icon: <MemoryIcon/>, value: "models"},
                            {label: "Mode", icon: <SettingsSuggestIcon/>, value: "mode"},
                        ].map((item) => (
                            <Grid item key={item.value} xs={6} sm={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => togglePanel(item.value)}
                                    sx={{
                                        height: "80px",
                                        width: "80px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        textTransform: "none",
                                        bgcolor: "transparent",
                                        color: "white",
                                        "&:hover": {
                                            bgcolor: "white",
                                            color: "black",
                                        },
                                    }}
                                >
                                    <>{item.icon}</>
                                    <Typography variant="body2" sx={{mt: 1}}>
                                        {item.label}
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                    </>
                </Grid>
            </Box>

            {/* Bloc contenant les inputs et le bouton Valider, caché par défaut */}
            <Collapse in={Boolean(selectedTab)} sx={{width: "100%", mt: 2}}>
                <Box sx={{width: "100%", p: 2}}>
                    <>
                        {selectedTab === "settings" && (
                            <>
                                <Typography variant="h6" sx={{mb: 1}}>Paramètres</Typography>
                                <TextField fullWidth label="Nouveau paramètre" variant="outlined" sx={{mb: 2}}
                                           value={selectedValues.settings}
                                           onChange={handleChange("settings")}
                                />
                                {settings.length > 0 && (
                                    <TextField select fullWidth label="Sélectionner un paramètre"
                                               value={selectedValues.settings} onChange={handleChange("settings")}>
                                        {settings.map((setting, index) => (
                                            <MenuItem key={index} value={setting}>
                                                {setting}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </>
                        )}

                        {selectedTab === "context" && (
                            <>
                                <Typography variant="h6" sx={{mb: 1}}>Contextes</Typography>
                                <TextField fullWidth label="Ajouter un contexte" variant="outlined" sx={{mb: 2}}
                                           value={selectedValues.context}
                                           onChange={handleChange("context")}
                                />
                                {contexts.length > 0 && (
                                    <TextField select fullWidth label="Sélectionner un contexte"
                                               value={selectedValues.context} onChange={handleChange("context")}>
                                        {contexts.map((context, index) => (
                                            <MenuItem key={index} value={context}>
                                                {context}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </>
                        )}

                        {selectedTab === "models" && (
                            <>
                                <Typography variant="h6" sx={{mb: 1}}>Modèles</Typography>
                                {models.length > 0 && (
                                    <TextField select fullWidth label="Sélectionner un modèle"
                                               value={selectedValues.model} onChange={handleChange("model")}>
                                        {models.map((model, index) => (
                                            <MenuItem key={index} value={model}>
                                                {model}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </>
                        )}

                        {selectedTab === "mode" && (
                            <>
                                <Typography variant="h6" sx={{mb: 1}}>Modes</Typography>
                                {modes.length > 0 && (
                                    <TextField select fullWidth label="Sélectionner un mode" value={selectedValues.mode}
                                               onChange={handleChange("mode")}>
                                        {modes.map((mode, index) => (
                                            <MenuItem key={index} value={mode}>
                                                {mode}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            </>
                        )}

                        {/* Bouton Valider, affiché dès qu'un input est visible */}
                        <Box sx={{width: "100%", display: "flex", justifyContent: "center", mt: 2}}>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircleOutlineIcon/>}
                                onClick={handleValidate}
                                sx={{
                                    bgcolor: "black",
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: "white",
                                        color: "black",
                                    },
                                }}
                            >
                                Valider
                            </Button>
                        </Box>
                    </>
                </Box>
            </Collapse>
        </>
    );
}
