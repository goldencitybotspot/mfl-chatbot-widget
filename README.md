# MFL Chatbot – Vercel Template

## Quick Start
1) Install Vercel CLI
```
npm i -g vercel
```
2) Add your API key in Vercel:
- Project → Settings → Environment Variables → `OPENAI_API_KEY`
- (Optional) `ALLOWED_ORIGINS` = `https://your-site.com,https://www.your-site.com`

3) Deploy
```
vercel
vercel --prod
```

4) Copy your endpoint:
```
https://YOUR-PROJECT.vercel.app/api/chat
```

5) Paste `widget_snippet.html` into Elementor → HTML (or Theme Builder).
- Set `CHAT_ENDPOINT` to the URL above.
- Flip `MODE` between `"page"` and `"site"` as needed.

## Config
All branding, prompt, topics, and verses live in `mfl_bot_config.json`.
- `topicKeywords` enables synonyms for topic detection.
- `topicVerses` returns 5 NCV verses instantly for a matched topic.

## Notes
- This function uses `gpt-4o-mini` by default.
- For privacy, avoid logging PII. This template does not store chat history.
- You can host multiple client bots as separate Vercel projects.
