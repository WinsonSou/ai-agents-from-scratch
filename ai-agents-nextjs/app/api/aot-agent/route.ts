import { generateObject, generateText } from 'ai';
import { getModelWithConfig, type LLMConfig } from '@/lib/ai-provider';
import { z } from 'zod';

// Schema for Atom of Thought planning
const planSchema = z.object({
  goal: z.string().describe('The main goal to achieve'),
  atoms: z.array(
    z.object({
      id: z.string().describe('Unique identifier for this atom'),
      operation: z.string().describe('The operation to perform'),
      description: z.string().describe('What this step does'),
      inputs: z.array(z.string()).describe('Input values or references to other atoms'),
      dependencies: z.array(z.string()).describe('IDs of atoms this depends on'),
    })
  ).describe('Atomic steps to achieve the goal'),
  expectedOutput: z.string().describe('What the final result should be'),
});

type Plan = z.infer<typeof planSchema>;
type AtomResult = { id: string; result: string | number; status: 'success' | 'error' };

// Execute a single atom based on its operation
async function executeAtom(
  atom: Plan['atoms'][0],
  results: Map<string, AtomResult>
): Promise<AtomResult> {
  // Resolve input values (either literal or reference to previous result)
  const resolvedInputs = atom.inputs.map((input) => {
    if (input.startsWith('$')) {
      const refId = input.slice(1);
      const ref = results.get(refId);
      return ref?.result ?? input;
    }
    return isNaN(Number(input)) ? input : Number(input);
  });

  // Simple operation executor
  const op = atom.operation.toLowerCase();
  let result: string | number;

  try {
    if (op === 'add' && resolvedInputs.length >= 2) {
      result = Number(resolvedInputs[0]) + Number(resolvedInputs[1]);
    } else if (op === 'subtract' && resolvedInputs.length >= 2) {
      result = Number(resolvedInputs[0]) - Number(resolvedInputs[1]);
    } else if (op === 'multiply' && resolvedInputs.length >= 2) {
      result = Number(resolvedInputs[0]) * Number(resolvedInputs[1]);
    } else if (op === 'divide' && resolvedInputs.length >= 2) {
      result = Number(resolvedInputs[0]) / Number(resolvedInputs[1]);
    } else if (op === 'average' && resolvedInputs.length >= 1) {
      const nums = resolvedInputs.map(Number);
      result = nums.reduce((a, b) => a + b, 0) / nums.length;
    } else if (op === 'sum' && resolvedInputs.length >= 1) {
      result = resolvedInputs.map(Number).reduce((a, b) => a + b, 0);
    } else {
      result = `Executed: ${atom.operation} with ${JSON.stringify(resolvedInputs)}`;
    }

    return { id: atom.id, result, status: 'success' };
  } catch (error) {
    return { id: atom.id, result: `Error: ${error}`, status: 'error' };
  }
}

export async function POST(req: Request) {
  const { prompt, config } = await req.json() as {
    prompt: string;
    config?: LLMConfig;
  };

  const model = getModelWithConfig(config);

  // Step 1: Generate the plan using structured output
  const { object: plan } = await generateObject({
    model,
    schema: planSchema,
    system: `You are an Atom of Thought (AoT) planner. Break down problems into atomic, executable steps.

Each atom should be:
- Simple and focused on one operation
- Have clear inputs (use $atomId to reference previous results)
- Specify dependencies correctly

Operations available: add, subtract, multiply, divide, average, sum

Example for "Calculate (5 + 3) × 2":
{
  "goal": "Calculate (5 + 3) × 2",
  "atoms": [
    {"id": "a1", "operation": "add", "description": "Add 5 and 3", "inputs": ["5", "3"], "dependencies": []},
    {"id": "a2", "operation": "multiply", "description": "Multiply result by 2", "inputs": ["$a1", "2"], "dependencies": ["a1"]}
  ],
  "expectedOutput": "16"
}`,
    prompt: `Create an atomic execution plan for: ${prompt}`,
  });

  // Step 2: Execute the plan in dependency order
  const results = new Map<string, AtomResult>();
  const executed: AtomResult[] = [];

  // Topological sort and execute
  const pending = [...plan.atoms];
  let iterations = 0;
  const maxIterations = 100;

  while (pending.length > 0 && iterations < maxIterations) {
    iterations++;
    const readyIndex = pending.findIndex((atom) =>
      atom.dependencies.every((dep) => results.has(dep))
    );

    if (readyIndex === -1) break;

    const atom = pending.splice(readyIndex, 1)[0];
    const result = await executeAtom(atom, results);
    results.set(atom.id, result);
    executed.push(result);
  }

  // Step 3: Generate final summary
  const finalResult = executed[executed.length - 1]?.result;
  const { text: summary } = await generateText({
    model,
    prompt: `Given the problem "${prompt}" and the computed result ${finalResult}, provide a brief, clear answer.`,
  });

  return Response.json({
    plan,
    execution: executed,
    finalResult,
    summary,
  });
}
