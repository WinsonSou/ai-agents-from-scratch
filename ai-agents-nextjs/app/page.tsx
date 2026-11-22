import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';

const examples = [
  {
    id: '01-intro',
    title: 'Introduction',
    description: 'Basic LLM interaction with generateText - your first step into AI development',
    concepts: ['generateText', 'Model setup', 'Token usage'],
    icon: '👋',
    difficulty: 'beginner',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '02-translation',
    title: 'Translation',
    description: 'Master system prompts to create specialized AI agents for any task',
    concepts: ['System prompts', 'Role specialization', 'Output control'],
    icon: '🌍',
    difficulty: 'beginner',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: '03-reasoning',
    title: 'Reasoning',
    description: 'Unlock chain-of-thought prompting for complex problem solving',
    concepts: ['Chain-of-thought', 'Problem decomposition', 'Temperature'],
    icon: '🧠',
    difficulty: 'intermediate',
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: '04-streaming',
    title: 'Streaming',
    description: 'Build responsive UIs with real-time token streaming',
    concepts: ['streamText', 'useChat', 'Real-time UI'],
    icon: '⚡',
    difficulty: 'intermediate',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: '05-tools',
    title: 'Tool Calling',
    description: 'Give your AI superpowers with function calling and external tools',
    concepts: ['tool()', 'Zod schemas', 'Execution'],
    icon: '🔧',
    difficulty: 'intermediate',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: '06-memory',
    title: 'Memory',
    description: 'Create context-aware agents that remember conversations',
    concepts: ['Message history', 'Context window', 'Persistence'],
    icon: '💾',
    difficulty: 'intermediate',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: '07-react-agent',
    title: 'ReAct Agent',
    description: 'Build autonomous agents with the Reasoning + Acting pattern',
    concepts: ['maxSteps', 'Tool loops', 'Observations'],
    icon: '🔄',
    difficulty: 'advanced',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: '08-aot-agent',
    title: 'AoT Agent',
    description: 'Create structured plans with Atom of Thought methodology',
    concepts: ['generateObject', 'Zod schemas', 'Planning'],
    icon: '⚛️',
    difficulty: 'advanced',
    color: 'from-teal-500 to-cyan-600',
  },
];

const features = [
  {
    icon: '🚀',
    title: 'Next.js 16',
    description: 'Latest features including Turbopack, PPR, and React 19',
  },
  {
    icon: '🤖',
    title: 'Vercel AI SDK',
    description: 'Production-ready tools for building AI applications',
  },
  {
    icon: '🏠',
    title: 'Local LLMs',
    description: 'Works with Ollama, LM Studio, or any OpenAI-compatible API',
  },
  {
    icon: '⚡',
    title: 'Bun Runtime',
    description: 'Blazing fast development with Bun package manager',
  },
];

const quickStartCode = `# Clone and install
git clone <repo-url>
cd ai-agents-nextjs
bun install

# Start your local LLM (Ollama example)
ollama serve
ollama pull qwen3:1.7b

# Run the development server
bun dev`;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="info" className="mb-6">
                Next.js 16 + AI SDK v5 + Local LLMs
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Build <span className="gradient-text">AI Agents</span> From Scratch
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Master the fundamentals of AI agent development with hands-on examples. 
                Learn how LLMs, tools, and reasoning patterns work together.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/examples/01-intro"
                  className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start Learning →
                </Link>
                <a
                  href="https://sdk.vercel.ai/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  AI SDK Docs
                </a>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <CodeBlock
                code={quickStartCode}
                language="bash"
                filename="Terminal"
                showLineNumbers={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-muted"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Learning Path
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Progress from basic LLM interactions to building sophisticated autonomous agents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {examples.map((example, index) => (
              <Link key={example.id} href={`/examples/${example.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${example.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {example.icon}
                      </div>
                      <Badge
                        variant={
                          example.difficulty === 'beginner'
                            ? 'success'
                            : example.difficulty === 'intermediate'
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        {example.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-semibold text-foreground">
                        {example.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {example.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {example.concepts.map((concept) => (
                        <Badge key={concept} variant="secondary">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build AI Agents?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start with the fundamentals and work your way up to advanced agent patterns.
          </p>
          <Link
            href="/examples/01-intro"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            Begin Your Journey
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <div>
                <p className="font-semibold text-white">AI Agents Tutorial</p>
                <p className="text-sm">Built with Next.js 16 & Vercel AI SDK</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="https://sdk.vercel.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                AI SDK
              </a>
              <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Next.js
              </a>
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Ollama
              </a>
              <a href="https://bun.sh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Bun
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
