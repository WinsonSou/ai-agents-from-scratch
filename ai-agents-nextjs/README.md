# AI Agents with Next.js 16 & Vercel AI SDK

Learn to build AI agents using **Next.js 16**, **Vercel AI SDK**, and **local LLMs** (Ollama/LM Studio).

## Tech Stack

- **Next.js 16** - App Router with Turbopack
- **Vercel AI SDK v5** - `generateText`, `streamText`, `tool`, `generateObject`
- **Bun** - Fast JavaScript runtime and package manager
- **OpenAI-compatible provider** - Works with Ollama, LM Studio, or any compatible API
- **Zod** - Type-safe schema validation for tools

## Prerequisites

1. **Bun** (latest version)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **Node.js 20+** (required by Next.js 16)

3. **Ollama** or **LM Studio** for local LLMs
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull a model
   ollama pull qwen3:1.7b
   ```

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start Ollama (in another terminal)
ollama serve

# Run the dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Configuration

Edit `.env` to configure your local LLM:

```env
# For Ollama (default port 11434)
LOCAL_LLM_URL=http://localhost:11434/v1

# For LM Studio (default port 1234)
# LOCAL_LLM_URL=http://localhost:1234/v1

# Model name
LOCAL_LLM_MODEL=qwen3:1.7b
```

## Learning Path

### 1. Introduction
Basic LLM interaction with `generateText`
- Route: `/examples/01-intro`
- API: `/api/generate`

### 2. Translation
System prompts for role specialization
- Route: `/examples/02-translation`
- Concepts: System prompts, output control

### 3. Reasoning
Complex problem solving with chain-of-thought
- Route: `/examples/03-reasoning`
- Concepts: Step-by-step reasoning, problem decomposition

### 4. Streaming
Real-time responses with `streamText` and `useChat`
- Route: `/examples/04-streaming`
- API: `/api/chat`
- Concepts: Token streaming, React hooks

### 5. Tool Calling
Function calling with `tool()` and Zod schemas
- Route: `/examples/05-tools`
- API: `/api/tools`
- Concepts: Tool definitions, parameter validation

### 6. Memory
Persistent conversation state
- Route: `/examples/06-memory`
- Concepts: Message history, context management

### 7. ReAct Agent
Reasoning + Acting pattern with multi-step execution
- Route: `/examples/07-react-agent`
- API: `/api/react-agent`
- Concepts: Think-Act-Observe loop, `maxSteps`

### 8. AoT Agent
Atom of Thought planning with structured output
- Route: `/examples/08-aot-agent`
- API: `/api/aot-agent`
- Concepts: `generateObject`, Zod schemas, dependency resolution

## Project Structure

```
ai-agents-nextjs/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Tailwind styles
│   ├── api/
│   │   ├── generate/route.ts # Text generation
│   │   ├── chat/route.ts     # Streaming chat
│   │   ├── tools/route.ts    # Tool calling
│   │   ├── react-agent/route.ts
│   │   └── aot-agent/route.ts
│   └── examples/
│       ├── 01-intro/
│       ├── 02-translation/
│       ├── 03-reasoning/
│       ├── 04-streaming/
│       ├── 05-tools/
│       ├── 06-memory/
│       ├── 07-react-agent/
│       └── 08-aot-agent/
├── lib/
│   ├── ai-provider.ts        # OpenAI-compatible config
│   └── tools/
│       └── calculator.ts     # Tool definitions
├── package.json
└── bunfig.toml
```

## Key AI SDK Functions

### `generateText`
```typescript
const { text } = await generateText({
  model: defaultModel,
  prompt: 'Hello!',
});
```

### `streamText`
```typescript
const result = streamText({
  model: defaultModel,
  messages,
});
return result.toDataStreamResponse();
```

### `tool`
```typescript
const myTool = tool({
  description: 'Does something',
  parameters: z.object({ input: z.string() }),
  execute: async ({ input }) => result,
});
```

### `generateObject`
```typescript
const { object } = await generateObject({
  model: defaultModel,
  schema: myZodSchema,
  prompt: 'Generate structured data',
});
```

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Ollama](https://ollama.ai)
- [LM Studio](https://lmstudio.ai)

## License

MIT - Educational resource for learning AI agent development.
