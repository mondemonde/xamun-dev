import React, { createContext, useContext, useState, useEffect } from 'react';
import { vscode } from '../utils/vscode';
import { XamunMessage } from '../sharedTypes';
import { ApiConfiguration } from '../../../src/shared/api';
import { HistoryItem } from '../../../src/shared/HistoryItem';

export interface ExtensionStateContextType {
  xamunMessages: XamunMessage[];
  taskHistory: HistoryItem[];
  apiConfiguration: ApiConfiguration;
  version: string;
  customInstructions: string;
  alwaysAllowReadOnly: boolean;
  theme: any; // Replace 'any' with the correct type for theme
  filePaths: string[];
  setApiConfiguration: (config: ApiConfiguration) => void;
  setCustomInstructions: (instructions: string) => void;
  setAlwaysAllowReadOnly: (allow: boolean) => void;
}

const ExtensionStateContext = createContext<ExtensionStateContextType>({
  xamunMessages: [],
  taskHistory: [],
  apiConfiguration: {} as ApiConfiguration,
  version: '',
  customInstructions: '',
  alwaysAllowReadOnly: false,
  theme: {},
  filePaths: [],
  setApiConfiguration: () => {},
  setCustomInstructions: () => {},
  setAlwaysAllowReadOnly: () => {},
});

export const useExtensionState = () => useContext(ExtensionStateContext);

export const ExtensionStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExtensionStateContextType>({
    xamunMessages: [],
    taskHistory: [],
    apiConfiguration: {} as ApiConfiguration,
    version: '',
    customInstructions: '',
    alwaysAllowReadOnly: false,
    theme: {},
    filePaths: [],
    setApiConfiguration: (config: ApiConfiguration) => {
      setState(prevState => ({ ...prevState, apiConfiguration: config }));
      vscode.postMessage({ type: 'apiConfiguration', apiConfiguration: config });
    },
    setCustomInstructions: (instructions: string) => {
      setState(prevState => ({ ...prevState, customInstructions: instructions }));
      vscode.postMessage({ type: 'customInstructions', text: instructions });
    },
    setAlwaysAllowReadOnly: (allow: boolean) => {
      setState(prevState => ({ ...prevState, alwaysAllowReadOnly: allow }));
      vscode.postMessage({ type: 'alwaysAllowReadOnly', bool: allow });
    },
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'state') {
        setState(prevState => ({ ...prevState, ...message.state }));
      }
    };

    window.addEventListener('message', handleMessage);

    vscode.postMessage({ type: 'webviewDidLaunch' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <ExtensionStateContext.Provider value={state}>
      {children}
    </ExtensionStateContext.Provider>
  );
};
