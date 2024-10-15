import React, { useState } from 'react';
import { windowsToLinuxPath } from '../../utils/xamunHelper';

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
  const [additionalText, setAdditionalText] = useState('');

  // This is a placeholder. We'll need to implement the actual fetching of prompts later.
  const predefinedPrompts: Prompt[] = [

    { id: '1', title: 'Explain File', content: 'Explain this file or folder' },

    {
      id: '2', title: 'Display data in the UI ', content: `I want you to follow the following steps to finish this task: \n  
     
      1.check if the path __path__ is inside a module or feature folder if it is a module then create 
         a new component inside that module if you can not determine what module then create a new module or feature
         where you will create the new component 
         \n __addtionalText__ 
         \n __jsonContent__

      

      ` },

    { id: '3', title: 'Check for Bugs', content: 'Analyze the file for bugs...' },
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '5px',
    marginBottom: '10px',
    backgroundColor: '#3c3c3c',
    color: '#ffffff',
    border: '1px solid #555555',
    borderRadius: '4px',
  };

  const handleUsePrompt = (content: string, additionalPrompt: string = '') => {

    let thisPath = windowsToLinuxPath(selectedFilePath || '');
    content = content.replace('__path__', thisPath)
    content = content.replace('__addtionalText__', additionalPrompt)
    content = content.replace('__jsonContent__', jsonContent)
    //ontent += `\n ${additionalPrompt}`


    const fileContext = `${thisPath}` //selectedFilePath ? `\n\nFile: ${thisPath}` : '';
    const combinedContent = `${content}\n${fileContext}`;
    onUsePrompt(combinedContent);
    if (!isTab) {
      onDone();
    }
  };

  const handlePrompt2 = (additionalPrompt: string = '') => {
    let prompt = `\n 2. use the api __addtionalText__ to fetch the data to display  create or update the service for the module \n`
    prompt.replace('__addtionalText__', additionalPrompt)
    setAdditionalText(prompt);
  };

  const [jsonContent, setJsonContent] = useState<string>(''); // State for JSON content
  const [isJsonValid, setIsJsonValid] = useState<boolean>(false); // Track JSON validity


  const handleJsonChange = (value: string) => {
   
    setIsJsonValid(value.trim().length > 0); // Validate JSON content is non-empty
    let prompt = `\n -use the json sample as the model \n`
    prompt += value;   
    setJsonContent(prompt);
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
      {/* <input
        type="text"
        placeholder="Enter additional context here..."
        value={additionalText}
        onChange={(e) => setAdditionalText(e.target.value)}
        style={inputStyle}
      /> */}
      <ul style={listStyle}>
        {predefinedPrompts.map((prompt) => (
          <li key={prompt.id} style={listItemStyle}>
            <h3 style={titleStyle}>{prompt.title}</h3>
            <p style={contentStyle}>{prompt.content.substring(0, 100)}...</p>

            {/* Conditionally render input if the prompt id is '2' */}
            {prompt.id === '2' && (
              <>
                <input
                  type="text"
                  placeholder="Enter api endpoint/url to use..."
                  style={inputStyle}
                  value={additionalText}
                  onChange={(e) => handlePrompt2(e.target.value)}
                />

                <label style={{ color: isJsonValid ? '#d4d4d4' : '#ff4d4d', marginBottom: '5px', display: 'block' }}>
                  JSON Content (Required)
                </label>
                <textarea
                  placeholder="Paste JSON content here..."
                  style={{ ...inputStyle, height: '100px', borderColor: isJsonValid ? '#555555' : '#ff4d4d' }}
                  value={jsonContent}
                  onChange={(e) => handleJsonChange(e.target.value)}
                />
              </>
            )}

            <button
              style={buttonStyle(!selectedFilePath)}
              onClick={() => handleUsePrompt(prompt.content, additionalText)}
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
