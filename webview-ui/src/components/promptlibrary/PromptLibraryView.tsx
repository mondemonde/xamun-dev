import React from 'react';

interface Prompt {
  id: string;
  title: string;
  content: string;
}

interface PromptLibraryViewProps {
  onDone: () => void;
  isTab?: boolean;
  selectedFilePath?: string;
  onUsePrompt: (content: string) => void;
}

const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ onDone, isTab = false, selectedFilePath, onUsePrompt }) => {
  // This is a placeholder. We'll need to implement the actual fetching of prompts later.
  const predefinedPrompts: Prompt[] = [
    { id: '1', title: 'Explain File', content: 'Explain this file' },
    { id: '2', title: 'Check for Bugs', content: 'Analyze the file for bugs...' },
    // Add more predefined prompts as needed
  ];

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    height: isTab ? '100vh' : 'auto',
    overflow: 'auto',
    backgroundColor: '#1e1e1e', // Dark background
    color: '#ffffff', // Light text
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  };

  const headerTopStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const filePathStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#888888', // Light gray for file path
    marginBottom: '10px',
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
  };

  const listItemStyle: React.CSSProperties = {
    backgroundColor: '#2d2d2d', // Darker item background
    border: '1px solid #3e3e3e', // Darker border
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
  };

  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    backgroundColor: disabled ? '#4a4a4a' : '#0e639c', // Darker blue when enabled, gray when disabled
    color: disabled ? '#a0a0a0' : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  });

  const titleStyle: React.CSSProperties = {
    color: '#d0ced2', // Light xamun for titles
  };

  const contentStyle: React.CSSProperties = {
    color: '#d4d4d4', // Light gray for content
  };

  const handleUsePrompt = (content: string) => {
    onUsePrompt(content);
    if (!isTab) {
      onDone();
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerTopStyle}>
          <h2 style={titleStyle}>Prompt Library</h2>
          {!isTab && <button style={buttonStyle(false)} onClick={onDone}>Close</button>}
        </div>
        {selectedFilePath && (
          <div style={filePathStyle}>
            Selected file: {selectedFilePath}
          </div>
        )}
      </div>
      <ul style={listStyle}>
        {predefinedPrompts.map((prompt) => (
          <li key={prompt.id} style={listItemStyle}>
            <h3 style={titleStyle}>{prompt.title}</h3>
            <p style={contentStyle}>{prompt.content.substring(0, 100)}...</p>
            <button 
              style={buttonStyle(!selectedFilePath)} 
              onClick={() => handleUsePrompt(prompt.content)}
              disabled={!selectedFilePath}
            >
              Use Prompt
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromptLibraryView;
