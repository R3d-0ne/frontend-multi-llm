import {Box, Paper, Typography} from "@mui/material";

export default function Message({text}: { text: string }) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                p: 1,
                pr: 2, // Padding à droite pour éviter le chevauchement avec la sidebar
            }}
        >
            <Paper
                sx={{
                    maxWidth: "60%", // Les messages ne dépasseront pas 60% de la largeur
                    bgcolor: "background.paper",
                    color: "text.primary",
                    p: 1.5,
                    borderRadius: 2,
                    wordBreak: "break-word",
                    boxShadow: 1,
                    alignSelf: "flex-end", // Assure que le message est bien positionné à droite
                    m: 1, // Ajoute un espacement entre les messages
                }}
            >
                <Typography variant="body1">{text}</Typography>
            </Paper>
        </Box>
    );
}
