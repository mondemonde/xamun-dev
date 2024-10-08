import { ApiConfiguration } from '../types/sharedTypes';

interface ModelInfo {
  supportsImages: boolean;
  supportsPromptCache: boolean;
}

export function normalizeApiConfiguration(apiConfiguration: ApiConfiguration): { selectedModelInfo: ModelInfo } {
  // This is a placeholder implementation. You may need to adjust this based on your actual requirements.
  const selectedModelInfo: ModelInfo = {
    supportsImages: apiConfiguration.apiProvider === 'anthropic' || apiConfiguration.apiProvider === 'openai',
    supportsPromptCache: apiConfiguration.apiProvider === 'anthropic',
  };

  return { selectedModelInfo };
}