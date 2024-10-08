import React, { useState } from 'react';
import { ApiConfiguration } from '../../types/sharedTypes';
import ApiOptions from './ApiOptions';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

interface SettingsViewProps {
  apiConfiguration: ApiConfiguration;
  onSave: (newConfig: ApiConfiguration) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ apiConfiguration, onSave }) => {
  const [config, setConfig] = useState<ApiConfiguration>(apiConfiguration);
  const [showSettings, setShowSettings] = useState(false);

  const handleSave = () => {
    onSave(config);
    setShowSettings(false);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="settings-view">
      <h2>API Settings</h2>
      <VSCodeButton onClick={toggleSettings}>
        {showSettings ? 'Hide Settings' : 'Show Settings'}
      </VSCodeButton>
      {showSettings && (
        <div className="settings-content" style={{ marginTop: '1rem' }}>
          <ApiOptions
            apiConfiguration={config}
            onChange={(newConfig) => setConfig(newConfig)}
          />
          <VSCodeButton onClick={handleSave} style={{ marginTop: '1rem' }}>
            Save Changes
          </VSCodeButton>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
