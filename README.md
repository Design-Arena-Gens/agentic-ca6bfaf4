# Agentic Chat

A minimal ChatGPT-like app built with Next.js 14. Streams responses and falls back to a local assistant when `OPENAI_API_KEY` is not set.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build && npm start
```

## Env

- `OPENAI_API_KEY` (optional): enables real OpenAI responses.
- `NEXT_PUBLIC_APP_FOOTER` (optional)

## Deploy

Using Vercel CLI:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-ca6bfaf4
```
