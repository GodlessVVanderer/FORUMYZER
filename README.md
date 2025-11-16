# Forumyzer Production Package (Web App & Chrome Extension)

Welcome to **Forumyzer**, a project that transforms chaotic YouTube comment sections into civil, structured conversations. This repository is set up as a dual‑target project: a Chrome extension and a standalone web application, both backed by a Node/Express API. It includes everything you need to run Forumyzer in production (with placeholder values where sensitive keys belong) and offers a robust foundation for scaling, monetising and adding advanced features like AI‑driven audio summaries.

## Repository Structure

```
forumyzer_full_package/
├── backend/              # Node/Express API (persistent storage, classification, audio service)
├── extension/            # Chrome extension built with React + Vite
├── webapp/               # Standalone React web app
├── .env.example          # Example environment variables (copy to .env)
└── README.md             # This file
```

### backend/

The `backend` directory contains a minimal Express server that exposes REST endpoints used by the extension and webapp. It defines models for saved forums, users and subscriptions, uses a simple JSON file for storage (replace with a real database in production), and includes placeholder services for comment classification and audio generation. All keys are read from environment variables—**no secrets are checked into the repo**.

Key files:

- **server.js** – Bootstraps the Express server, sets up CORS, defines routes for forumising videos, saving/retrieving forums, adding replies, generating share tokens and streaming audio summaries. A health endpoint (`/health`) is provided for monitoring.
- **package.json** – Lists dependencies (Express, Axios, UUID, etc.) and defines a `start` script. Install with `npm install` and run with `npm start`.
- **db.js / db.json** – A simple JSON‑based storage helper. Replace with a database (e.g. PostgreSQL) for production.
- **models/** – Contains `forum.js` and `user.js` which define data‑layer operations. Modify to match your actual database schema.
- **services/classifier.js** – A placeholder spam classifier. Replace with your AI/Gemini integration.
- **services/forumize.js** – Fetches comments from YouTube using the Data API, runs classification and builds forum threads. Requires a `YOUTUBE_API_KEY` environment variable.
- **services/audio.js** – A stub for generating audio summaries. In production, call a TTS API to create a “podcast” using the top comments.

### extension/

The `extension` directory houses the Chrome extension. It’s built with React and Vite and implements all UI components: a popup with tabs for the current forum and the user’s forum library, detailed views with export/share options, settings and upgrade panels, and a new **AudioPodcast** component that plays a generated audio summary of the top discussions. The background script manages authentication via the Chrome identity API, calls the backend and caches results. A content script injects a button into YouTube to trigger forumisation.

Key files:

- **manifest.json** – Chrome Manifest V3 with OAuth client ID (placeholder), host permissions for the backend and YouTube, and declarations for the background and content scripts.
- **background.js** – Service worker that listens for messages from content scripts and the popup, obtains OAuth tokens, calls the backend, stores forum data in `chrome.storage`, and handles audio requests.
- **contentScript.js** – Injects a “Forumyzer” button into YouTube’s UI and sends messages to the background script when clicked.
- **index.html** – The popup’s HTML shell (loaded by the extension when you click the extension icon).
- **app.tsx** – The main React entry for the popup. Includes navigation between “Current Forum,” “Your Forums,” and “Settings” tabs. Calls into components.
- **ForumLibrary.tsx** – Lists saved forums and navigates to detailed views. Fetches data from the backend via `chrome.storage`.
- **ForumDetail.tsx** – Shows threads for a selected forum, includes export/share and audio podcast controls.
- **SettingsPanel.tsx**, **UpgradePrompt.tsx**, **ExportMenu.tsx**, **exportForum.ts** – UI components for user preferences, premium upsells, exporting forums to JSON/PDF (PDF generation left as a future enhancement) and creating shareable links.
- **AudioPodcast.tsx** – A placeholder component that will display an embedded audio player for AI‑generated summaries.
- **icons/** – Directory for extension icons (placeholder PNGs included).
- **package.json** – Defines extension dependencies (React, React DOM, Vite, TypeScript) and scripts to build and serve the extension. Run `npm install`, then `npm run dev` to launch a dev server or `npm run build` to produce distributable assets.
- **vite.extension.config.ts** – Custom Vite configuration for the Chrome extension, defining multiple entry points (popup and background). Don’t forget to update the `entryFileNames` mapping if you add more scripts.

### webapp/

The `webapp` directory contains a standalone React version of Forumyzer. It shares components with the extension where possible and can be deployed to a web server (e.g. Netlify or Firebase Hosting). The app uses `vite.config.ts` for bundling, reads API and auth credentials from environment variables, and includes its own `package.json`.

Key files:

- **package.json** – Contains dependencies for the web app and scripts to run and build it.
- **vite.config.ts** – Configuration for Vite, specifying the entry points and environment variables.
- **public/index.html** – HTML template for the React app.
- **src/app.tsx** – Root component for the web app, similar to the extension’s popup but adapted for a full page.
- **src/components/** – Contains the same React components as the extension (ForumLibrary, ForumDetail, SettingsPanel, etc.) plus a placeholder `AudioPodcast.tsx`.

## Environment Variables

Copy `.env.example` to `.env` in the root of each package (backend, extension, webapp) and fill in the values:

```
# backend/.env
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY_HERE
JWT_SECRET=YOUR_SECRET_HERE
OAUTH_CLIENT_ID=YOUR_OAUTH_CLIENT_ID
OAUTH_CLIENT_SECRET=YOUR_OAUTH_CLIENT_SECRET

# extension/.env (Vite automatically exposes variables prefixed with VITE_)
VITE_BACKEND_URL=http://localhost:3000
VITE_OAUTH_CLIENT_ID=YOUR_OAUTH_CLIENT_ID

# webapp/.env
VITE_BACKEND_URL=http://localhost:3000
VITE_OAUTH_CLIENT_ID=YOUR_OAUTH_CLIENT_ID
```

## Building & Running

### Backend

```bash
cd forumyzer_full_package/backend
npm install
# copy .env.example to .env and fill in secrets
npm start
```

### Chrome Extension

```bash
cd forumyzer_full_package/extension
npm install
# copy .env.example to .env and fill in secrets
npm run dev   # serves the popup on localhost for development
npm run build # creates the dist/ folder for packaging the extension
```

Load the unpacked extension from Chrome’s Extensions page (`chrome://extensions`) by enabling Developer Mode and selecting the `extension/dist` folder.

### Web App

```bash
cd forumyzer_full_package/webapp
npm install
# copy .env.example to .env and fill in secrets
npm run dev   # launches the web app at http://localhost:5173
npm run build # compiles to dist/ for deployment
```

## Future Enhancements

This project contains placeholder implementations and simple JSON storage. For production:

- Replace the JSON storage with a real database (PostgreSQL, MongoDB or Firebase).
- Implement user accounts, subscriptions and premium quotas.
- Replace the naive classifier with a call to your AI service (e.g. Gemini or a custom model) and tune thresholds.
- Implement audio generation in `services/audio.js` using a TTS API (e.g. Google Cloud Text‑to‑Speech) and update the frontend to fetch and play audio.
- Integrate scene detection and real‑time video analysis as outlined in the
  **FORUMYZER_VIDEO_PROCESSING_ARCHITECTURE.md** document. This requires
  heavy processing via Vertex AI and NVIDIA DeepStream, which is beyond the
  scope of the current demo. The backend currently exposes a stub
  `/api/evaluate-comment` endpoint that returns `found: false`. Replace
  this stub with calls to the video analysis pipeline once the cloud
  infrastructure is in place. Be mindful of performance and privacy
  implications when adding real‑time processing to the extension.
- Add GDPR‑compliant privacy policy and data deletion endpoints.
- Integrate analytics for usage metrics and conversion tracking.

We hope this package provides a solid foundation to build the next generation of civil, AI‑powered discussion forums on top of YouTube.