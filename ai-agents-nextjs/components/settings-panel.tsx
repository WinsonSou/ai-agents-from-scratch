'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, LabeledInput } from '@/components/ui';
import { useConfig, type LLMConfig } from '@/components/config-provider';

export { useConfig, type LLMConfig };

const DEFAULT_CONFIG: LLMConfig = {
  baseURL: 'http://localhost:11434/v1',
  apiKey: '',
  modelName: 'qwen3:1.7b',
};

const PRESET_PROVIDERS = [
  { name: 'Ollama', baseURL: 'http://localhost:11434/v1', requiresKey: false },
  { name: 'LM Studio', baseURL: 'http://localhost:1234/v1', requiresKey: false },
  { name: 'OpenAI', baseURL: 'https://api.openai.com/v1', requiresKey: true },
  { name: 'Groq', baseURL: 'https://api.groq.com/openai/v1', requiresKey: true },
  { name: 'Together AI', baseURL: 'https://api.together.xyz/v1', requiresKey: true },
  { name: 'Custom', baseURL: '', requiresKey: false },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { config, saveConfig, isLoaded } = useConfig();
  const [localConfig, setLocalConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const [selectedProvider, setSelectedProvider] = useState('Ollama');
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isLoaded) {
      setLocalConfig(config);
      const provider = PRESET_PROVIDERS.find(p => p.baseURL === config.baseURL);
      setSelectedProvider(provider?.name || 'Custom');
    }
  }, [config, isLoaded]);

  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    const provider = PRESET_PROVIDERS.find(p => p.name === providerName);
    if (provider && provider.baseURL) {
      setLocalConfig(prev => ({ ...prev, baseURL: provider.baseURL }));
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    saveConfig(localConfig);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Say "hello" and nothing else.',
          maxTokens: 10,
          config: localConfig,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          setTestStatus('success');
          setTestMessage(`Connected! Response: "${data.text.slice(0, 50)}..."`);
        } else {
          setTestStatus('error');
          setTestMessage('No response received');
        }
      } else {
        const error = await res.json();
        setTestStatus('error');
        setTestMessage(error.error || 'Connection failed');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage((err as Error).message);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const currentProvider = PRESET_PROVIDERS.find(p => p.name === selectedProvider);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <Card className="relative z-10 w-full max-w-lg shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>⚙️</span>
              LLM Settings
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_PROVIDERS.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleProviderChange(provider.name)}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    selectedProvider === provider.name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          {/* Base URL */}
          <LabeledInput
            label="API Base URL"
            value={localConfig.baseURL}
            onChange={(e) => setLocalConfig(prev => ({ ...prev, baseURL: e.target.value }))}
            placeholder="http://localhost:11434/v1"
          />

          {/* API Key */}
          <div>
            <LabeledInput
              label={`API Key ${currentProvider?.requiresKey ? '(required)' : '(optional)'}`}
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder={currentProvider?.requiresKey ? 'sk-...' : 'Leave empty for local LLMs'}
            />
            {currentProvider?.requiresKey && !localConfig.apiKey && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ API key required for {selectedProvider}
              </p>
            )}
          </div>

          {/* Model Name */}
          <LabeledInput
            label="Model Name"
            value={localConfig.modelName}
            onChange={(e) => setLocalConfig(prev => ({ ...prev, modelName: e.target.value }))}
            placeholder="e.g., qwen3:1.7b, gpt-4o-mini, llama3-8b"
          />

          {/* Model suggestions */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-medium">Suggested models:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {selectedProvider === 'Ollama' && (
                <>
                  <li>qwen3:1.7b, qwen3:8b, llama3:8b, mistral:7b</li>
                  <li>Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ollama list</code> to see available models</li>
                </>
              )}
              {selectedProvider === 'LM Studio' && (
                <li>Check model name in LM Studio server panel</li>
              )}
              {selectedProvider === 'OpenAI' && (
                <li>gpt-4o, gpt-4o-mini, gpt-3.5-turbo</li>
              )}
              {selectedProvider === 'Groq' && (
                <li>llama-3.3-70b-versatile, mixtral-8x7b-32768</li>
              )}
              {selectedProvider === 'Together AI' && (
                <li>meta-llama/Llama-3-70b-chat-hf, mistralai/Mixtral-8x7B-Instruct-v0.1</li>
              )}
            </ul>
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className="flex-1"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <div className={`flex-1 text-sm ${
                testStatus === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testStatus === 'success' ? '✅' : '❌'} {testMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Settings are saved locally in your browser
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}
