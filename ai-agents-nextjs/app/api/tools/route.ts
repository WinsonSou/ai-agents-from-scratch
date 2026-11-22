import { generateText, stepCountIs } from 'ai';
import { getModelWithConfig, type LLMConfig } from '@/lib/ai-provider';
import { calculatorTools, weatherTool, timeTool } from '@/lib/tools/calculator';

const allTools = {
  ...calculatorTools,
  ...weatherTool,
  ...timeTool,
};

export async function POST(req: Request) {
  const { prompt, config } = await req.json() as {
    prompt: string;
    config?: LLMConfig;
  };

  try {
    const model = getModelWithConfig(config);
    
    const result = await generateText({
      model,
      tools: allTools,
      stopWhen: stepCountIs(5),
      system: `You are a helpful assistant with access to tools. 
Use the available tools to help answer user questions.
When you use a tool, explain what you're doing and why.
After getting a tool result, explain the result to the user.`,
      prompt,
    });

    return Response.json({
      text: result.text,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      steps: result.steps,
    });
  } catch (error) {
    console.error('Tools error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
