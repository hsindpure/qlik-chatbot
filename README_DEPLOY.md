# Deploy & integrate Qlik Chatbot (SaaS)

## 1) Backend deployment (recommended)
- Choose host: Vercel, Heroku, AWS Elastic Beanstalk, DigitalOcean App Platform, etc.
- Push server folder to your repo and configure the build/start commands (`npm install`, `npm run start`).
- Configure environment variables in hosting platform:
  - OPENAI_API_KEY (required)
  - ENIGMA_WS_URL (required) — Qlik websocket endpoint for session apps
  - QLIK_API_KEY (required) — machine-to-machine key for Qlik API/Engine access
  - PORT
- Use HTTPS; set CORS origin to your Qlik tenant or allow only the Qlik Cloud origin.
- For downloads, replace local static serving with S3/GCS signed URLs in production.

## 2) Qlik extension
- Zip extension folder contents (no wrapper folder) to `qlik_chatbot_extension.zip`.
- Upload to Qlik Cloud Admin > Extensions > Add.
- Add the extension to a sheet and configure the `AI Middleware URL` property to `https://<your-host>/ai-query`.
- Provide object IDs in properties if you want the extension to include them in context.

## 3) Qlik session settings & enigma
- ENIGMA_WS_URL must point to a QIX websocket endpoint for your tenant (the exact URL structure depends on your tenant & virtual proxy).
- Review Qlik docs on session apps and enigma.js for exact endpoints & header requirements. :contentReference[oaicite:7]{index=7}

## 4) Security checklist (mandatory)
- Keep OPENAI_API_KEY and QLIK_API_KEY only on the server (never client-side)
- Add authentication for extension->middleware calls (simple header token or HMAC)
- Rate-limit requests and log usage
- Use S3 presigned URLs for large exports
