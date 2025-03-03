import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { continueDiscussion } from '../services/generate_services';

interface Message {
    id: string;
    sender: string;
    text: string;
}

const App: React.FC = () => {
    const [discussionId, setDiscussionId] = useState('');
    const [selectedSettingId, setSelectedSettingId] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSendMessage = async (message: string) => {
        try {
            console.log("Envoi du message avec les paramètres suivants:", {
                discussionId,
                message,
                selectedSettingId
            });

            setIsGenerating(true);
            const response = await continueDiscussion(
                discussionId,
                message,
                selectedSettingId || undefined
            );

            // Mettre à jour l'historique des messages
            setMessages(prevMessages => [...prevMessages, 
                { id: uuidv4(), sender: "user", text: message },
                { id: uuidv4(), sender: "assistant", text: response.response }
            ]);
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            // Gérer l'erreur (afficher une notification, etc.)
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            {messages.map((message) => (
                <div key={message.id}>
                    <strong>{message.sender}:</strong> {message.text}
                </div>
            ))}
            <input 
                type="text" 
                disabled={isGenerating}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        handleSendMessage(e.currentTarget.value);
                        e.currentTarget.value = '';
                    }
                }}
            />
            {isGenerating && <div>En cours de génération...</div>}
        </div>
    );
};

export default App; 