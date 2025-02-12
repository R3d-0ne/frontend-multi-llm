import { Box, Typography, Paper, IconButton, Collapse } from "@mui/material";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState } from "react";

interface AiResponseProps {
  text: string;
}

export default function AiResponse({ text }: AiResponseProps) {
  const [showThink, setShowThink] = useState(false);

  // Vérifier si le texte contient une balise <think>
  const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
  const thinkText = thinkMatch ? thinkMatch[1].trim() : null;

  // Suppression de <think> dans le texte principal
  let formattedText = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();

  // Séparer en lignes et identifier les blocs de code
  const lines = formattedText.split("\n");
  let insideCodeBlock = false;
  let codeLanguage = "";
  let codeBuffer: string[] = [];

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%", p: 1, pl: 2 }}>
      {/* Icône pour afficher/cacher <think> */}
        <>   {thinkText && (
        <IconButton onClick={() => setShowThink(!showThink)} sx={{ mt: 1, mr: 1 }}>
          <InfoOutlinedIcon sx={{ color: "grey.500" }} />
        </IconButton>
      )}

        </>

      <Paper elevation={0}
        sx={{
          width: "100%",
          bgcolor: "transparent",
          color: "text.primary",
          p: 1.5,
          borderRadius: 2,
          wordBreak: "break-word",
          boxShadow: "none",
          alignSelf: "flex-start",
          m: 1,
        }}
      >
        <>
          {/* Affichage du contenu <think> avec animation */}
          {thinkText && (
            <Collapse in={showThink}>
              <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mb: 1 }}>
                {thinkText}
              </Typography>
            </Collapse>
          )}

          {/* Affichage dynamique du texte */}
          {lines.map((line, index) => {
            if (!line.trim()) return null; // Ignore les lignes vides

            // Début ou fin d'un bloc de code
            if (/^```(\w+)?$/.test(line.trim())) {
              if (insideCodeBlock) {
                insideCodeBlock = false;
                const codeContent = codeBuffer.join("\n");
                codeBuffer = [];
                return (
                  <SyntaxHighlighter
                    key={index}
                    language={codeLanguage || "plaintext"}
                    style={atomOneDark}
                    showLineNumbers
                    wrapLongLines
                    customStyle={{
                      padding: "10px",
                      borderRadius: "5px",
                      backgroundColor: "#000",
                      fontSize: "14px",
                      overflowX: "auto",
                      marginTop: "10px",
                    }}
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                );
              } else {
                insideCodeBlock = true;
                codeLanguage = line.trim().replace(/```/, "");
                return null;
              }
            }

            // Si on est dans un bloc de code, on ajoute les lignes au buffer
            if (insideCodeBlock) {
              codeBuffer.push(line);
              return null;
            }

            // TITRE PRINCIPAL
            if (/^\*\*(.+)\*\*$/.test(line)) {
              return (
                <Typography key={index} variant="h6" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
                  {line.replace(/\*\*/g, "")}
                </Typography>
              );
            }

            // SOUS-TITRE
            if (/^###\s+(.+)$/.test(line)) {
              return (
                <Typography key={index} variant="subtitle1" sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
                  {line.replace(/^###\s+/, "")}
                </Typography>
              );
            }

            // TEXTE EN GRAS
            if (/\*\*(.+?)\*\*/.test(line)) {
              return (
                <Typography key={index} variant="body1">
                  <strong>{line.replace(/\*\*/g, "")}</strong>
                </Typography>
              );
            }

            // TEXTE NORMAL
            return (
              <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                {line}
              </Typography>
            );
          })}
        </>
      </Paper>
    </Box>
  );
}
