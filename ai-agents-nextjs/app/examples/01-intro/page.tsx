'use client';

import { useState } from 'react';
import { ExampleLayout } from '@/components/layout/example-layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  CodeBlock,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  LabeledTextarea,
  LabeledSlider,
} from '@/components/ui';
import { useConfig } from '@/components/settings-panel';

const codeExample = `// app/api/generate/route.ts
import { generateText } from 'ai';
import { defaultModel } from '@/lib/ai-provider';

export async function POST(req: Request) {
  const { prompt, system, temperature, maxTokens } = await req.json();

  const { text, usage, finishReason } = await generateText({
    model: defaultModel,
    system,
    prompt,
    temperature,
    maxTokens,
  });

  return Response.json({
    text,
    usage: {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
    },
    finishReason,
  });
}`;

const providerCode = `// lib/ai-provider.ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// Works with Ollama, LM Studio, or any OpenAI-compatible API
export const localLLM = createOpenAICompatible({
  name: 'local-llm',
  baseURL: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
});

// Default model - change based on your setup
export const defaultModel = localLLM(
  process.env.LOCAL_LLM_MODEL || 'qwen3:1.7b'
);`;

const presets = [
  {
    name: 'Simple Q&A',
    prompt: 'What is the capital of France?',
    system: '',
    temperature: 0.7,
    maxTokens: 100,
  },
  {
    name: 'Creative Writing',
    prompt: 'Write a haiku about programming',
    system: 'You are a creative poet who writes beautiful, thought-provoking haikus.',
    temperature: 1.0,
    maxTokens: 100,
  },
  {
    name: 'Code Generation',
    prompt: 'Write a function to calculate factorial in TypeScript',
    system: 'You are an expert TypeScript developer. Write clean, type-safe code with comments.',
    temperature: 0.2,
    maxTokens: 300,
  },
  {
    name: 'Explanation',
    prompt: 'Explain quantum computing to a 10-year-old',
    system: 'You explain complex topics in simple, fun ways that kids can understand.',
    temperature: 0.8,
    maxTokens: 200,
  },
];

export default function IntroExample() {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState('What is the capital of France?');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<{
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  } | null>(null);
  const [finishReason, setFinishReason] = useState('');
  const [latency, setLatency] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setError('');
    setUsage(null);
    setFinishReason('');
    setLatency(null);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system: systemPrompt || undefined,
          temperature,
          maxTokens,
          config,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data.text);
      setUsage(data.usage);
      setFinishReason(data.finishReason || 'stop');
      setLatency(Date.now() - startTime);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(preset: typeof presets[0]) {
    setPrompt(preset.prompt);
    setSystemPrompt(preset.system);
    setTemperature(preset.temperature);
    setMaxTokens(preset.maxTokens);
  }

  return (
    <ExampleLayout
      title="Introduction to AI SDK"
      description="Learn the fundamentals of LLM interaction using generateText. Understand prompts, system instructions, temperature, and token management."
      concepts={['generateText', 'System Prompts', 'Temperature', 'Token Usage', 'OpenAI-compatible API']}
      difficulty="beginner"
      nextHref="/examples/02-translation"
      nextLabel="Translation"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/generating-text"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Interactive Panel */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧪</span>
                Interactive Playground
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <LabeledTextarea
                  label="System Prompt (optional)"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define the AI's role and behavior..."
                  rows={2}
                />

                <LabeledTextarea
                  label="User Prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt..."
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-4">
                  <LabeledSlider
                    label="Temperature"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    min={0}
                    max={2}
                    step={0.1}
                    formatValue={(v) => v.toFixed(1)}
                  />
                  <LabeledSlider
                    label="Max Tokens"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    min={10}
                    max={500}
                    step={10}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Generating...' : 'Generate Response'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Response */}
          {(response || error) && (
            <Card  className="animate-fadeIn">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {error ? (
                      <>
                        <span className="text-red-500">❌</span>
                        Error
                      </>
                    ) : (
                      <>
                        <span className="text-green-500">✨</span>
                        Response
                      </>
                    )}
                  </CardTitle>
                  {finishReason && (
                    <Badge variant={finishReason === 'stop' ? 'success' : 'warning'}>
                      {finishReason}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {response}
                  </p>
                )}

                {usage && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{usage.inputTokens}</p>
                        <p className="text-xs text-gray-500">Input</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{usage.outputTokens}</p>
                        <p className="text-xs text-gray-500">Output</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{usage.totalTokens}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                      {latency && (
                        <div>
                          <p className="text-2xl font-bold text-orange-600">{latency}ms</p>
                          <p className="text-xs text-gray-500">Latency</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="code">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="provider">Provider Setup</TabsTrigger>
              <TabsTrigger value="concepts">Concepts</TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <CodeBlock
                code={codeExample}
                language="typescript"
                filename="app/api/generate/route.ts"
                highlightLines={[7, 8, 9, 10, 11, 12]}
              />
            </TabsContent>

            <TabsContent value="provider">
              <CodeBlock
                code={providerCode}
                language="typescript"
                filename="lib/ai-provider.ts"
                highlightLines={[4, 5, 6]}
              />
            </TabsContent>

            <TabsContent value="concepts">
              <div className="space-y-4">
                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-blue-500">📝</span>
                      generateText
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The core function for generating text completions. Returns the full response
                      once complete (non-streaming). Use for simple request-response patterns.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-purple-500">🎭</span>
                      System Prompts
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Define the AI&apos;s personality, role, and behavior. System prompts are processed
                      before user prompts and shape all subsequent responses.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-orange-500">🌡️</span>
                      Temperature
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Controls randomness: 0 = deterministic, 1 = creative, 2 = very random.
                      Lower for factual tasks, higher for creative writing.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-green-500">📊</span>
                      Token Usage
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tokens are the units LLMs use to process text. Track usage for cost
                      estimation and to ensure you stay within model limits.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-red-500">🏠</span>
                      Local LLMs
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Using OpenAI-compatible providers, you can run models locally with Ollama
                      or LM Studio. Same API, complete privacy and no API costs.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Tips */}
          <Card  className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                💡 Pro Tips
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Use temperature 0-0.3 for factual/code tasks</li>
                <li>• Use temperature 0.7-1.0 for creative writing</li>
                <li>• Set maxTokens to prevent runaway responses</li>
                <li>• System prompts persist across the conversation</li>
                <li>• Monitor token usage to optimize costs</li>
              </ul>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card >
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">🚀 What&apos;s Next?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Now that you understand basic text generation, learn how to use system prompts
                to create specialized agents in the <strong>Translation</strong> example.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
