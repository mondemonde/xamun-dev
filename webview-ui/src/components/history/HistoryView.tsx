import React from 'react';
import { HistoryItem } from '../../types/sharedTypes';

interface HistoryViewProps {
  taskHistory: HistoryItem[];
  onSelectTask: (taskId: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ taskHistory, onSelectTask }) => {
  return (
    <div>
      <h2>Task History</h2>
      <ul>
        {taskHistory.map((item) => (
          <li key={item.id} onClick={() => onSelectTask(item.id)}>
            {item.task} - {new Date(item.ts).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryView;
