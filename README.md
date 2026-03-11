# Debate Duo (AI Debate Simulator)

A Next.js app that simulates realistic turn-based debates between AI agents (Pro vs Con) on user-provided topics, with real-time turn-by-turn interaction.

## 🚀 Quick Start

```bash
npm i
cp .env.example .env
# Configure Azure OpenAI (see below)
npm run dev
```

Open http://localhost:3000 (or 3001 if 3000 is occupied)

## 🔧 Azure OpenAI Setup

Update your `.env` file with Azure OpenAI credentials:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_BASE=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_MODEL=gpt-4
```

**Required Azure Resources:**
- Azure OpenAI resource with GPT-4 deployment
- API key and endpoint URL from Azure Portal
- Deployment name (e.g., "gpt-4")

## 🎯 How It Works

### Real-Time Turn-Based Simulation
- **User 1 (Pro)** speaks first, presenting their opening argument
- **User 2 (Con)** responds with their perspective
- **Alternating turns** for 3 rounds (Opening → Rebuttal → Closing)
- **Live typing simulation** shows each agent "thinking" and responding
- **Progressive debate building** - each turn builds on previous arguments

### Technical Architecture
- **Frontend**: `app/page.tsx` - Real-time UI with turn-by-turn animation
- **Backend**: `app/api/debate/route.ts` - Orchestrates debate flow
- **Turn Management**: Sequential API calls simulate real conversation timing
- **State Management**: Progressive debate state updates

### Debate Structure
1. **Round 1 - Opening Statements**: Each side presents their initial position
2. **Round 2 - Rebuttals**: Each side responds to opponent's arguments  
3. **Round 3 - Closing Arguments**: Final summary and persuasive appeals

## 🎮 Features

- **Real-time turn simulation** with typing indicators
- **Progressive argument building** based on previous turns
- **Side-by-side debate visualization**
- **Azure OpenAI integration** for enterprise-grade AI
- **Responsive design** for all screen sizes
- **Server-side API calls** - no keys exposed to browser

## 📁 File Structure

```
app/
├── page.tsx              # Main UI with turn-by-turn simulation
├── api/debate/route.ts   # Azure OpenAI integration
└── globals.css          # Responsive styling

components/
└── DebateColumn.tsx     # Individual side display

lib/
├── prompts.ts           # Agent system prompts
└── types.ts            # TypeScript definitions
```

## 🔒 Security Notes

- Azure OpenAI API key is **only** used on the server route
- No API keys or sensitive data exposed to browser
- Environment variables properly configured

## ⚙️ Configuration

- **Default Model**: Azure GPT-4 deployment
- **Max Tokens**: 380 per response (reasonable length)
- **API Version**: 2024-12-01-preview
- **Debate Rounds**: 3 (configurable in code)

## 🚀 Deployment

The app is ready for deployment on Vercel, Netlify, or any Node.js hosting platform. Ensure environment variables are properly configured in production.
