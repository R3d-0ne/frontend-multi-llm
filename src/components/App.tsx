import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { continueDiscussion, getAvailableModels } from '../services/generate_services';
import SettingsPanel from './SettingsPanel';

interface Message {
    id: string;
    sender: string;
    text: string;
}

const App: React.FC = () => {
    const [discussionId, setDiscussionId] = useState('');
    const [selectedSettingId, setSelectedSettingId] = useState('');
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [settings, setSettings] = useState([]);
    const [models, setModels] = useState([]);
    const [modes] = useState(['Mode 1', 'Mode 2']); // Exemple de modes, à adapter selon vos besoins
    const [settingsPanelCollapsed, setSettingsPanelCollapsed] = useState(false);

    // Charger les paramètres et modèles au démarrage
    useEffect(() => {
        fetchSettings();
        fetchModels();
    }, []);

    // Fonction pour récupérer les paramètres (à implémenter selon votre API)
    const fetchSettings = async () => {
        // Implémentation à adapter selon votre backend
        // Exemple: const response = await getSettings(); setSettings(response);
        setSettings([]); // Remplacer par un appel API réel
    };

    // Fonction pour récupérer les modèles LLM
    const fetchModels = async () => {
        try {
            const availableModels = await getAvailableModels();
            setModels(availableModels);
        } catch (error) {
            console.error("Erreur lors du chargement des modèles:", error);
        }
    };

    const handleSendMessage = async (message: string) => {
        try {
            console.log("Envoi du message avec les paramètres suivants:", {
                discussionId,
                message,
                selectedSettingId,
                selectedModel
            });

            setIsGenerating(true);
            const response = await continueDiscussion(
                discussionId,
                message,
                undefined, // additionalInfo
                selectedSettingId || undefined,
                selectedModel || undefined // Utilisation du modèle sélectionné
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

    // Gestionnaires pour les modifications de paramètres
    const handleSettingChange = (settingId: string) => {
        setSelectedSettingId(settingId);
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        console.log(`Modèle LLM sélectionné: ${modelId}`);
    };

    const toggleSettingsPanel = (collapsed: boolean) => {
        setSettingsPanelCollapsed(collapsed);
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '20px' }}>
                {messages.map((message) => (
                    <div key={message.id} style={{
                        margin: '10px',
                        padding: '10px',
                        backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f1f8e9',
                        borderRadius: '8px'
                    }}>
                        <strong>{message.sender === 'user' ? 'Vous' : 'Assistant'}:</strong> {message.text}
                    </div>
                ))}
                <div style={{ marginTop: '20px', position: 'fixed', bottom: '20px', left: '20px', right: settingsPanelCollapsed ? '20px' : '320px' }}>
                    <input
                        type="text"
                        disabled={isGenerating}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                        placeholder="Écrivez votre message..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                handleSendMessage(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                    {isGenerating && <div style={{ marginTop: '10px', color: '#666' }}>En cours de génération...</div>}
                </div>
            </div>

            <div style={{ width: settingsPanelCollapsed ? '0' : '300px', transition: 'width 0.3s ease' }}>
                <SettingsPanel
                    settings={settings}
                    models={models}
                    modes={modes}
                    onSettingChange={handleSettingChange}
                    selectedSettingId={selectedSettingId}
                    collapsed={settingsPanelCollapsed}
                    onCollapse={toggleSettingsPanel}
                    onSettingsUpdated={fetchSettings}
                    onModelChange={handleModelChange}
                />
            </div>
        </div>
    );
};

export default App;