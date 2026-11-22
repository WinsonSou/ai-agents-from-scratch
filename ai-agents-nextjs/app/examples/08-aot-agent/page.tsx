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

interface Atom {
  id: string;
  operation: string;
  description: string;
  inputs: string[];
  dependencies: string[];
}

interface Plan {
  goal: string;
  atoms: Atom[];
  expectedOutput: string;
}

interface AtomResult {
  id: string;
  result: string | number;
  status: 'success' | 'error';
}

const problemCategories = [
  {
    name: 'Sequential',
    icon: '📊',
    problems: [
      { label: 'Basic Chain', prompt: 'Calculate (5 + 3) × 2' },
      { label: 'Multi-step', prompt: 'What is 100 divided by 4, plus 15?' },
    ],
  },
  {
    name: 'Parallel',
    icon: '⚡',
    problems: [
      { label: 'Average', prompt: 'Calculate the average of (10 + 20) and (30 + 40)' },
      { label: 'Compare', prompt: 'Calculate both 15×4 and 12×5, then add them together' },
    ],
  },
  {
    name: 'Complex',
    icon: '🧮',
    problems: [
      { label: 'Inventory', prompt: 'If I have 50 items and sell 15, then buy 20 more, how many do I have?' },
      { label: 'Discount', prompt: 'A $200 item has a 15% discount. Calculate the discount amount and final price.' },
    ],
  },
];

const generateObjectCode = `// app/api/aot-agent/route.ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from '@/lib/ai-provider';

// Define the plan schema with Zod
const planSchema = z.object({
  goal: z.string().describe('The main goal to achieve'),
  atoms: z.array(z.object({
    id: z.string().describe('Unique atom ID like A1, A2'),
    operation: z.string().describe('The operation to perform'),
    description: z.string().describe('Human-readable description'),
    inputs: z.array(z.string()).describe('Input values or references'),
    dependencies: z.array(z.string()).describe('IDs of atoms this depends on'),
  })),
  expectedOutput: z.string().describe('Description of expected result'),
});

// Generate structured plan
const { object: plan } = await generateObject({
  model: defaultModel,
  schema: planSchema,
  system: \`You are a planning assistant. Break problems into atomic steps.
Each atom should be a single, simple operation.\`,
  prompt: \`Create a detailed plan to solve: \${problem}\`,
});`;

const executionCode = `// Execute atoms in dependency order
function topologicalSort(atoms: Atom[]): Atom[] {
  const visited = new Set<string>();
  const result: Atom[] = [];
  
  function visit(atom: Atom) {
    if (visited.has(atom.id)) return;
    visited.add(atom.id);
    
    // Visit dependencies first
    for (const depId of atom.dependencies) {
      const dep = atoms.find(a => a.id === depId);
      if (dep) visit(dep);
    }
    result.push(atom);
  }
  
  atoms.forEach(visit);
  return result;
}

// Execute each atom
const results = new Map<string, number>();
for (const atom of topologicalSort(plan.atoms)) {
  const inputs = atom.inputs.map(input => {
    // Resolve references like "result of A1"
    if (input.startsWith('result of ')) {
      const refId = input.replace('result of ', '');
      return results.get(refId) ?? input;
    }
    return parseFloat(input) || input;
  });
  
  const result = await executeOperation(atom.operation, inputs);
  results.set(atom.id, result);
}`;

const comparisonCode = `// AoT vs ReAct Comparison
// -----------------------

// ReAct (Iterative):
// 1. Think about next step
// 2. Act (call tool)
// 3. Observe result
// 4. Repeat until done
// 
// Pros: Adaptive, can recover from errors
// Cons: Can get stuck, harder to predict

// AoT (Plan-then-Execute):
// 1. Generate complete plan upfront
// 2. Validate plan structure
// 3. Execute all steps deterministically
// 
// Pros: Predictable, auditable, parallelizable
// Cons: Can't adapt mid-execution

// Choose based on your use case!`;

export default function AoTAgentExample() {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState(
    'Calculate the average of (10 + 20) and (30 + 40)'
  );
  const [plan, setPlan] = useState<Plan | null>(null);
  const [execution, setExecution] = useState<AtomResult[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'planning' | 'executing' | 'done'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setPlan(null);
    setExecution([]);
    setSummary('');
    setError('');
    setLatency(null);
    setPhase('planning');

    const startTime = Date.now();

    try {
      const res = await fetch('/api/aot-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, config }),
      });

      if (!res.ok) throw new Error('AoT agent failed');

      setPhase('executing');
      const data = await res.json();
      setPlan(data.plan);
      setExecution(data.execution || []);
      setSummary(data.summary);
      setLatency(Date.now() - startTime);
      setPhase('done');
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  }

  const getAtomStatus = (atomId: string) => {
    const result = execution.find((e) => e.id === atomId);
    if (!result) return 'pending';
    return result.status;
  };

  return (
    <ExampleLayout
      title="Atom of Thought (AoT) Agent"
      description="Explore structured planning with generateObject. Learn to create deterministic, auditable AI workflows by separating planning from execution."
      concepts={['generateObject', 'Zod Schemas', 'Structured Output', 'Plan-then-Execute', 'Dependency Resolution']}
      difficulty="advanced"
      prevHref="/examples/07-react-agent"
      prevLabel="ReAct Agent"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* AoT Interface */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚛️</span>
                AoT Planner
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
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
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

              {/* AoT Flow Indicator */}
              <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">AoT Phases:</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    phase === 'planning' ? 'bg-purple-500 text-white animate-pulse' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  }`}>
                    📋 Plan
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 rounded ${
                    phase === 'executing' ? 'bg-blue-500 text-white animate-pulse' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  }`}>
                    ⚡ Execute
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 rounded ${
                    phase === 'done' ? 'bg-green-500 text-white' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  }`}>
                    ✅ Result
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <LabeledTextarea
                  label="Problem to Solve"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a problem to plan and execute..."
                  rows={3}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (phase === 'planning' ? 'Planning...' : 'Executing...') : 'Plan with AoT'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Generated Plan */}
          {plan && (
            <Card  className="animate-fadeIn">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>📋</span>
                    Generated Plan
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="info">{plan.atoms.length} atoms</Badge>
                    {latency && <Badge variant="success">{latency}ms</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Goal */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">Goal:</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">{plan.goal}</span>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">Expected:</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">{plan.expectedOutput}</span>
                  </p>
                </div>

                {/* Atoms */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Atomic Steps</h4>
                  {plan.atoms.map((atom, i) => {
                    const result = execution.find((e) => e.id === atom.id);
                    const status = getAtomStatus(atom.id);
                    
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border transition-all ${
                          status === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                            : status === 'error'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            status === 'success'
                              ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {atom.id}
                          </span>
                          <span className="font-medium text-sm">{atom.operation}</span>
                          {atom.dependencies.length > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span>←</span>
                              {atom.dependencies.map(dep => (
                                <Badge key={dep} variant="secondary" className="text-xs">{dep}</Badge>
                              ))}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {atom.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          Inputs: {atom.inputs.join(', ')}
                        </p>
                        {result && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className={`text-sm font-semibold ${
                              status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              → Result: {String(result.result)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Result */}
          {(summary || error) && (
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
                    {summary}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="schema">
            <TabsList>
              <TabsTrigger value="schema">Schema & Planning</TabsTrigger>
              <TabsTrigger value="execution">Execution</TabsTrigger>
              <TabsTrigger value="comparison">AoT vs ReAct</TabsTrigger>
            </TabsList>

            <TabsContent value="schema">
              <CodeBlock
                code={generateObjectCode}
                language="typescript"
                filename="Structured output with generateObject"
                highlightLines={[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21]}
              />
            </TabsContent>

            <TabsContent value="execution">
              <CodeBlock
                code={executionCode}
                language="typescript"
                filename="Dependency resolution & execution"
                highlightLines={[22, 23, 24, 25, 26, 27, 28, 29, 30]}
              />
            </TabsContent>

            <TabsContent value="comparison">
              <CodeBlock
                code={comparisonCode}
                language="typescript"
                filename="AoT vs ReAct"
              />
            </TabsContent>
          </Tabs>

          {/* AoT Explained */}
          <Card  className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                ⚛️ What is Atom of Thought?
              </h4>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  AoT separates <strong>planning</strong> from <strong>execution</strong>:
                </p>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 text-xs font-bold">1</div>
                    <p><strong>Plan:</strong> LLM creates structured plan with atomic operations</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 text-xs font-bold">2</div>
                    <p><strong>Validate:</strong> Schema ensures plan structure is correct</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
                    <p><strong>Execute:</strong> Deterministic executor runs each atom</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="space-y-4">
            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-green-500">✅</span>
                  Predictable
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The entire plan is visible upfront. You know exactly what will happen
                  before execution begins.
                </p>
              </CardContent>
            </Card>

            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-blue-500">🔍</span>
                  Auditable
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Each atomic step is logged with inputs and outputs.
                  Easy to debug and explain decisions.
                </p>
              </CardContent>
            </Card>

            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-purple-500">⚡</span>
                  Parallelizable
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Independent atoms can run in parallel. Dependency graph
                  enables optimal execution order.
                </p>
              </CardContent>
            </Card>

            <Card >
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-orange-500">🔒</span>
                  Type-Safe
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zod schemas validate structure at runtime.
                  TypeScript provides compile-time safety.
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
                <li>• Use descriptive IDs (A1, A2) for easy reference</li>
                <li>• Keep atoms truly atomic - one operation each</li>
                <li>• Define clear dependencies for correct ordering</li>
                <li>• Add validation between planning and execution</li>
                <li>• Consider caching plans for similar problems</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
