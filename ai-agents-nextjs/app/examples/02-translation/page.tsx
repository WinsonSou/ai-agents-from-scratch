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
  Select,
  LabeledTextarea,
} from '@/components/ui';
import { useConfig } from '@/components/settings-panel';

const languages = [
  { value: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { value: 'French', flag: '🇫🇷', native: 'Français' },
  { value: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { value: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { value: 'Chinese', flag: '🇨🇳', native: '中文' },
  { value: 'Korean', flag: '🇰🇷', native: '한국어' },
  { value: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { value: 'Portuguese', flag: '🇵🇹', native: 'Português' },
  { value: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { value: 'Arabic', flag: '🇸🇦', native: 'العربية' },
];

const presets = [
  { text: 'Hello, how are you today?', label: 'Greeting' },
  { text: 'The quick brown fox jumps over the lazy dog.', label: 'Pangram' },
  { text: 'Artificial intelligence is transforming the world.', label: 'Tech' },
  { text: 'I would like to order a coffee, please.', label: 'Casual' },
  { text: 'The meeting has been rescheduled to next Monday at 3 PM.', label: 'Business' },
];

const codeExample = `// Using system prompts for translation
import { generateText } from 'ai';
import { defaultModel } from '@/lib/ai-provider';

const { text } = await generateText({
  model: defaultModel,
  system: \`You are a professional translator. 
Translate the given text to \${targetLanguage}. 
Only output the translation, nothing else.\`,
  prompt: textToTranslate,
});`;

const advancedCode = `// Advanced: Translation with context and formality
const { text } = await generateText({
  model: defaultModel,
  system: \`You are a professional translator specializing in \${targetLanguage}.

Translation guidelines:
- Formality level: \${formality} (formal/informal/neutral)
- Preserve technical terms when appropriate
- Maintain the original tone and style
- If idioms cannot be translated directly, provide equivalent expressions

Only output the translation.\`,
  prompt: textToTranslate,
  temperature: 0.3, // Lower for more consistent translations
});`;

export default function TranslationExample() {
  const { config } = useConfig();
  const [text, setText] = useState('Hello, how are you today?');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{
    source: string;
    target: string;
    language: string;
  }>>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    
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
          system: `You are a professional translator. Translate the given text to ${targetLanguage}. Only output the translation, nothing else. Preserve the original formatting and tone.`,
          prompt: text,
          temperature: 0.3,
          config,
        }),
      });

      if (!res.ok) throw new Error('Translation failed');

      const data = await res.json();
      setResponse(data.text);
      setLatency(Date.now() - startTime);
      
      // Add to history
      setHistory(prev => [{
        source: text,
        target: data.text,
        language: targetLanguage,
      }, ...prev.slice(0, 4)]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const selectedLang = languages.find(l => l.value === targetLanguage);

  return (
    <ExampleLayout
      title="Translation with System Prompts"
      description="Learn how system prompts specialize LLM behavior. Create focused agents by defining their role, expertise, and output constraints."
      concepts={['System Prompts', 'Role Definition', 'Output Constraints', 'Temperature Control', 'Specialization']}
      difficulty="beginner"
      prevHref="/examples/01-intro"
      prevLabel="Introduction"
      nextHref="/examples/03-reasoning"
      nextLabel="Reasoning"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/generating-text#system-messages"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Translation Interface */}
        <div className="space-y-6">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                Translator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Language
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setTargetLanguage(lang.value)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        targetLanguage === lang.value
                          ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300'
                      }`}
                      title={lang.value}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <p className="text-xs mt-1 truncate">{lang.native}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Examples
                </label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setText(preset.text)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <LabeledTextarea
                  label="Text to Translate"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={4}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Translating...' : `Translate to ${targetLanguage}`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
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
                        <span>{selectedLang?.flag}</span>
                        {targetLanguage} Translation
                      </>
                    )}
                  </CardTitle>
                  {latency && (
                    <Badge variant="success">{latency}ms</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {response}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Translation History */}
          {history.length > 0 && (
            <Card >
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>📜</span>
                  Recent Translations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{item.language}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.source}</p>
                    <p className="text-sm font-medium truncate">→ {item.target}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">Basic Code</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="concepts">Concepts</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <CodeBlock
                code={codeExample}
                language="typescript"
                filename="Translation with system prompt"
                highlightLines={[6, 7, 8]}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <CodeBlock
                code={advancedCode}
                language="typescript"
                filename="Advanced translation"
                highlightLines={[5, 6, 7, 8, 9, 10, 11, 14]}
              />
            </TabsContent>

            <TabsContent value="concepts">
              <div className="space-y-4">
                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-purple-500">🎭</span>
                      System Prompts
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      System prompts define the AI&apos;s identity, expertise, and behavior.
                      They&apos;re processed before user prompts and shape all responses.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-blue-500">🎯</span>
                      Role Specialization
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The same base model can become a translator, coder, or analyst
                      simply by changing the system prompt. No fine-tuning needed!
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-green-500">📋</span>
                      Output Constraints
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use phrases like &quot;Only output the translation&quot; to control response
                      format. This prevents explanations or extra text.
                    </p>
                  </CardContent>
                </Card>

                <Card >
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-orange-500">🌡️</span>
                      Low Temperature
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For translation, use low temperature (0.1-0.3) for consistent,
                      accurate results rather than creative variations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* System Prompt Anatomy */}
          <Card  className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                🔍 Anatomy of a Good System Prompt
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-mono text-purple-600">1.</span>
                  <span><strong>Role:</strong> &quot;You are a professional translator&quot;</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono text-purple-600">2.</span>
                  <span><strong>Task:</strong> &quot;Translate the given text to [language]&quot;</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono text-purple-600">3.</span>
                  <span><strong>Constraint:</strong> &quot;Only output the translation&quot;</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-mono text-purple-600">4.</span>
                  <span><strong>Quality:</strong> &quot;Preserve tone and formatting&quot;</span>
                </div>
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
                <li>• Be specific about the role and expertise level</li>
                <li>• Specify output format constraints explicitly</li>
                <li>• Include edge case handling in the prompt</li>
                <li>• Use lower temperature for factual tasks</li>
                <li>• Test with diverse inputs to refine prompts</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
