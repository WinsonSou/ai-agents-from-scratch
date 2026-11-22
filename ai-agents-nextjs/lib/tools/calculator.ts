import { tool } from 'ai';
import { z } from 'zod';

export const calculatorTools = {
  add: tool({
    description: 'Add two numbers together',
    inputSchema: z.object({
      a: z.number().describe('First number'),
      b: z.number().describe('Second number'),
    }),
    execute: async ({ a, b }) => {
      return { result: a + b, operation: `${a} + ${b} = ${a + b}` };
    },
  }),

  subtract: tool({
    description: 'Subtract the second number from the first',
    inputSchema: z.object({
      a: z.number().describe('Number to subtract from'),
      b: z.number().describe('Number to subtract'),
    }),
    execute: async ({ a, b }) => {
      return { result: a - b, operation: `${a} - ${b} = ${a - b}` };
    },
  }),

  multiply: tool({
    description: 'Multiply two numbers together',
    inputSchema: z.object({
      a: z.number().describe('First number'),
      b: z.number().describe('Second number'),
    }),
    execute: async ({ a, b }) => {
      return { result: a * b, operation: `${a} × ${b} = ${a * b}` };
    },
  }),

  divide: tool({
    description: 'Divide the first number by the second',
    inputSchema: z.object({
      a: z.number().describe('Dividend'),
      b: z.number().describe('Divisor'),
    }),
    execute: async ({ a, b }) => {
      if (b === 0) {
        return { error: 'Cannot divide by zero' };
      }
      return { result: a / b, operation: `${a} ÷ ${b} = ${a / b}` };
    },
  }),
};

export const weatherTool = {
  getWeather: tool({
    description: 'Get the current weather for a city',
    inputSchema: z.object({
      city: z.string().describe('The city to get weather for'),
    }),
    execute: async ({ city }) => {
      const conditions = ['sunny', 'cloudy', 'rainy', 'snowy'];
      const temp = Math.floor(Math.random() * 30) + 10;
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        city,
        temperature: temp,
        unit: 'celsius',
        condition,
        description: `It's ${condition} in ${city} with a temperature of ${temp}°C`,
      };
    },
  }),
};

export const timeTool = {
  getCurrentTime: tool({
    description: 'Get the current time in a specific timezone',
    inputSchema: z.object({
      timezone: z
        .string()
        .optional()
        .describe('Timezone (e.g., "America/New_York", "Europe/London")'),
    }),
    execute: async ({ timezone }) => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone || 'UTC',
        timeZoneName: 'short',
      };
      
      return {
        time: now.toLocaleTimeString('en-US', options),
        timezone: timezone || 'UTC',
      };
    },
  }),
};
