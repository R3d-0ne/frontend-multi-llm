import {useState} from "react";
import {Send, SearchIcon, BookOpenIcon} from "lucide-react";
import {Box, IconButton, Paper, TextField, Tooltip, Switch, FormControlLabel} from "@mui/material";

interface InputBoxProps {
    onSend: (message: string, useInternalSearch?: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function InputBox({onSend, disabled = false, placeholder = "Tapez votre message..."}: InputBoxProps) {
    const [message, setMessage] = useState("");
    const [useInternalSearch, setUseInternalSearch] = useState(false);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message, useInternalSearch);
            setMessage("");
        }
    };

    return (
        <Box
            position="fixed"
            bottom={0}
            left={0}
            width="100%"
            display="flex"
            justifyContent="center"
            bgcolor="background.paper"
            boxShadow={3}
            p={2}
        >
            <Paper
                sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: 700,
                    p: 1,
                    borderRadius: 3,
                    opacity: disabled ? 0.7 : 1
                }}
            >
                {/* Bouton de recherche interne */}
                <Tooltip title={useInternalSearch ? "Recherche dans les documents" : "Réponse standard"}>
                    <IconButton 
                        onClick={() => setUseInternalSearch(!useInternalSearch)} 
                        sx={{color: useInternalSearch ? "primary.main" : "text.secondary"}}
                        disabled={disabled}
                    >
                        {useInternalSearch ? <BookOpenIcon size={22} /> : <SearchIcon size={22} />}
                    </IconButton>
                </Tooltip>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={useInternalSearch ? "Rechercher dans les documents..." : placeholder}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !disabled && handleSend()}
                    disabled={disabled}
                    sx={{
                        mx: 1,
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {border: "none"} // Supprime la bordure
                        }
                    }}
                />

                <IconButton 
                    onClick={handleSend} 
                    sx={{color: "transparent"}}
                    disabled={disabled || !message.trim()}
                >
                    <Send size={24}/>
                </IconButton>
            </Paper>
            
            {/* Texte d'indication du mode de recherche */}
            {useInternalSearch && (
                <Box 
                    sx={{ 
                        position: 'absolute',
                        bottom: '75px',
                        fontSize: '0.8rem',
                        color: 'primary.main',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <BookOpenIcon size={14} />
                    Mode recherche dans les documents activé
                </Box>
            )}
        </Box>
    );
}
