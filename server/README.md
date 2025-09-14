# Qlik Chatbot Middleware - README

## Purpose
This Node.js server:
- Accepts POST /ai-query from the extension
- Optionally reads Qlik object layouts/hypercubes via enigma.js
- Calls OpenAI Chat Completions to get analysis/answers
- Returns structured JSON including `text`, optional `chart`, and optional `downloadUrl`.

## Env variables (required)
- OPENAI_API_KEY (or LLM_KEY) - OpenAI API key
- ENIGMA_WS_URL - enigma websocket URL for your Qlik tenant (wss://...)
- QLIK_API_KEY - Qlik machine-to-machine API key (used as Authorization Bearer header)
- PORT - optional, default 3000

## Run locally
1. cd server
2. npm install
3. export env vars
4. npm start
