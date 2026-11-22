import { generateText, stepCountIs } from 'ai';
import { getModelWithConfig, type LLMConfig } from '@/lib/ai-provider';
import { calculatorTools } from '@/lib/tools/calculator';

export async function POST(req: Request) {
  const { prompt, config } = await req.json() as {
    prompt: string;
    config?: LLMConfig;
  };

  const model = getModelWithConfig(config);

  const result = await generateText({
    model,
    tools: calculatorTools,
    stopWhen: stepCountIs(10),
    system: `You are a mathematical assistant that uses the ReAct (Reasoning + Acting) approach.

For each step in solving a problem:
1. THINK: Explain what calculation you need to do next and why
2. ACT: Use a tool to perform the calculation
3. OBSERVE: Analyze the result

Continue this pattern until you have the final answer. Always break complex problems into simple steps.

Example:
User: "What is (5 + 3) × 2?"
Think: First I need to add 5 and 3
Act: [use add tool with a=5, b=3]
Observe: The result is 8
Think: Now I need to multiply 8 by 2
Act: [use multiply tool with a=8, b=2]
Observe: The result is 16
Answer: (5 + 3) × 2 = 16`,
    prompt,
  });

  // Extract steps for visualization
  const steps = result.steps.map((step, index) => ({
    stepNumber: index + 1,
    text: step.text,
    toolCalls: step.toolCalls?.map((tc) => ({
      toolName: tc.toolName,
      input: 'input' in tc ? tc.input : undefined,
    })),
    toolResults: step.toolResults?.map((tr) => ({
      toolName: tr.toolName,
      output: 'output' in tr ? tr.output : undefined,
    })),
  }));

  return Response.json({
    text: result.text,
    steps,
    totalSteps: result.steps.length,
    finishReason: result.finishReason,
  });
}
