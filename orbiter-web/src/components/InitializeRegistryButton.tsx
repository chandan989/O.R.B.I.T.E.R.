import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';

export const InitializeRegistryButton: React.FC = () => {
  const { initializeRegistry, loading } = useContract() as any;
  const [status, setStatus] = useState<string>('idle');

  const handleClick = async () => {
    setStatus('initializing');
    try {
      await initializeRegistry();
      setStatus('done');
    } catch (e) {
      setStatus('error');
    }
  };

  let label = 'Initialize Registry';
  if (status === 'initializing' || loading) label = 'Initializing...';
  else if (status === 'done') label = 'Registry Initialized';
  else if (status === 'error') label = 'Retry Initialization';

  return (
    <button
      onClick={handleClick}
      disabled={status === 'done' || loading}
      className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium"
    >
      {label}
    </button>
  );
};

export default InitializeRegistryButton;