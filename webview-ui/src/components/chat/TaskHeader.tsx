import React from 'react';
import { XamunChatMessage } from '../../types/sharedTypes';

interface TaskHeaderProps {
  task: XamunChatMessage;
  tokensIn: number;
  tokensOut: number;
  doesModelSupportPromptCache: boolean;
  cacheWrites: number;
  cacheReads: number;
  totalCost: number;
  onClose: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  tokensIn,
  tokensOut,
  doesModelSupportPromptCache,
  cacheWrites,
  cacheReads,
  totalCost,
  onClose,
}) => {
  return (
    <div className="task-header">
      <h2>{task.text}</h2>
      <div className="task-stats">
        <span>Tokens In: {tokensIn}</span>
        <span>Tokens Out: {tokensOut}</span>
        {doesModelSupportPromptCache && (
          <>
            <span>Cache Writes: {cacheWrites}</span>
            <span>Cache Reads: {cacheReads}</span>
          </>
        )}
        <span>Total Cost: ${totalCost.toFixed(4)}</span>
      </div>
      <button onClick={onClose}>Close Task</button>
    </div>
  );
};

export default TaskHeader;
