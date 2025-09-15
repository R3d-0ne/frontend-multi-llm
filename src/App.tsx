import { createTheme, ThemeProvider, CssBaseline, Box, Snackbar, Alert } from "@mui/material";
import InputBox from "./components/InputBox";
import SideBar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import SettingsPanel from "./components/SettingsPanel";
import Documents from "./components/Documents";
import DocumentQuery from "./components/DocumentQuery";
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
  documents?: Array<{
    title: string;
    score: number;
    metadata?: any;
  }>;
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
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

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

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleSettingChange = (settingId: string) => {
    setSelectedSettingId(settingId);
  };

  const handleSettingsPanelCollapse = (collapsed: boolean) => {
    setSettingsPanelCollapsed(collapsed);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentDiscussionId) {
        setMessages([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const messagesData = await getMessagesByDiscussion(currentDiscussionId);
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          isUser: msg.sender === 'user',
          timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
          documents: msg.documents
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

  const handleSendMessage = async (message: string, useInternalSearch: boolean = false) => {
    if (!currentDiscussionId) {
      setError("Veuillez sélectionner ou créer une discussion");
      return;
    }

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
        const response = await searchInternal({
          query: message,
          discussion_id: currentDiscussionId,
          settings_id: selectedSettingId || undefined,
          limit: 10
        });

        if (response && response.response) {
          let responseText = response.response;
          const documents = response.documents_used || [];

          if (documents.length > 0) {
            responseText += "\n\n---\n\n*Sources consultées:*\n";
            documents.forEach((doc, index) => {
              responseText += `${index + 1}. ${doc.title} (score: ${doc.score.toFixed(2)})\n`;
            });
          }

          const assistantMessage = {
            text: responseText,
            sender: 'assistant',
            isUser: false,
            timestamp: new Date().toISOString(),
            documents
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } else {
        const response = await continueDiscussion(
          currentDiscussionId,
          message,
          undefined,
          selectedSettingId || undefined,
          selectedModelId || undefined
        );

        if (response?.response) {
          const assistantMessage = {
            text: response.response,
            sender: 'assistant',
            isUser: false,
            timestamp: new Date().toISOString()
          };
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError("Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentDiscussionId(id);
    setCurrentPage('chat');
  };

  const handleNavigateTo = (page: string) => {
    setCurrentPage(page);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleDocumentClick = (document: any) => {
    console.log("Document cliqué:", document);
    setSelectedDocument(document);
    setCurrentPage('documents');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box display="flex" height="100vh" width="100vw">
        <SideBar
          onSelectConversation={handleSelectConversation} 
          modelName="LLM & Search AI" 
          onNavigateTo={handleNavigateTo}
        />

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
          {currentPage === 'chat' ? (
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
              <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
                <ChatContainer messages={messages} isLoading={isLoading} onDocumentClick={handleDocumentClick} />
              </Box>
              
              <Box width="100%" sx={{ marginBottom: "20px" }}>
                <InputBox 
                  onSend={handleSendMessage} 
                  disabled={!currentDiscussionId || isLoading} 
                  placeholder={!currentDiscussionId ? "Veuillez créer ou sélectionner une discussion" : "Entrez votre message..."}
                />
              </Box>
            </Box>
          ) : currentPage === 'documents' ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                padding: "60px 0 20px 0"
              }}
            >
              <Documents selectedDocument={selectedDocument} />
            </Box>
          ) : null}

          {currentPage === 'document-query' ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                padding: "60px 0 20px 0"
              }}
            >
              <DocumentQuery 
                discussionId={currentDiscussionId || undefined}
                settingsId={selectedSettingId || undefined}
                onResponse={(response, documentInfo) => {
                  // Optionnel: ajouter la réponse à la discussion
                  console.log('Réponse du document:', response, documentInfo);
                }}
              />
            </Box>
          ) : null}

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
              onSettingChange={handleSettingChange}
              selectedSettingId={selectedSettingId}
              collapsed={settingsPanelCollapsed}
              onCollapse={handleSettingsPanelCollapse}
              onSettingsUpdated={loadSettings}
              onModelChange={handleModelChange}
            />
          </Box>
        </Box>
      </Box>

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
