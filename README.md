# Frontend React + TypeScript (Vite) – UI de recherche et chat documentaire

Interface web pour rechercher des documents, les téléverser, interroger un document, gérer les discussions/messages, et générer des réponses contextuelles via le backend FastAPI.

## Démarrage rapide

- Node 20 recommandé
- Installer: `npm install`
- Dev server: `npm run dev` → `http://localhost:5173`
- Avec Docker Compose: service `web` expose `5173`, backend accessible sur `http://localhost:8000`

## Structure et composants

- `src/components/` Chat, upload, liste et vue document, paramètres, sidebar.
- `src/services/` appels HTTP vers le backend:
  - `search_service.tsx`: `/search/`, `/search/simple`, `/search/internal/`, `/search/document-query/`
  - `document_upload_service.tsx`: `POST /documents/`
  - `document_service.tsx`: `GET/LIST/PATCH/DELETE /documents`
  - `discussions_services.tsx`: CRUD `/discussions`
  - `message_service.tsx`: CRUD `/messages`
  - `context_services.tsx`: `POST/GET/DELETE /contexts`
  - `history_services.tsx`: `POST /history/`, `GET /history/{discussion_id}`, `DELETE /history/{history_id}`
  - `generate_services.tsx`: `POST /generate`, `GET /models`, `POST /models/select`

Toutes les URLs pointent par défaut sur `http://localhost:8000` via `API_BASE_URL` défini en haut de chaque service.

## Fonctionnalités UI

- Recherche avancée: filtres (tables, entités, dates, etc.), rerank LLM, réponse optionnelle.
- Recherche simple: champ `q`, résultats rapides.
- Interrogation d’un document par nom (QA ciblée).
- Upload de documents avec pipeline de traitement et enrichissement LLM optionnel.
- Gestion des discussions, messages, contextes et historique.
- Sélection du modèle LLM côté UI via `/models` et `/models/select`.

## Configuration

- Le backend doit être accessible sur `http://localhost:8000`. Si vous servez ailleurs (proxy, Docker distant), adaptez `API_BASE_URL` dans les fichiers de `src/services/`.
- ESLint/TS déjà configurés (voir `eslint.config.js`, `tsconfig*.json`).

## Scripts NPM

- `npm run dev`: lance Vite en mode dev (HMR)
- `npm run build`: build de production
- `npm run preview`: prévisualisation du build
- `npm run lint`: lint du projet

## Docker

- Dockerfile basé sur `node:18`, expose `5173` et lance Vite (`--host`).
- En Compose, le volume monte le dossier pour HMR, et un volume anonyme est utilisé pour `node_modules`.

## Dépendances clés

- React 19, React Router 7, Material UI v6, Axios, Dropzone, Syntax Highlighter.

