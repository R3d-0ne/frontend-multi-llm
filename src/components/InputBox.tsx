import {useState} from "react";
import {Send} from "lucide-react";
import {Box, IconButton, Paper, TextField} from "@mui/material";

export default function InputBox({onSend}: { onSend: (message: string) => void }) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim()) {
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
                    borderRadius: 3
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Tapez votre message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    sx={{
                        mx: 1,
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {border: "none"} // Supprime la bordure
                        }
                    }}
                />

                <IconButton onClick={handleSend} sx={{color: "transparent"}}>
                    <Send size={24}/>
                </IconButton>
            </Paper>
        </Box>
    );
}
