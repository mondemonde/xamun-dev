import React from 'react';
import { vscode } from '../../utils/vscode';

interface WelcomeViewProps {
    onStartTask: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onStartTask }) => {
    return (
        <div>
            <h1>Welcome to Xamun Dev</h1>
            <p>Xamun Dev is your AI-powered coding assistant.</p>
            <button onClick={onStartTask}>Start a New Task</button>
        </div>
    );
};

export default WelcomeView;
