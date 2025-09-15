import { Box, CircularProgress } from "@mui/material";
import Message from "./Message.tsx";
import AiResponse from "./AIResponse.tsx";
import { useEffect, useRef, useMemo } from "react";

interface Message {
  id?: string;
  text: string;
  sender: string;
  isUser?: boolean;
  timestamp?: string;
  documents?: Array<{
    title: string;
    score: number;
    metadata?: any;
  }>;
}

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
  onDocumentClick?: (document: any) => void;
}

export default function ChatContainer({messages, isLoading = false, onDocumentClick}: ChatContainerProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    // Défilement automatique optimisé
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Effet pour le défilement uniquement quand de nouveaux messages arrivent
    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom();
            prevMessagesLengthRef.current = messages.length;
        }
    }, [messages]);

    // Tri des messages optimisé avec mémoisation
    const sortedMessages = useMemo(() => {
        console.log("Messages reçus dans ChatContainer:", messages);
        return [...messages].sort((a, b) => {
            if (a.timestamp && b.timestamp) {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            }
            return 0;
        });
    }, [messages]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
                height: "100%",
                flex: 1,
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
                    scrollbarWidth: "none", 
                    "&::-webkit-scrollbar": {display: "none"},
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 1,
                }}
            >
                {sortedMessages.length === 0 ? (
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '100%' 
                        }}
                    >
                        <Message text="Bienvenue! Créez une nouvelle discussion ou sélectionnez-en une existante pour commencer." />
                    </Box>
                ) : (
                    // Messages dynamiques
                    sortedMessages.map((msg, index) => {
                        const isUserMessage = msg.isUser !== undefined ? msg.isUser : msg.sender === 'user';
                        
                        return (
                            <Box
                                key={msg.id || index}
                                sx={{
                                    display: "flex",
                                    justifyContent: isUserMessage ? "flex-end" : "flex-start",
                                    width: "100%",
                                }}
                            >
                                {isUserMessage ? 
                                    <Message text={msg.text}/> : 
                                    <AiResponse text={msg.text} documents={msg.documents} onDocumentClick={onDocumentClick}/>
                                }
                            </Box>
                        );
                    })
                )}
                
                {/* Indicateur de chargement */}
                {isLoading && (
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            mt: 2 
                        }}
                    >
                        <CircularProgress size={30} />
                    </Box>
                )}
                
                {/* Élément invisible pour le défilement automatique */}
                <div ref={messagesEndRef} />
            </Box>
        </Box>
    );
}
