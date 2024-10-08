import React from 'react';
import { ApiConfiguration, ApiProvider } from '../../types/sharedTypes';
import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';

interface ApiOptionsProps {
  apiConfiguration: ApiConfiguration;
  onChange: (newConfig: ApiConfiguration) => void;
}

const ApiOptions: React.FC<ApiOptionsProps> = ({ apiConfiguration, onChange }) => {
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    onChange({
      ...apiConfiguration,
      [name]: name === 'apiProvider' ? value as ApiProvider : value,
    });
  };

  return (
    <div className="api-options">
      <div className="setting-group">
        <label htmlFor="apiProvider">API Provider</label>
        <VSCodeDropdown
          id="apiProvider"
          name="apiProvider"
          value={apiConfiguration.apiProvider}
          disabled={true}
        >
          <VSCodeOption value="anthropic">Anthropic</VSCodeOption>
          <VSCodeOption value="openai">OpenAI</VSCodeOption>
          <VSCodeOption value="openrouter">OpenRouter</VSCodeOption>
          <VSCodeOption value="bedrock">AWS Bedrock</VSCodeOption>
          <VSCodeOption value="vertex">Google Vertex AI</VSCodeOption>
          <VSCodeOption value="ollama">Ollama</VSCodeOption>
        </VSCodeDropdown>
      </div>
      <div className="setting-group">
        <label htmlFor="apiModelId">Model</label>
        <VSCodeDropdown
          id="apiModelId"
          name="apiModelId"
          value={apiConfiguration.apiModelId}
          onChange={(e) => handleChange(e as unknown as Event)}
        >
          <VSCodeOption value="claude-3-sonnet-20240229">claude-3-sonnet-20240229</VSCodeOption>
          <VSCodeOption value="claude-3-opus-20240229">claude-3-opus-20240229</VSCodeOption>
        </VSCodeDropdown>
      </div>
      <div className="setting-group">
        <label htmlFor="apiKey">Anthropic API Key</label>
        <VSCodeTextField
          type="password"
          id="apiKey"
          name="apiKey"
          value={apiConfiguration.apiKey}
          onChange={(e) => handleChange(e as unknown as Event)}
        />
      </div>
      <p className="api-key-info">
        This key is stored locally and only used to make API requests from this extension.
      </p>
    </div>
  );
};

export default ApiOptions;
