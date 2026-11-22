import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { getModelWithConfig, type LLMConfig } from '@/lib/ai-provider';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, config } = (await req.json()) as {
    messages: UIMessage[];
    system?: string;
    config?: LLMConfig;
  };

  const model = getModelWithConfig(config);

  const result = streamText({
    model,
    system,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
