import React, { useState, useEffect } from 'react';
import { useExtensionState } from './context/ExtensionStateContext';
import ChatView from './components/chat/ChatView';
import HistoryView from './components/history/HistoryView';
import SettingsView from './components/settings/SettingsView';
import WelcomeView from './components/welcome/WelcomeView';
import { vscode } from './utils/vscode';
import { ApiConfiguration, HistoryItem } from './types/sharedTypes';

const App: React.FC = () => {
  const { xamunMessages, taskHistory, apiConfiguration } = useExtensionState();
  const [currentView, setCurrentView] = useState<'chat' | 'history' | 'settings' | 'welcome'>('welcome');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    if (xamunMessages.length > 0) {
      setCurrentView('chat');
    }
  }, [xamunMessages]);

  const hideAnnouncement = () => {
    setShowAnnouncement(false);
    vscode.postMessage({ type: 'didShowAnnouncement' });
  };

  const showHistoryView = () => setCurrentView('history');
  const showSettingsView = () => setCurrentView('settings');

  const handleStartTask = () => {
    setCurrentView('chat');
    vscode.postMessage({ type: 'newTask' });
  };

  return (
    <div className="app">
      {currentView === 'chat' && (
        <ChatView
          isHidden={false}
          showAnnouncement={showAnnouncement}
          hideAnnouncement={hideAnnouncement}
          showHistoryView={showHistoryView}
          showSettingsView={showSettingsView}
        />
      )}
      {currentView === 'history' && (
        <HistoryView
          taskHistory={taskHistory as HistoryItem[]}
          onSelectTask={(taskId: string) => {
            vscode.postMessage({ type: 'showTaskWithId', text: taskId });
            setCurrentView('chat');
          }}
        />
      )}
      {currentView === 'settings' && (
        <SettingsView
          apiConfiguration={apiConfiguration as ApiConfiguration}
          onSave={(newConfig: ApiConfiguration) => {
            vscode.postMessage({ type: 'apiConfiguration', apiConfiguration: newConfig });
            setCurrentView('chat');
          }}
        />
      )}
      {currentView === 'welcome' && (
        <WelcomeView onStartTask={handleStartTask} />
      )}
    </div>
  );
};

export default App;
