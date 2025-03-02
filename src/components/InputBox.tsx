import {useState} from "react";
import {Send} from "lucide-react";
import {Box, IconButton, Paper, TextField} from "@mui/material";

interface InputBoxProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function InputBox({onSend, disabled = false, placeholder = "Tapez votre message..."}: InputBoxProps) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message);
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
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={placeholder}
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
        </Box>
    );
}
