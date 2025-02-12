import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";
import InputBox from "./components/InputBox";
import SideBar from "./components/SideBar";
import ChatContainer from "./components/ChatContainer";
import SettingsPanel from "./components/SettingsPanel"; // Import du panneau des réglages
import { useState } from "react";

const theme = createTheme({
  palette: {
    mode: "dark", // Change en "dark" si besoin
  },
});

const mockConversations = [
  { id: 1, title: "Conversation 1", lastMessage: "Dernier message ici..." },
  { id: 2, title: "Conversation 2", lastMessage: "Un autre message..." },
];

const App = () => {
  const [messages, setMessages] = useState([]);

  const handleSendMessage = (message: string) => {
    setMessages([...messages, { text: message, isUser: true }]);
  };

  const handleSelectConversation = (id: number) => {
    console.log("Conversation sélectionnée :", id);
  };

  return (
    <ThemeProvider theme={theme} >
      <CssBaseline />
      <Box display="flex" height="100vh" width="100vw">
        {/* Barre latérale */}
        <SideBar conversations={mockConversations} onSelectConversation={handleSelectConversation} modelName="DeepSeek" />

        {/* Conteneur principal : 3 colonnes */}
        <Box display="flex" bgcolor="transparent" flex={1} flexDirection="row">

          {/* Colonne 1 : Vide (réserve d'espace) */}
          <Box flex={1}></Box>

          {/* Colonne 2 : ChatContainer + InputBox */}
          <Box flex={2} display="flex" marginTop={"60px"} marginBottom={"120px"} flexDirection="column" alignItems="center" justifyContent="space-between">
            <ChatContainer messages={messages} />
            <Box width="100%" mt={2}>
              <InputBox onSend={handleSendMessage} />
            </Box>
          </Box>

          {/* Colonne 3 : SettingsPanel */}
          <Box flex={1} display="flex" flexDirection={"column"} justifyContent="center" alignItems="center">
            <SettingsPanel
              contexts={["Contexte 1", "Contexte 2"]}
              settings={["Option A", "Option B"]}
              models={["GPT-4", "DeepSeek"]}
              modes={["Standard", "Avancé"]}
            />
          </Box>

        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
