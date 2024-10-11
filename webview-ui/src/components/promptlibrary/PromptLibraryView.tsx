import React from 'react';

interface Prompt {
  id: string;
  title: string;
  content: string;
}

interface PromptLibraryViewProps {
  onDone: () => void;
  isTab?: boolean;
}

const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ onDone, isTab = false }) => {
  // This is a placeholder. We'll need to implement the actual fetching of prompts later.
  const predefinedPrompts: Prompt[] = [
    { id: '1', title: 'General Coding Assistant', content: 'You are a helpful coding assistant...' },
    { id: '2', title: 'Bug Finder', content: 'Analyze the following code for bugs...' },
    // Add more predefined prompts as needed
  ];

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    height: isTab ? '100vh' : 'auto',
    overflow: 'auto',
    backgroundColor: '#f5f5f5',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
  };

  const listItemStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '5px 10px',
    backgroundColor: '#007acc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Prompt Library</h2>
        {!isTab && <button style={buttonStyle} onClick={onDone}>Close</button>}
      </div>
      <ul style={listStyle}>
        {predefinedPrompts.map((prompt) => (
          <li key={prompt.id} style={listItemStyle}>
            <h3>{prompt.title}</h3>
            <p>{prompt.content.substring(0, 100)}...</p>
            <button style={buttonStyle}>Use Prompt</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromptLibraryView;
