import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DocumentResponse } from "../types/document";
import { getDocumentId, getDocumentImage, formatDate } from "../utils/documentUtils";
import { MetadataTag, METADATA_COLORS } from "../types/metadata";
import { extractMetadataTags, extractBestEntities } from "../utils/documentUtils";
import { queryDocument } from "../services/document_query_service";

interface DocumentViewerProps {
  document: DocumentResponse | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function DocumentViewer({ document: doc, onClose, onDelete }: DocumentViewerProps) {
  if (!doc) return null;

  const image = getDocumentImage(doc);
  if (!image) return null;

  // Créer l'URL de l'image
  const imageUrl = image.startsWith('data:') ? image : `data:image/png;base64,${image}`;
  
  // Extraire les métadonnées
  const tags = extractMetadataTags(doc);
  const bestEntities = extractBestEntities(doc);
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, MetadataTag[]>);

  // Fonction pour formater le score
  const formatScore = (score?: number) => {
    if (score === undefined) return '';
    return `${Math.round(score * 100)}%`;
  };

  // Ouvrir le document dans une nouvelle fenêtre
  const openInNewWindow = () => {
    const documentName = (doc.metadata?.filename || doc.title || '').replace(/'/g, "\\'");
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${doc.title || `Document ${getDocumentId(doc)}`}</title>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            overflow: hidden;
            height: 100vh;
            display: flex;
            background-color: #f5f5f5;
          }
          
          .sidebar {
            width: 320px;
            background-color: white;
            height: 100%;
            overflow-y: auto;
            transition: transform 0.3s ease;
            border-right: 1px solid #eee;
            padding: 24px;
            box-shadow: 0 0 15px rgba(0,0,0,0.05);
          }
          
          .sidebar.collapsed {
            transform: translateX(-100%);
          }
          
          .sidebar-right {
            width: 320px;
            background-color: white;
            height: 100%;
            overflow-y: auto;
            transition: transform 0.3s ease;
            border-left: 1px solid #eee;
            padding: 24px;
            box-shadow: 0 0 15px rgba(0,0,0,0.05);
          }
          
          .sidebar-right.collapsed {
            transform: translateX(100%);
          }
          
          .main-content {
            flex: 1;
            height: 100%;
            overflow: auto;
            display: flex;
            flex-direction: column;
            background-color: #f5f5f5;
            position: relative;
          }

          .tabs-container {
            display: flex;
            background-color: white;
            border-bottom: 1px solid #e0e0e0;
            padding: 0 24px;
          }

          .tab {
            padding: 16px 24px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: #666;
          }

          .tab:hover {
            background-color: #f5f5f5;
            color: #1976d2;
          }

          .tab.active {
            color: #1976d2;
            border-bottom-color: #1976d2;
            background-color: #f8f9fa;
          }

          .tab-content {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 24px;
            position: relative;
          }

          .tab-content.hidden {
            display: none;
          }

          .document-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .search-container {
            width: 100%;
            max-width: 800px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 24px;
          }

          .search-form {
            margin-bottom: 24px;
          }

          .search-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 16px;
            transition: border-color 0.2s ease;
          }

          .search-input:focus {
            outline: none;
            border-color: #1976d2;
          }

          .search-button {
            background-color: #1976d2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .search-button:hover {
            background-color: #1565c0;
          }

          .search-button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }

          .response-container {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
            border-left: 4px solid #1976d2;
          }

          .response-text {
            line-height: 1.6;
            color: #333;
            white-space: pre-wrap;
          }

          .loading {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #1976d2;
            font-weight: 500;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #e0e0e0;
            border-top: 2px solid #1976d2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .error {
            background-color: #ffebee;
            color: #c62828;
            padding: 12px;
            border-radius: 8px;
            margin-top: 16px;
            border-left: 4px solid #c62828;
          }

          .example-btn {
            background-color: #f5f5f5;
            color: #666;
            border: 1px solid #e0e0e0;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }

          .example-btn:hover {
            background-color: #1976d2;
            color: white;
            border-color: #1976d2;
          }
          
          .document-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .toggle-btn {
            position: absolute;
            top: 20px;
            background-color: white;
            color: #333;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
          }
          
          .toggle-btn:hover {
            background-color: #f5f5f5;
            transform: scale(1.05);
          }
          
          .toggle-left {
            left: 20px;
          }
          
          .toggle-right {
            right: 20px;
          }
          
          .sidebar-title {
            font-size: 20px;
            font-weight: 600;
            color: #1976d2;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
          }

          .sidebar-title .material-icons {
            font-size: 24px;
          }

          .collapsible-section {
            margin-bottom: 16px;
          }

          .collapsible-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background-color: rgba(25, 118, 210, 0.08);
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 8px;
            user-select: none;
            transition: all 0.2s ease;
            border: 1px solid rgba(25, 118, 210, 0.12);
          }

          .collapsible-header:hover {
            background-color: rgba(25, 118, 210, 0.12);
          }

          .collapsible-header span {
            font-weight: 600;
            color: #1976d2;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .collapsible-header .material-icons {
            font-size: 20px;
            color: #1976d2;
          }

          .collapsible-content {
            transition: max-height 0.3s ease-out;
            overflow: hidden;
            max-height: 1000px;
          }

          .info-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 12px;
          }

          .info-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            background-color: rgba(25, 118, 210, 0.04);
            border: 1px solid rgba(25, 118, 210, 0.12);
            transition: all 0.2s ease;
          }

          .info-item:last-child {
            margin-bottom: 0;
          }

          .info-item:hover {
            background-color: rgba(25, 118, 210, 0.08);
            border-color: rgba(25, 118, 210, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .info-item-content {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }

          .info-item-icon {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            background-color: rgba(25, 118, 210, 0.1);
            flex-shrink: 0;
          }

          .info-item-icon .material-icons {
            font-size: 16px;
            color: #1976d2;
          }

          .info-item-details {
            flex: 1;
            min-width: 0;
          }

          .info-item-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 2px;
            letter-spacing: 0.3px;
          }

          .info-item-text {
            font-size: 13px;
            color: #1976d2;
            font-weight: 500;
            line-height: 1.4;
            word-break: break-word;
            white-space: normal;
          }

          .info-item-text[title] {
            cursor: help;
          }

          .info-badge {
            font-size: 13px;
            font-weight: 500;
            color: #1976d2;
          }

          .info-section {
            margin-bottom: 24px;
            background-color: #f8f9fa;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(25, 118, 210, 0.1);
            transition: all 0.2s ease;
          }

          .info-section:hover {
            border-color: rgba(25, 118, 210, 0.3);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }

          .info-group {
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(0,0,0,0.06);
          }

          .info-group:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }

          .info-group-title {
            font-size: 14px;
            font-weight: 600;
            color: #1976d2;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .info-group-title .material-icons {
            font-size: 18px;
          }
          
          .info-label {
            font-weight: 500;
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .info-label .material-icons {
            font-size: 16px;
            color: #999;
            flex-shrink: 0;
          }
          
          .info-value {
            font-size: 14px;
            margin-bottom: 12px;
            color: #333;
            padding-left: 22px;
            word-break: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
            line-height: 1.4;
          }

          .info-value:last-child {
            margin-bottom: 0;
          }

          .info-value.truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .tag:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          /* Scrollbar personnalisée */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #bbb;
          }
        </style>
      </head>
      <body>
        <div id="left-sidebar" class="sidebar">
          <h2 class="sidebar-title">
            <span class="material-icons">description</span>
            Informations
          </h2>

          <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('identification-content', 'identification-icon')">
              <span>
                <span class="material-icons">badge</span>
                Identification
              </span>
              <span id="identification-icon" class="material-icons">expand_more</span>
            </div>
            <div id="identification-content" class="collapsible-content">
              <div class="info-container">
                <div class="info-item">
                  <div class="info-item-content">
                    <div class="info-item-icon">
                      <span class="material-icons">tag</span>
                    </div>
                    <div class="info-item-details">
                      <div class="info-item-label">Identifiant</div>
                      <div class="info-item-text">
                        ${getDocumentId(doc)}
                      </div>
                    </div>
                  </div>
                </div>

                ${doc.metadata?.filename ? `
                  <div class="info-item">
                    <div class="info-item-content">
                      <div class="info-item-icon">
                        <span class="material-icons">insert_drive_file</span>
                      </div>
                      <div class="info-item-details">
                        <div class="info-item-label">Nom du fichier</div>
                        <div class="info-item-text" title="${doc.metadata.filename}">
                          ${doc.metadata.filename}
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${doc.title ? `
                  <div class="info-item">
                    <div class="info-item-content">
                      <div class="info-item-icon">
                        <span class="material-icons">title</span>
                      </div>
                      <div class="info-item-details">
                        <div class="info-item-label">Titre</div>
                        <div class="info-item-text" title="${doc.title}">
                          ${doc.title}
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          ${(doc.metadata?.upload_date || doc.metadata?.created_at) ? `
            <div class="collapsible-section">
              <div class="collapsible-header" onclick="toggleSection('dates-content', 'dates-icon')">
                <span>
                  <span class="material-icons">schedule</span>
                  Dates
                </span>
                <span id="dates-icon" class="material-icons">expand_more</span>
              </div>
              <div id="dates-content" class="collapsible-content">
                <div class="info-container">
                  ${doc.metadata?.upload_date ? `
                    <div class="info-item">
                      <div class="info-item-content">
                        <div class="info-item-icon">
                          <span class="material-icons">cloud_upload</span>
                        </div>
                        <div>
                          <div class="info-item-label">Date de dépôt</div>
                          <div class="info-item-text">
                            ${formatDate(doc.metadata.upload_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ` : ''}

                  ${doc.metadata?.created_at ? `
                    <div class="info-item">
                      <div class="info-item-content">
                        <div class="info-item-icon">
                          <span class="material-icons">add_circle_outline</span>
                        </div>
                        <div>
                          <div class="info-item-label">Date d'ajout</div>
                          <div class="info-item-text">
                            ${formatDate(doc.metadata.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          ` : ''}

          ${doc.metadata?.source ? `
            <div class="collapsible-section">
              <div class="collapsible-header" onclick="toggleSection('source-content', 'source-icon')">
                <span>
                  <span class="material-icons">source</span>
                  Origine
                </span>
                <span id="source-icon" class="material-icons">expand_more</span>
              </div>
              <div id="source-content" class="collapsible-content">
                <div class="info-container">
                  <div class="info-item">
                    <div class="info-item-content">
                      <div class="info-item-icon">
                        <span class="material-icons">link</span>
                      </div>
                      <div>
                        <div class="info-item-label">Source</div>
                        <div class="info-item-text" title="${doc.metadata.source}">
                          ${doc.metadata.source}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="main-content">
          <button id="toggle-left" class="toggle-btn toggle-left">&lt;</button>
          <button id="toggle-right" class="toggle-btn toggle-right">&gt;</button>
          
          <div class="tabs-container">
            <div class="tab active" data-tab="visualization">
              <span class="material-icons">visibility</span>
              Visualisation
            </div>
            <div class="tab" data-tab="search">
              <span class="material-icons">search</span>
              Interrogation IA
            </div>
          </div>
          
          <div id="visualization-content" class="tab-content">
            <img src="${imageUrl}" alt="${doc.title || 'Document'}" class="document-image" />
          </div>
          
          <div id="search-content" class="tab-content hidden">
            <div class="search-container">
              <h3 style="margin: 0 0 24px 0; color: #1976d2; display: flex; align-items: center; gap: 8px;">
                <span class="material-icons">question_answer</span>
                Interroger ce document
              </h3>
              
              <div class="search-form">
                <textarea 
                  id="question-input" 
                  class="search-input" 
                  placeholder="Posez votre question sur ce document..."
                  rows="3"
                  style="resize: vertical; min-height: 80px;"
                ></textarea>
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                  <button id="search-btn" class="search-button">
                    <span class="material-icons">search</span>
                    Interroger le document
                  </button>
                  <button id="clear-btn" class="search-button" style="background-color: #666;">
                    <span class="material-icons">refresh</span>
                    Effacer
                  </button>
                </div>
                
                <div style="margin-top: 16px;">
                  <p style="margin: 0 0 8px 0; font-weight: 500; color: #666;">Questions d'exemple :</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <button class="example-btn" data-question="Quel est le contenu principal de ce document ?">
                      Contenu principal
                    </button>
                    <button class="example-btn" data-question="Quelles sont les informations importantes ?">
                      Informations importantes
                    </button>
                    <button class="example-btn" data-question="Résume-moi ce document">
                      Résumé
                    </button>
                    <button class="example-btn" data-question="Y a-t-il des dates importantes mentionnées ?">
                      Dates importantes
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="search-results"></div>
            </div>
          </div>
        </div>
        
        <div id="right-sidebar" class="sidebar-right">
          <h2 class="sidebar-title">Entités détectées</h2>
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 24px;
            padding: 12px;
            background-color: #f8f9fa;
            border-radius: 8px;
          ">
            ${[...new Set([...bestEntities, ...Object.values(groupedTags).flat()].map(t => t.category))].map(category => `
              <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                text-transform: uppercase;
                color: ${METADATA_COLORS[category]};
                font-weight: bold;
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background-color: ${METADATA_COLORS[category]};
                  border-radius: 2px;
                "></div>
                ${category}
              </div>
            `).join('')}
          </div>

          <div class="collapsible-section">
            <div class="collapsible-header" onclick="toggleSection('best-entities-content', 'best-entities-icon')">
              <span>
                <span class="material-icons">star</span>
                Entités principales
              </span>
              <span id="best-entities-icon" class="material-icons">expand_more</span>
            </div>
            <div id="best-entities-content" class="collapsible-content">
              <div class="info-container">
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${bestEntities.map(tag => `
                    <div class="tag" 
                      style="
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        min-width: 120px;
                      "
                      title="${tag.score ? `Score de confiance: ${formatScore(tag.score)}` : ''}"
                    >
                      <div style="
                        background-color: ${METADATA_COLORS[tag.category]}15;
                        color: ${METADATA_COLORS[tag.category]};
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: default;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                        border: 1px solid ${METADATA_COLORS[tag.category]}30;
                        width: 100%;
                      ">
                        <span style="font-weight: 500;">${tag.text}</span>
                        ${tag.score ? `
                          <span style="
                            margin-left: 6px;
                            font-size: 10px;
                            opacity: 0.7;
                            font-weight: bold;
                          ">${formatScore(tag.score)}</span>
                        ` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="collapsible-section" style="margin-top: 24px;">
            <div class="collapsible-header" onclick="toggleSection('entities-content', 'entities-icon')">
              <span>
                <span class="material-icons">list</span>
                Toutes les entités
              </span>
              <span id="entities-icon" class="material-icons">expand_more</span>
            </div>
            <div id="entities-content" class="collapsible-content">
              <div class="info-container">
                <div style="
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                  padding: 12px;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                  ${tags.map(tag => `
                    <div class="tag" 
                      style="
                        background-color: ${METADATA_COLORS[tag.category]}10;
                        color: ${METADATA_COLORS[tag.category]};
                        padding: 6px 10px;
                        border-radius: 6px;
                        font-size: 13px;
                        cursor: default;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border: 1px solid ${METADATA_COLORS[tag.category]}20;
                        transition: all 0.2s ease;
                      "
                      title="${tag.score ? `Score de confiance: ${formatScore(tag.score)}` : ''}"
                    >
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 8px;
                      ">
                        <div style="
                          width: 8px;
                          height: 8px;
                          border-radius: 50%;
                          background-color: ${METADATA_COLORS[tag.category]};
                          opacity: 0.7;
                        "></div>
                        <span style="font-weight: 500;">${tag.text}</span>
                      </div>
                      ${tag.score ? `
                        <span style="
                          font-size: 12px;
                          font-weight: 600;
                          padding: 2px 6px;
                          border-radius: 4px;
                          background-color: ${METADATA_COLORS[tag.category]}15;
                        ">${formatScore(tag.score)}</span>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          // Fonctions globales
          function switchTab(tabName) {
            // Masquer tous les contenus d'onglets
            document.querySelectorAll('.tab-content').forEach(content => {
              content.classList.add('hidden');
            });
            
            // Désactiver tous les onglets
            document.querySelectorAll('.tab').forEach(tab => {
              tab.classList.remove('active');
            });
            
            // Afficher le contenu de l'onglet sélectionné
            document.getElementById(tabName + '-content').classList.remove('hidden');
            
            // Activer l'onglet sélectionné
            document.querySelectorAll('.tab').forEach(tab => {
              if (tab.onclick && tab.onclick.toString().includes(tabName)) {
                tab.classList.add('active');
              }
            });
          }

          function setQuestion(question) {
            document.getElementById('question-input').value = question;
          }

          function clearSearch() {
            document.getElementById('question-input').value = '';
            document.getElementById('search-results').innerHTML = '';
          }

          async function searchDocument() {
            const question = document.getElementById('question-input').value.trim();
            if (!question) {
              alert('Veuillez saisir une question');
              return;
            }

            const searchBtn = document.getElementById('search-btn');
            const resultsDiv = document.getElementById('search-results');
            
            // Désactiver le bouton et afficher le loading
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<div class="spinner"></div> Interrogation...';
            
            // Afficher le loading
            resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Interrogation du document en cours...</div>';

            try {
              // Appel à l'API de recherche de document
              const response = await fetch('http://localhost:8000/search/document-query/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  document_name: '${documentName}',
                  question: question,
                  include_context: true,
                  max_context_length: 5000
                })
              });

              const result = await response.json();

              if (result.error) {
                resultsDiv.innerHTML = '<div class="error">Erreur: ' + result.response + '</div>';
              } else {
                resultsDiv.innerHTML = '<div class="response-container"><div class="response-text">' + result.response + '</div></div>';
              }
            } catch (error) {
              console.error('Erreur lors de la recherche:', error);
              resultsDiv.innerHTML = '<div class="error">Une erreur est survenue lors de l\\'interrogation du document</div>';
            } finally {
              // Réactiver le bouton
              searchBtn.disabled = false;
              searchBtn.innerHTML = '<span class="material-icons">search</span> Interroger le document';
            }
          }

          function toggleSection(contentId, iconId) {
            const content = document.getElementById(contentId);
            const icon = document.getElementById(iconId);
            const header = icon.parentElement;
            
            if (content.style.maxHeight === '1000px') {
              content.style.maxHeight = '0';
              icon.style.transform = 'rotate(-90deg)';
              header.style.backgroundColor = '#f0f0f0';
            } else {
              content.style.maxHeight = '1000px';
              icon.style.transform = 'rotate(0)';
              header.style.backgroundColor = '#f8f9fa';
            }
          }

          // Initialisation
          document.addEventListener('DOMContentLoaded', function() {
            // Fonctions pour gérer les panneaux rétractables
            document.getElementById('toggle-left').addEventListener('click', function() {
              document.getElementById('left-sidebar').classList.toggle('collapsed');
            });
            
            document.getElementById('toggle-right').addEventListener('click', function() {
              document.getElementById('right-sidebar').classList.toggle('collapsed');
            });

            // Gestion des onglets
            document.querySelectorAll('.tab').forEach(tab => {
              tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                switchTab(tabName);
              });
            });

            // Gestion des boutons de recherche
            document.getElementById('search-btn').addEventListener('click', searchDocument);
            document.getElementById('clear-btn').addEventListener('click', clearSearch);

            // Gestion des questions d'exemple
            document.querySelectorAll('.example-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const question = this.getAttribute('data-question');
                setQuestion(question);
              });
            });

            // Style au survol pour tous les headers
            document.querySelectorAll('.collapsible-header').forEach(header => {
              header.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f0f0f0';
              });
              header.addEventListener('mouseout', function() {
                const contentId = this.nextElementSibling.id;
                if (document.getElementById(contentId).style.maxHeight === '1000px') {
                  this.style.backgroundColor = '#f8f9fa';
                }
              });
            });

            // Permettre la recherche avec Entrée
            const questionInput = document.getElementById('question-input');
            if (questionInput) {
              questionInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                  searchDocument();
                }
              });
            }
          });
        </script>
      </body>
      </html>
    `;
    
    // Ouvrir une nouvelle fenêtre et écrire le contenu HTML
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  // Appeler openInNewWindow immédiatement
  openInNewWindow();
  onClose();

  return null;
} 