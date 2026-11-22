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

const serverCode = `// app/api/chat/route.ts
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { getModelWithConfig } from '@/lib/ai-provider';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, config } = await req.json();
  
  const model = getModelWithConfig(config);

  const result = streamText({
    model,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}`;

const clientCode = `// Using useChat hook from @ai-sdk/react
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.parts.map(p => p.type === 'text' && p.text)}
        </div>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button type="submit" disabled={status === 'streaming'}>Send</button>
    </form>
  );
}`;

const useChatFeatures = `// useChat provides:
const {
  messages,       // Array of UIMessage with parts
  sendMessage,    // Send a new message
  status,         // 'ready' | 'submitted' | 'streaming'
  stop,           // Stop generation
  regenerate,     // Regenerate last response
  setMessages,    // Manually set messages
  error,          // Error state
} = useChat({
  api: '/api/chat',     // Optional, defaults to /api/chat
  id: 'my-chat',        // Optional chat ID
  onFinish: (message) => console.log('Done:', message),
  onError: (error) => console.error(error),
});`;

export default function StreamingExample() {
  const { config } = useConfig();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages, config },
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

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ExampleLayout
      title="Real-Time Streaming with useChat"
      description="Learn how to use the AI SDK's useChat hook for effortless streaming chat interfaces. Built-in state management, optimistic updates, and more."
      concepts={['useChat', 'streamText', 'UIMessage', 'Real-time UI', 'AI SDK React']}
      difficulty="intermediate"
      prevHref="/examples/03-reasoning"
      prevLabel="Reasoning"
      nextHref="/examples/05-tools"
      nextLabel="Tools"
      docsLink="https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chat Interface */}
        <div className="space-y-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Live Chat
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? 'Streaming...' : 'Ready'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearChat}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">Start a conversation!</p>
                    <p className="text-sm">Messages will stream in real-time.</p>
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
                            <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
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

                {/* Loading indicator when waiting for first token */}
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

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  {isLoading ? (
                    <Button type="button" variant="destructive" onClick={stop}>
                      Stop
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!input.trim()}>
                      Send
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {[
              'Tell me a short joke',
              'Explain quantum computing simply',
              'Write a haiku about coding',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-1.5 text-sm bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Documentation Panel */}
        <div className="space-y-6">
          <Tabs defaultValue="server">
            <TabsList>
              <TabsTrigger value="server">Server</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="features">useChat API</TabsTrigger>
            </TabsList>

            <TabsContent value="server">
              <CodeBlock
                code={serverCode}
                language="typescript"
                filename="app/api/chat/route.ts"
              />
            </TabsContent>

            <TabsContent value="client">
              <CodeBlock
                code={clientCode}
                language="typescript"
                filename="Using useChat hook"
              />
            </TabsContent>

            <TabsContent value="features">
              <CodeBlock
                code={useChatFeatures}
                language="typescript"
                filename="useChat features"
              />
            </TabsContent>
          </Tabs>

          {/* Benefits of useChat */}
          <Card className="border-l-4 border-green-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">
                ✨ Why useChat?
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Zero boilerplate</strong> - No manual fetch or stream handling</li>
                <li>• <strong>Automatic state</strong> - Messages, status, errors managed for you</li>
                <li>• <strong>Optimistic UI</strong> - User messages appear instantly</li>
                <li>• <strong>Built-in streaming</strong> - Token-by-token updates automatically</li>
                <li>• <strong>Stop/reload</strong> - Control generation with stop() and regenerate()</li>
              </ul>
            </CardContent>
          </Card>

          {/* Concepts */}
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-blue-500">📦</span>
                  UIMessage Format
                </h4>
                <p className="text-sm text-muted-foreground">
                  Messages use a parts array that can contain text, tool calls, files, and more.
                  This enables rich multi-modal conversations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-purple-500">🔄</span>
                  convertToModelMessages
                </h4>
                <p className="text-sm text-muted-foreground">
                  Transforms UI messages to the format expected by language models.
                  Handles the conversion automatically on the server.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <span className="text-orange-500">📤</span>
                  toUIMessageStreamResponse
                </h4>
                <p className="text-sm text-muted-foreground">
                  Returns a streaming response in the UIMessage format that useChat
                  understands and automatically parses.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                💡 Pro Tips
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use the body option to pass custom data (like config) to your API</li>
                <li>• Implement onFinish to track completed messages</li>
                <li>• Use stop() to cancel long generations</li>
                <li>• setMessages() allows restoring chat history</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExampleLayout>
  );
}
