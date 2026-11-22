'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface LLMConfig {
  baseURL: string;
  apiKey: string;
  modelName: string;
}

const DEFAULT_CONFIG: LLMConfig = {
  baseURL: 'http://localhost:11434/v1',
  apiKey: '',
  modelName: 'qwen3:1.7b',
};

const STORAGE_KEY = 'ai-agents-llm-config';

interface ConfigContextType {
  config: LLMConfig;
  saveConfig: (config: LLMConfig) => void;
  isLoaded: boolean;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        setConfig(DEFAULT_CONFIG);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = useCallback((newConfig: LLMConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, saveConfig, isLoaded }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
