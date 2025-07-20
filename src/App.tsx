import { createTheme, ThemeProvider, CssBaseline, Box, Snackbar, Alert } from "@mui/material";
import InputBox from "./components/InputBox";
import SideBar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import SettingsPanel from "./components/SettingsPanel";
import Documents from "./components/Documents";
import { useState, useEffect } from "react";
import { getMessagesByDiscussion } from "./services/message_service";
import { continueDiscussion } from "./services/generate_services";
import { getSettings } from "./services/settings_service";
import { searchInternal } from "./services/search_service";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

interface Message {
  id?: string;
  text: string;
  sender: string;
  isUser?: boolean;
  timestamp?: string;
}

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentDiscussionId, setCurrentDiscussionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [selectedSettingId, setSelectedSettingId] = useState<string | null>(null);
  const [settingsPanelCollapsed, setSettingsPanelCollapsed] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('chat');

  // Fonction pour charger les paramètres
  const loadSettings = async () => {
    try {
      console.log("Chargement des paramètres...");
      const settingsData = await getSettings();
      console.log("Paramètres chargés:", settingsData);
      setSettings(settingsData);
      if (settingsData.length > 0) {
        setSelectedSettingId(settingsData[0].id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
      setError("Erreur lors du chargement des paramètres");
    }
  };

  // Fonction pour gérer le changement de paramètres
  const handleSettingChange = (settingId: string) => {
    console.log("Changement de paramètre:", settingId);
    setSelectedSettingId(settingId);
  };

  // Fonction pour gérer l'état du panneau de paramètres
  const handleSettingsPanelCollapse = (collapsed: boolean) => {
    setSettingsPanelCollapsed(collapsed);
  };

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  // Charger les messages d'une discussion lorsqu'elle est sélectionnée
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentDiscussionId) {
        setMessages([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Chargement des messages pour la discussion ${currentDiscussionId}...`);
        const messagesData = await getMessagesByDiscussion(currentDiscussionId);
        console.log("Messages chargés:", messagesData);
        
        // Convertir les messages au format attendu par ChatContainer
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          isUser: msg.sender === 'user',
          timestamp: msg.timestamp || msg.created_at || new Date().toISOString()
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
        setError("Erreur lors du chargement des messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [currentDiscussionId]);

  // Fonction pour gérer l'envoi de message
  const handleSendMessage = async (message: string, useInternalSearch: boolean = false) => {
    if (!currentDiscussionId) {
      setError("Veuillez sélectionner ou créer une discussion");
      return;
    }
    
    console.log("Envoi du message avec les paramètres suivants:", {
      discussionId: currentDiscussionId,
      message,
      selectedSettingId,
      useInternalSearch
    });
    
    // Ajouter le message de l'utilisateur à l'interface
    const userMessage = { 
      text: message, 
      sender: 'user', 
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    setIsLoading(true);
    setError(null);
    try {
      if (useInternalSearch) {
        // Utiliser la recherche interne avec le service de génération
        const response = await searchInternal({
          query: message,
          discussion_id: currentDiscussionId,
          settings_id: selectedSettingId || undefined,
          limit: 10
        });

        console.log("Réponse de recherche interne reçue:", response);
        
        // Ajouter des informations sur les documents utilisés
        let responseText = response.response;
        if (response.documents_used && response.documents_used.length > 0) {
          responseText += "\n\n---\n\n*Sources consultées:*\n";
          response.documents_used.forEach((doc, index) => {
            responseText += `${index + 1}. ${doc.title} (score: ${doc.score.toFixed(2)})\n`;
          });
        }
        
        // Ajouter la réponse de l'assistant à l'interface
        const assistantMessage = { 
          text: responseText, 
          sender: 'assistant', 
          isUser: false,
          timestamp: new Date().toISOString(),
          documents: response.documents_used || []
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        // Continuer une discussion existante (comportement normal)
        const response = await continueDiscussion(
          currentDiscussionId, 
          message,
          undefined, // additionalInfo
          selectedSettingId || undefined // settingsId
        );
        
        console.log("Réponse standard reçue:", response);
        
        // Ajouter la réponse de l'assistant à l'interface
        const assistantMessage = { 
          text: response.response, 
          sender: 'assistant', 
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError("Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    console.log(`Sélection de la discussion: ${id}`);
    setCurrentDiscussionId(id);
    setCurrentPage('chat');
  };

  const handleNavigateTo = (page: string) => {
    console.log(`Navigation vers: ${page}`);
    setCurrentPage(page);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" height="100vh" width="100vw">
        {/* Barre latérale */}
        <SideBar 
          onSelectConversation={handleSelectConversation} 
          modelName="DeepSeek" 
          onNavigateTo={handleNavigateTo}
        />

        {/* Conteneur principal */}
        <Box 
          sx={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          {/* Affichage conditionnel en fonction de la page actuelle */}
          {currentPage === 'chat' ? (
            /* Conteneur du chat et de l'input - FIXE AU CENTRE */
            <Box 
              sx={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                transform: "translateX(-50%)",
                width: "700px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "60px 0 20px 0"
              }}
            >
              {/* Zone de chat (prend tout l'espace disponible) */}
              <Box sx={{ flex: 1, overflow: "hidden", mb: 2 }}>
                <ChatContainer messages={messages} isLoading={isLoading} />
              </Box>
              
              {/* Zone d'input (fixée en bas) */}
              <Box width="100%" sx={{ marginBottom: "20px" }}>
                <InputBox 
                  onSend={handleSendMessage} 
                  disabled={!currentDiscussionId || isLoading} 
                  placeholder={!currentDiscussionId ? "Veuillez créer ou sélectionner une discussion" : "Entrez votre message..."}
                />
              </Box>
            </Box>
          ) : currentPage === 'documents' ? (
            /* Page Documents */
            <Box 
              sx={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                padding: "60px 0 20px 0"
              }}
            >
              <Documents />
            </Box>
          ) : null}

          {/* Panneau de paramètres */}
          <Box
            sx={{
              position: "fixed",
              right: 0,
              top: 0,
              height: "100vh",
              width: settingsPanelCollapsed ? "auto" : "300px",
              bgcolor: "background.paper",
              borderLeft: 1,
              borderColor: "divider",
              transition: "width 0.3s ease",
              zIndex: 1000,
            }}
          >
            <SettingsPanel
              settings={settings}
              models={[]}
              modes={[]}
              onSettingChange={handleSettingChange}
              selectedSettingId={selectedSettingId}
              collapsed={settingsPanelCollapsed}
              onCollapse={handleSettingsPanelCollapse}
              onSettingsUpdated={loadSettings}
            />
          </Box>
        </Box>
      </Box>

      {/* Snackbar pour afficher les erreurs */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
