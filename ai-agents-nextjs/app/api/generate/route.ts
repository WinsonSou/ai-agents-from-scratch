import { generateText } from 'ai';
import { getModelWithConfig, type LLMConfig } from '@/lib/ai-provider';

export async function POST(req: Request) {
  const { prompt, system, temperature, maxTokens, config } = await req.json() as {
    prompt: string;
    system?: string;
    temperature?: number;
    maxTokens?: number;
    config?: LLMConfig;
  };

  try {
    const model = getModelWithConfig(config);
    
    const { text, usage, finishReason } = await generateText({
      model,
      system,
      prompt,
      temperature: temperature ?? 0.7,
    });

    return Response.json({
      text,
      usage: {
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
      },
      finishReason,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return Response.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
