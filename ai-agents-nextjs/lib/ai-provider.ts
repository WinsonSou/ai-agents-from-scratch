import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

/**
 * LLM configuration interface for runtime configuration
 */
export interface LLMConfig {
  baseURL: string;
  apiKey?: string;
  modelName: string;
}

export type { LLMConfig as LLMConfigType };

/**
 * OpenAI-compatible provider for local LLMs
 * Works with Ollama, LM Studio, or any OpenAI-compatible API
 */
export const localLLM = createOpenAICompatible({
  name: 'local-llm',
  baseURL: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
  apiKey: process.env.LOCAL_LLM_API_KEY || undefined,
});

/**
 * Default model - can be overridden per request
 * For Ollama: use model name from `ollama list` (e.g., 'qwen3:1.7b', 'llama3:8b')
 * For LM Studio: use the model identifier shown in the server
 */
export const defaultModel = localLLM(
  process.env.LOCAL_LLM_MODEL || 'qwen3:1.7b'
);

/**
 * Helper to get a specific model from the default provider
 */
export function getModel(modelName: string) {
  return localLLM(modelName);
}

/**
 * Create a model with custom configuration
 * Use this when you need to connect to a different provider at runtime
 */
export function createModel(config: LLMConfig) {
  const provider = createOpenAICompatible({
    name: 'custom-llm',
    baseURL: config.baseURL,
    apiKey: config.apiKey || undefined,
  });
  return provider(config.modelName);
}

/**
 * Get model based on optional config - returns default if no config provided
 */
export function getModelWithConfig(config?: LLMConfig) {
  if (config && config.baseURL && config.modelName) {
    return createModel(config);
  }
  return defaultModel;
}
