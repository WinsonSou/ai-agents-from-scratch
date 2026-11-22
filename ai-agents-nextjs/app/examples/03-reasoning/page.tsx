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

const problemCategories = [
  {
    name: 'Logic Puzzles',
    icon: '🧩',
    problems: [
      { label: 'Sheep Problem', text: 'A farmer has 17 sheep. All but 9 die. How many sheep are left?' },
      { label: 'Apple Riddle', text: 'If you have 3 apples and take away 2, how many do you have?' },
      { label: 'Siblings', text: 'Mary\'s father has 5 daughters: Nana, Nene, Nini, Nono. What is the fifth daughter\'s name?' },
    ],
  },
  {
    name: 'Math Reasoning',
    icon: '🔢',
    problems: [
      { label: 'Bat & Ball', text: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?' },
      { label: 'Widgets', text: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?' },
      { label: 'Lily Pads', text: 'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take to cover half the lake?' },
    ],
  },
  {
    name: 'Critical Thinking',
    icon: '🤔',
    problems: [
      { label: 'Doctor', text: 'A man and his son are in a car accident. The father dies. The boy is rushed to the hospital. The surgeon says "I can\'t operate on this boy, he\'s my son." How is this possible?' },
      { label: 'Coins', text: 'I have two coins that add up to 30 cents. One of them is not a nickel. What are the two coins?' },
      { label: 'Light Bulbs', text: 'You have 3 light switches outside a room. Inside is 1 light bulb. You can only enter the room once. How do you determine which switch controls the bulb?' },
    ],
  },
];

const reasoningStrategies = [
  { value: 'cot', label: 'Chain of Thought', description: 'Step-by-step reasoning' },
  { value: 'decompose', label: 'Problem Decomposition', description: 'Break into sub-problems' },
  { value: 'verify', label: 'Self-Verification', description: 'Check and validate answer' },
];

const cotPrompt = `You are a logical reasoning expert. When solving problems:
1. Read the problem carefully
2. Identify what is being asked
3. Break down the problem step by step
4. Show your reasoning process
5. Provide a clear final answer

Think through each step before answering.`;

const decomposePrompt = `You are a problem-solving expert. When given a problem:
1. Identify the main question
2. List the key information provided
3. Identify any hidden assumptions or tricks
4. Break the problem into smaller sub-problems
5. Solve each sub-problem
6. Combine to get the final answer

Be systematic and thorough.`;

const verifyPrompt = `You are a careful analytical thinker. When solving problems:
1. First, solve the problem using your initial approach
2. Then, verify your answer by checking it against the original problem
3. Consider if there might be alternative interpretations
4. If you find any errors, correct them
5. Provide your final verified answer with confidence level

Always double-check your work.`;

const codeExample = `// Chain-of-thought prompting
const { text } = await generateText({
  model: defaultModel,
  system: \`You are a logical reasoning expert.
When solving problems:
1. Read the problem carefully
2. Identify what is being asked
3. Break down the problem step by step
4. Show your reasoning process
5. Provide a clear final answer

Think through each step before answering.\`,
  prompt: problem,
});`;

const advancedCode = `// Self-consistency with multiple samples
async function solveWithConsistency(problem: string) {
  const responses = await Promise.all(
    Array(3).fill(null).map(() =>
      generateText({
        model: defaultModel,
        system: cotPrompt,
        prompt: problem,
        temperature: 0.7, // Allow variation
      })
    )
  );
  
  // Find most common answer
  const answers = responses.map(r => extractAnswer(r.text));
  return findConsensus(answers);
}`;

export default function ReasoningExample() {
  const { config } = useConfig();
  const [problem, setProblem] = useState(
    'A farmer has 17 sheep. All but 9 die. How many sheep are left?'
  );
  const [strategy, setStrategy] = useState('cot');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [temperature, setTemperature] = useState(0.5);
  const [selectedCategory, setSelectedCategory] = useState(0);

  const getSystemPrompt = () => {
    switch (strategy) {
      case 'decompose': return decomposePrompt;
      case 'verify': return verifyPrompt;
      default: return cotPrompt;
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problem.trim()) return;
    
    setLoading(true);
    setResponse('');
    setError('');
    setLatency(null);

    const startTime = Date.now();

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: getSystemPrompt(),
          prompt: problem,
          temperature,
          maxTokens: 500,
          config,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate response');

      const data = await res.json();
      setResponse(data.text);
      setLatency(Date.now() - startTime);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ExampleLayout
      title="Reasoning & Chain of Thought"
      description="Master advanced prompting techniques for complex problem-solving. Learn chain-of-thought, problem decomposition, and self-verification strategies."
      concepts={['Chain of Thought', 'Problem Decomposition', 'Self-Verification', 'Step-by-Step Reasoning', 'Critical Thinking']}
      difficulty="intermediate"
      prevHref="/examples/02-translation"
      prevLabel="Translation"
      nextHref="/examples/04-streaming"
      nextLabel="Streaming"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/generating-text"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Reasoning Interface */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                Problem Solver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Strategy Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reasoning Strategy
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {reasoningStrategies.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStrategy(s.value)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        strategy === s.value
                          ? 'bg-purple-100 dark:bg-purple-900 border-2 border-purple-500'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-sm">{s.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Problem Category
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
                      onClick={() => setProblem(p.text)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <LabeledSlider
                label="Temperature (Creativity)"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                min={0}
                max={1}
                step={0.1}
                formatValue={(v) => v.toFixed(1)}
              />

              <form onSubmit={handleSubmit} className="space-y-4">
                <LabeledTextarea
                  label="Problem to Solve"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Enter a problem..."
                  rows={4}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Thinking...' : 'Solve Problem'}
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
                        <span className="text-green-500">💡</span>
                        Solution
                      </>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {latency && <Badge variant="success">{latency}ms</Badge>}
                    <Badge variant="secondary">
                      {reasoningStrategies.find(s => s.value === strategy)?.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                      {response}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="cot">
            <TabsList>
              <TabsTrigger value="cot">Chain of Thought</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="concepts">Concepts</TabsTrigger>
            </TabsList>

            <TabsContent value="cot">
              <CodeBlock
                code={codeExample}
                language="typescript"
                filename="Chain-of-thought prompting"
                highlightLines={[4, 5, 6, 7, 8, 9, 10, 11]}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <CodeBlock
                code={advancedCode}
                language="typescript"
                filename="Self-consistency technique"
                highlightLines={[4, 5, 6, 7, 8, 9, 10, 11]}
              />
            </TabsContent>

            <TabsContent value="concepts">
              <div className="space-y-4">
                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-purple-500">🔗</span>
                      Chain of Thought (CoT)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Prompting the model to show its reasoning step-by-step dramatically
                      improves accuracy on complex tasks. Simply adding &quot;think step by step&quot;
                      can boost performance.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-blue-500">🧩</span>
                      Problem Decomposition
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Breaking complex problems into smaller sub-problems makes them
                      easier to solve. Each sub-problem can be tackled independently.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-green-500">✅</span>
                      Self-Verification
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Asking the model to verify its own answer catches errors.
                      This is especially effective for math and logic problems.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-orange-500">🎯</span>
                      Self-Consistency
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generate multiple solutions and pick the most common answer.
                      This technique reduces errors from single attempts.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Why CoT Works */}
          <Card  className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                🧠 Why Chain of Thought Works
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                LLMs are trained on text that includes reasoning. When prompted to
                &quot;think step by step,&quot; they activate patterns learned from textbooks,
                tutorials, and explanations.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-sm">
                <p className="font-mono text-purple-700 dark:text-purple-300">
                  Without CoT: &quot;9 sheep&quot; ❌<br/>
                  With CoT: &quot;All but 9 die means 9 survive. Answer: 9&quot; ✅
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card  className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                💡 Pro Tips
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Add &quot;Let&apos;s think step by step&quot; for instant improvement</li>
                <li>• Ask for intermediate calculations to be shown</li>
                <li>• Use lower temperature (0.2-0.5) for logical tasks</li>
                <li>• Request verification: &quot;Check your answer&quot;</li>
                <li>• For tricky problems, try multiple phrasings</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
