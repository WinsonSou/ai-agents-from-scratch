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
} from '@/components/ui';
import { useConfig } from '@/components/settings-panel';

interface ToolCall {
  toolName: string;
  input?: unknown;
}

interface ToolResult {
  toolName: string;
  output?: unknown;
}

interface Step {
  stepNumber: number;
  text: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

const toolCategories = [
  {
    name: 'Calculator',
    icon: '🧮',
    tools: ['add', 'subtract', 'multiply', 'divide'],
    examples: [
      { label: 'Multiply', prompt: 'What is 15 multiplied by 7?' },
      { label: 'Complex Math', prompt: 'Calculate 100 divided by 4, then add 25' },
      { label: 'Chain Calc', prompt: 'What is (12 + 8) * 3?' },
    ],
  },
  {
    name: 'Weather',
    icon: '🌤️',
    tools: ['getWeather'],
    examples: [
      { label: 'Single City', prompt: "What's the weather like in Tokyo?" },
      { label: 'Compare', prompt: "Compare the weather in Paris and London" },
    ],
  },
  {
    name: 'Time',
    icon: '🕐',
    tools: ['getCurrentTime'],
    examples: [
      { label: 'Timezone', prompt: 'What time is it in New York?' },
      { label: 'Multi-zone', prompt: 'What time is it in Tokyo, London, and Sydney?' },
    ],
  },
  {
    name: 'Combined',
    icon: '🔗',
    tools: ['all'],
    examples: [
      { label: 'Multi-Tool', prompt: "What's 42 + 58, and what's the weather in Paris?" },
      { label: 'Complex', prompt: 'Calculate 25 * 4, get the weather in Tokyo, and tell me the time in London' },
    ],
  },
];

const toolDefinitionCode = `// lib/tools/calculator.ts
import { tool } from 'ai';
import { z } from 'zod';

export const calculatorTools = {
  multiply: tool({
    description: 'Multiply two numbers together',
    inputSchema: z.object({
      a: z.number().describe('First number'),
      b: z.number().describe('Second number'),
    }),
    execute: async ({ a, b }) => {
      return { 
        result: a * b, 
        operation: \`\${a} × \${b} = \${a * b}\` 
      };
    },
  }),
  
  // More tools: add, subtract, divide...
};`;

const apiRouteCode = `// app/api/tools/route.ts
import { generateText, stepCountIs } from 'ai';
import { defaultModel } from '@/lib/ai-provider';
import { calculatorTools, weatherTool, timeTool } from '@/lib/tools';

const allTools = {
  ...calculatorTools,
  ...weatherTool,
  ...timeTool,
};

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: defaultModel,
    tools: allTools,
    stopWhen: stepCountIs(5), // Max 5 tool calls
    system: \`You are a helpful assistant with tools.
Use tools to answer questions accurately.\`,
    prompt,
  });

  return Response.json({
    text: result.text,
    toolCalls: result.toolCalls,
    toolResults: result.toolResults,
    steps: result.steps,
  });
}`;

const zodSchemaCode = `// Zod schemas for type-safe tool inputs
import { z } from 'zod';

const weatherSchema = z.object({
  city: z.string().describe('City name'),
  units: z.enum(['celsius', 'fahrenheit'])
    .optional()
    .describe('Temperature units'),
});

const calculatorSchema = z.object({
  a: z.number().describe('First operand'),
  b: z.number().describe('Second operand'),
});

// The schema automatically:
// 1. Generates JSON schema for the LLM
// 2. Validates inputs before execution
// 3. Provides TypeScript types`;

export default function ToolsExample() {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState('What is 15 multiplied by 7?');
  const [response, setResponse] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    setSteps([]);
    setError('');
    setLatency(null);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, config }),
      });

      if (!res.ok) throw new Error('Tool execution failed');

      const data = await res.json();
      setResponse(data.text);
      setSteps(data.steps || []);
      setLatency(Date.now() - startTime);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const totalToolCalls = steps.reduce((acc, step) => acc + (step.toolCalls?.length || 0), 0);

  return (
    <ExampleLayout
      title="Tool Calling & Function Execution"
      description="Extend LLM capabilities with custom tools. Learn to define type-safe functions with Zod schemas that the AI can invoke to perform real-world actions."
      concepts={['tool()', 'Zod Schemas', 'Function Calling', 'Multi-step Execution', 'Type Safety']}
      difficulty="intermediate"
      prevHref="/examples/04-streaming"
      prevLabel="Streaming"
      nextHref="/examples/06-memory"
      nextLabel="Memory"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tools Interface */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔧</span>
                Tool Playground
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tool Category
                </label>
                <div className="flex gap-2 mb-3">
                  {toolCategories.map((cat, i) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(i)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${
                        selectedCategory === i
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {toolCategories[selectedCategory].examples.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => setPrompt(ex.prompt)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Tools */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Available tools:</p>
                <div className="flex flex-wrap gap-1">
                  {['add', 'subtract', 'multiply', 'divide', 'getWeather', 'getCurrentTime'].map((tool) => (
                    <Badge key={tool} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <LabeledTextarea
                  label="Prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask something that requires tools..."
                  rows={3}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Executing Tools...' : 'Execute with Tools'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tool Execution Visualization */}
          {steps.length > 0 && (
            <Card  className="animate-fadeIn">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>⚡</span>
                    Execution Steps
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="info">{steps.length} steps</Badge>
                    <Badge variant="warning">{totalToolCalls} tool calls</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="relative pl-6 pb-4 last:pb-0">
                    {/* Timeline line */}
                    {i < steps.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}
                    {/* Step indicator */}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {step.stepNumber}
                    </div>
                    
                    <div className="space-y-2">
                      {/* Tool Calls */}
                      {step.toolCalls?.map((call, j) => (
                        <div
                          key={j}
                          className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-orange-500">🔧</span>
                            <span className="font-mono text-sm font-semibold text-orange-600 dark:text-orange-400">
                              {call.toolName}
                            </span>
                          </div>
                          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                            {JSON.stringify(call.input, null, 2)}
                          </pre>
                        </div>
                      ))}
                      
                      {/* Tool Results */}
                      {step.toolResults?.map((result, j) => (
                        <div
                          key={j}
                          className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-500">✅</span>
                            <span className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                              Result: {result.toolName}
                            </span>
                          </div>
                          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                            {JSON.stringify(result.output, null, 2)}
                          </pre>
                        </div>
                      ))}

                      {/* Step text */}
                      {step.text && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {step.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Final Response */}
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
                        Final Response
                      </>
                    )}
                  </CardTitle>
                  {latency && <Badge variant="success">{latency}ms</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {response}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="definition">
            <TabsList>
              <TabsTrigger value="definition">Tool Definition</TabsTrigger>
              <TabsTrigger value="api">API Route</TabsTrigger>
              <TabsTrigger value="schemas">Zod Schemas</TabsTrigger>
            </TabsList>

            <TabsContent value="definition">
              <CodeBlock
                code={toolDefinitionCode}
                language="typescript"
                filename="lib/tools/calculator.ts"
                highlightLines={[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]}
              />
            </TabsContent>

            <TabsContent value="api">
              <CodeBlock
                code={apiRouteCode}
                language="typescript"
                filename="app/api/tools/route.ts"
                highlightLines={[15, 16, 17]}
              />
            </TabsContent>

            <TabsContent value="schemas">
              <CodeBlock
                code={zodSchemaCode}
                language="typescript"
                filename="Type-safe schemas"
                highlightLines={[4, 5, 6, 7, 8]}
              />
            </TabsContent>
          </Tabs>

          {/* How Tools Work */}
          <Card  className="border-l-4 border-orange-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-3">
                🔄 How Tool Calling Works
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 text-xs font-bold">1</div>
                  <p className="text-gray-600 dark:text-gray-400">LLM analyzes prompt and decides which tools to use</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 text-xs font-bold">2</div>
                  <p className="text-gray-600 dark:text-gray-400">AI SDK validates inputs with Zod schema</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 text-xs font-bold">3</div>
                  <p className="text-gray-600 dark:text-gray-400">Execute function runs with validated parameters</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 text-xs font-bold">4</div>
                  <p className="text-gray-600 dark:text-gray-400">Results feed back to LLM for next step or final answer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concepts */}
          <div className="space-y-4">
            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-blue-500">📋</span>
                  Tool Description
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clear descriptions help the LLM understand when to use each tool.
                  Be specific about what the tool does and its limitations.
                </p>
              </CardContent>
            </Card>

            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-purple-500">🔒</span>
                  Type Safety with Zod
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zod schemas provide runtime validation and TypeScript types.
                  Invalid inputs are caught before execution.
                </p>
              </CardContent>
            </Card>

            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-green-500">🔄</span>
                  Multi-Step Execution
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use stopWhen to control how many tool calls are allowed.
                  This prevents infinite loops and manages costs.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card  className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                💡 Pro Tips
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Write detailed tool descriptions for better selection</li>
                <li>• Use .describe() on Zod fields for parameter hints</li>
                <li>• Return structured data from tools for clarity</li>
                <li>• Handle errors gracefully in execute functions</li>
                <li>• Limit steps to prevent runaway tool chains</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
