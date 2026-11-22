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

interface Step {
  stepNumber: number;
  text: string;
  toolCalls?: Array<{ toolName: string; input?: unknown }>;
  toolResults?: Array<{ toolName: string; output?: unknown }>;
}

const problemCategories = [
  {
    name: 'Basic Math',
    icon: '🔢',
    problems: [
      { label: 'Addition Chain', prompt: 'What is (15 + 7) × 3 - 10?' },
      { label: 'Multi-step', prompt: 'Calculate 100 ÷ 4, then add 25, then multiply by 2' },
    ],
  },
  {
    name: 'Word Problems',
    icon: '📝',
    problems: [
      { label: 'Shopping', prompt: 'If I buy 3 items at $12 each and 5 items at $8 each, how much do I spend?' },
      { label: 'Revenue', prompt: 'A store sells 15 items on Monday at $8 each, 20 items on Tuesday at $8 each. What is the total revenue?' },
    ],
  },
  {
    name: 'Complex',
    icon: '🧮',
    problems: [
      { label: 'Percentage', prompt: 'A shirt costs $80. It\'s on sale for 25% off. What is the final price?' },
      { label: 'Investment', prompt: 'If I invest $1000 at 5% annual interest, how much do I have after 3 years of simple interest?' },
    ],
  },
];

const reactAgentCode = `// app/api/react-agent/route.ts
import { generateText, stepCountIs } from 'ai';
import { defaultModel } from '@/lib/ai-provider';
import { calculatorTools } from '@/lib/tools/calculator';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: defaultModel,
    tools: calculatorTools,
    stopWhen: stepCountIs(10), // Max 10 reasoning steps
    system: \`You are a mathematical assistant using ReAct.

For each step in solving a problem:
1. THINK: Explain what calculation you need
2. ACT: Use a tool to perform it
3. OBSERVE: Analyze the result

Continue until you have the final answer.\`,
    prompt,
  });

  // Access the reasoning steps
  const steps = result.steps.map((step, i) => ({
    stepNumber: i + 1,
    text: step.text,
    toolCalls: step.toolCalls,
    toolResults: step.toolResults,
  }));

  return Response.json({
    text: result.text,
    steps,
    totalSteps: steps.length,
  });
}`;

const reactPattern = `// The ReAct Pattern Explained
// ---------------------------

// Traditional Approach:
// User → Model → Single Response

// ReAct Approach:
// User → Model → Think → Act → Observe → Think → Act → ... → Final Answer

// Why it works:
// 1. Explicit reasoning reduces errors
// 2. Tool use grounds answers in facts
// 3. Iterative refinement catches mistakes
// 4. Observable steps enable debugging

// The AI SDK handles the loop automatically
// with stopWhen - you just define tools and prompts!`;

export default function ReActAgentExample() {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState(
    'A store sells 15 items on Monday at $8 each, 20 items on Tuesday at $8 each. What is the total revenue?'
  );
  const [response, setResponse] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    setSteps([]);
    setError('');
    setLatency(null);
    setExpandedSteps(new Set());

    const startTime = Date.now();

    try {
      const res = await fetch('/api/react-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, config }),
      });

      if (!res.ok) throw new Error('ReAct agent failed');

      const data = await res.json();
      setResponse(data.text);
      setSteps(data.steps || []);
      setLatency(Date.now() - startTime);
      // Expand all steps by default
      setExpandedSteps(new Set(data.steps?.map((_: Step, i: number) => i) || []));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function toggleStep(index: number) {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  }

  const totalToolCalls = steps.reduce((acc, step) => acc + (step.toolCalls?.length || 0), 0);

  return (
    <ExampleLayout
      title="ReAct Agent Pattern"
      description="Master the Reasoning + Acting pattern for complex problem-solving. Watch as the AI thinks step-by-step, uses tools, and iteratively refines its approach."
      concepts={['ReAct Pattern', 'Think-Act-Observe', 'Multi-step Reasoning', 'Tool Chaining', 'Iterative Problem Solving']}
      difficulty="advanced"
      prevHref="/examples/06-memory"
      prevLabel="Memory"
      nextHref="/examples/08-aot-agent"
      nextLabel="AoT Agent"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* ReAct Interface */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                ReAct Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Problem Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Problem Type
                </label>
                <div className="flex gap-2 mb-3">
                  {problemCategories.map((cat, i) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(i)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${
                        selectedCategory === i
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {problemCategories[selectedCategory].problems.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setPrompt(p.prompt)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ReAct Flow Indicator */}
              <div className="p-3 bg-gradient-to-r from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ReAct Flow:</p>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-purple-700 dark:text-purple-300">
                    💭 Think
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 rounded text-orange-700 dark:text-orange-300">
                    🔧 Act
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 rounded text-green-700 dark:text-green-300">
                    👁 Observe
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-500 italic">repeat...</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <LabeledTextarea
                  label="Problem to Solve"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a math problem..."
                  rows={3}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Reasoning...' : 'Solve with ReAct'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reasoning Steps Visualization */}
          {steps.length > 0 && (
            <Card  className="animate-fadeIn">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>🔄</span>
                    Reasoning Steps
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="info">{steps.length} steps</Badge>
                    <Badge variant="warning">{totalToolCalls} calculations</Badge>
                    {latency && <Badge variant="success">{latency}ms</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Step Header */}
                    <button
                      onClick={() => toggleStep(i)}
                      className="w-full p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold">
                          {step.stepNumber}
                        </span>
                        <span className="font-medium text-sm">Step {step.stepNumber}</span>
                        {step.toolCalls && step.toolCalls.length > 0 && (
                          <Badge variant="warning" className="text-xs">
                            {step.toolCalls.length} tool{step.toolCalls.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-400">
                        {expandedSteps.has(i) ? '▼' : '▶'}
                      </span>
                    </button>

                    {/* Step Content */}
                    {expandedSteps.has(i) && (
                      <div className="p-3 space-y-3">
                        {/* Think */}
                        {step.text && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-purple-500">💭</span>
                              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Think</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{step.text}</p>
                          </div>
                        )}

                        {/* Act */}
                        {step.toolCalls?.map((tc, j) => (
                          <div key={j} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-orange-500">🔧</span>
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Act</span>
                            </div>
                            <code className="text-sm font-mono text-orange-600 dark:text-orange-400">
                              {tc.toolName}({JSON.stringify(tc.input)})
                            </code>
                          </div>
                        ))}

                        {/* Observe */}
                        {step.toolResults?.map((tr, j) => (
                          <div key={j} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-green-500">👁</span>
                              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Observe</span>
                            </div>
                            <code className="text-sm font-mono text-green-600 dark:text-green-400">
                              {JSON.stringify(tr.output)}
                            </code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Final Answer */}
          {(response || error) && (
            <Card  className="animate-fadeIn">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {error ? (
                    <>
                      <span className="text-red-500">❌</span>
                      Error
                    </>
                  ) : (
                    <>
                      <span className="text-green-500">✅</span>
                      Final Answer
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {response}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="code">
            <TabsList>
              <TabsTrigger value="code">Implementation</TabsTrigger>
              <TabsTrigger value="pattern">Pattern</TabsTrigger>
              <TabsTrigger value="concepts">Concepts</TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <CodeBlock
                code={reactAgentCode}
                language="typescript"
                filename="app/api/react-agent/route.ts"
                highlightLines={[11, 12, 13, 14, 15, 16, 17, 18]}
              />
            </TabsContent>

            <TabsContent value="pattern">
              <CodeBlock
                code={reactPattern}
                language="typescript"
                filename="ReAct Pattern Explained"
              />
            </TabsContent>

            <TabsContent value="concepts">
              <div className="space-y-4">
                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-purple-500">💭</span>
                      Think (Reasoning)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The model explains its reasoning before acting. This explicit
                      thought process reduces errors and makes decisions traceable.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-orange-500">🔧</span>
                      Act (Tool Use)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Based on its reasoning, the model calls a tool to perform
                      a specific action. Tools ground the AI in real calculations.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-green-500">👁</span>
                      Observe (Results)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The model receives tool results and uses them to inform
                      the next step. This creates a feedback loop for accuracy.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-blue-500">🔄</span>
                      Iteration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The cycle repeats until the problem is solved. stopWhen
                      controls the maximum iterations to prevent infinite loops.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Why ReAct */}
          <Card  className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">
                🔄 Why ReAct Works
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>The ReAct pattern combines two powerful techniques:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Chain of Thought</strong>: Explicit reasoning reduces errors</li>
                  <li><strong>Tool Use</strong>: Actions are grounded in real computations</li>
                </ul>
                <p className="mt-2">
                  Together, they create agents that can solve complex, multi-step
                  problems while remaining transparent and debuggable.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comparison */}
          <Card >
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">📊 ReAct vs Direct Prompting</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="font-medium text-red-700 dark:text-red-300 mb-1">❌ Direct</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    &quot;15×8 + 20×8 = 280&quot;
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Single shot, error-prone</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-medium text-green-700 dark:text-green-300 mb-1">✅ ReAct</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Think → multiply(15,8)=120 → multiply(20,8)=160 → add(120,160)=280
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Verified at each step</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card  className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                💡 Pro Tips
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Use clear system prompts that enforce the Think-Act-Observe pattern</li>
                <li>• Set appropriate step limits to prevent runaway loops</li>
                <li>• Design tools to be atomic - one clear action per tool</li>
                <li>• Log steps for debugging complex reasoning chains</li>
                <li>• Consider fallbacks when tool calls fail</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
