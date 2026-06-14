# Tara Travel Assistant

Tara is a small no-database AI travel chatbot built with Next.js, TypeScript, LangChain.js, and static travel data. It can answer travel questions, suggest destinations, create basic trip plans, and generate route-style answers such as `suggest me a Durg to Delhi tour`.

## Features

- Chat UI with browser `localStorage` history.
- `POST /api/chat` route for AI responses.
- LangChain model routing across Gemini, Mistral, and Groq-hosted models.
- Static travel data for destinations, Indian routes, budget ranges, sample itineraries, and travel tips.
- Local fallback answer when API keys are not configured.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and add your keys:

```bash
GEMINI_API_KEY=
MISTRAL_API_KEY=
GROQ_API_KEY=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run lint
npm run build
npm run format
```

## Notes

The app does not use a database or authentication. Chat history is stored only in the current browser. Travel prices, driving times, weather, hotels, flights, visa rules, and safety details should be verified from live or official sources before booking.
