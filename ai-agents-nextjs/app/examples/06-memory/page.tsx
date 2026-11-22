'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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
  Input,
} from '@/components/ui';
import { useConfig } from '@/components/settings-panel';

const systemPrompt = `You are a helpful assistant with memory. 
Remember what the user tells you during our conversation.
If they mention their name, preferences, or any facts, remember them and use them in future responses.
Be conversational and reference previous parts of our chat when relevant.`;

const codeExample = `// Memory with useChat - automatic message management
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, setMessages } = useChat({
    api: '/api/chat',
    body: {
      system: 'Remember what the user tells you...',
      config,
    },
  });

  // useChat automatically maintains the full conversation
  // Each message includes role and parts (content)
  // Server receives full history for context
}`;

const memoryStrategies = `// Strategy 1: Sliding Window
const recentMessages = messages.slice(-10);

// Strategy 2: Summarization
async function summarizeHistory(messages) {
  const summary = await generateText({
    model,
    prompt: \`Summarize this conversation: \${messages}\`,
  });
  return [{ role: 'system', content: summary }];
}

// Strategy 3: Token Counting
function getMessagesWithinLimit(messages, maxTokens) {
  let tokenCount = 0;
  const result = [];
  for (const msg of messages.reverse()) {
    const tokens = countTokens(msg.content);
    if (tokenCount + tokens > maxTokens) break;
    result.unshift(msg);
    tokenCount += tokens;
  }
  return result;
}`;

export default function MemoryExample() {
  const { config } = useConfig();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, system: systemPrompt, config },
      }),
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  function clearMemory() {
    setMessages([]);
  }

  const suggestions = [
    { text: "My name is Alex and I love programming", short: "Tell my name" },
    { text: "What's my name?", short: "Ask my name" },
    { text: "I prefer Python over JavaScript", short: "Language preference" },
    { text: "What programming language do I prefer?", short: "Ask preference" },
  ];

  return (
    <ExampleLayout
      title="Conversation Memory"
      description="Learn how LLMs maintain context through message history. Understand memory strategies for long conversations and context window management."
      concepts={['Message History', 'Context Window', 'useChat', 'Sliding Window', 'State Management']}
      difficulty="intermediate"
      prevHref="/examples/05-tools"
      prevLabel="Tools"
      nextHref="/examples/07-react-agent"
      nextLabel="ReAct Agent"
      docsLink="https://sdk.vercel.ai/docs/ai-sdk-core/generating-text#multi-turn-conversations"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chat with Memory */}
        <div className="space-y-6">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🧠</span>
                  Chat with Memory
                </CardTitle>
                <Button variant="destructive" size="sm" onClick={clearMemory}>
                  Clear Memory
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">Tell me something about yourself!</p>
                    <p className="text-sm">I&apos;ll remember it for our conversation.</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.parts.map((part, i) => {
                        if (part.type === 'text') {
                          return (
                            <p key={i} className="whitespace-pre-wrap text-sm">
                              {part.text}
                              {isLoading && message.role === 'assistant' && i === message.parts.length - 1 && (
                                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse rounded-sm" />
                              )}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
                {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tell me something to remember..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s.text)}
                className="px-3 py-1.5 text-sm bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
              >
                {i + 1}. {s.short}
              </button>
            ))}
          </div>

          {/* Message History Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <span>📝</span>
                Message History
                <Badge variant="secondary">{messages.length} messages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-32 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet</p>
              ) : (
                <div className="space-y-1">
                  {messages.map((m, i) => (
                    <div key={i} className="text-xs text-muted-foreground truncate">
                      <span className="font-mono font-bold">{m.role}:</span>{' '}
                      {m.parts.map(p => p.type === 'text' ? p.text : '').join('')}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documentation */}
        <div className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">useChat Memory</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="concepts">Concepts</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <CodeBlock
                code={codeExample}
                language="typescript"
                filename="Memory with useChat"
              />
            </TabsContent>

            <TabsContent value="strategies">
              <CodeBlock
                code={memoryStrategies}
                language="typescript"
                filename="Memory management strategies"
              />
            </TabsContent>

            <TabsContent value="concepts">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-blue-500">🔄</span>
                      Stateless LLMs
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      LLMs don&apos;t inherently remember between API calls. Each request
                      must include all relevant context - the &quot;memory&quot; is just sending
                      the full conversation history.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-purple-500">📊</span>
                      Context Window
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Models have token limits (4K-128K+). Long conversations may exceed
                      this, requiring strategies like summarization or sliding windows.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <span className="text-green-500">💾</span>
                      Persistence
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      For long-term memory, store conversations in databases. Use RAG
                      (Retrieval Augmented Generation) to bring relevant past context
                      into new conversations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* How Memory Works */}
          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                💾 How Memory Works
              </h4>
              <p className="text-sm text-muted-foreground">
                LLMs are stateless - they don&apos;t remember between API calls. Memory is
                achieved by sending the <strong>entire conversation history</strong> with
                each request. useChat handles this automatically!
              </p>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-l-4 border-yellow-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                ⚠️ Context Limits
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Long conversations may exceed the model&apos;s context window</li>
                <li>• Cost increases with message history length</li>
                <li>• Implement summarization for long conversations</li>
                <li>• Consider RAG for long-term memory</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
