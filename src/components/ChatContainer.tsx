import {Box} from "@mui/material";
import Message from "./Message.tsx";
import AiResponse from "./AIResponse.tsx";

export default function ChatContainer({messages}: { messages: { text: string; isUser: boolean }[] }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "80%",
                maxWidth: 700,
                height: "75vh",
                flex: 1, // Assure que ChatContainer prend tout l'espace vertical
                // bgcolor: "background.default",
                borderRadius: "8px",
                p: 2,
                boxShadow: 3,
            }}
        >
            {/* Conteneur des messages avec SCROLLABLE */}
            <Box
                sx={{
                    flex: 1,
                    width: "100%",
                    overflowY: "auto",
                    scrollbarWidth: "none", "&::-webkit-scrollbar": {display: "none"},
                    display: "flex",
                    flexDirection: "column",
                    gap: 1, // Espacement entre les messages
                    p: 1,
                }}
            >
                {/* Message de test de l'utilisateur */}
                <Message text="Ceci est un message de test."/>

                {/* Réponse IA de test avec texte et code */}
                <AiResponse
                    text={`<think>Alright, I need to explain Playwright.</think>\n\n**Réponse :**\n\nSi vous souhaitez créer un **agent IA** avec Playwright...\n\n### Étape 1 : Installer les dépendances\n\n- Ouvrez le terminal\n- Exécutez : \`pip install playwright openai pandas\`\n\n### Étape 2 : Configuration\n\n\`\`\`python\nimport os\nos.environ[\"OPENAI_API_KEY\"] = \"your_openai_api_key\"\n\`\`\`\n\nEt voici comment exécuter :\n\n\`\`\`bash\npython3 -m your_script_name\n\`\`\``}
                />
                {/* Messages dynamiques */}
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            justifyContent: msg.isUser ? "flex-end" : "flex-start",
                            width: "100%",
                        }}
                    >
                        <>            {msg.isUser ? <Message text={msg.text}/> : <AiResponse text={msg.text}/>}

                        </>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
