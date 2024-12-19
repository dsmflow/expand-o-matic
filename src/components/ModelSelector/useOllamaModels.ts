import { useState, useEffect } from 'react';

interface OllamaStatusData {
  status: 'available' | 'unavailable' | 'loading';
  lastChecked: string;
  models: string[];
  error?: string;
}

export function useOllamaModels() {
  const [status, setStatus] = useState<'available' | 'unavailable' | 'loading'>('loading');
  const [models, setModels] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/ollama/status');
        if (!response.ok) {
          throw new Error('Failed to fetch Ollama status');
        }
        const data: OllamaStatusData = await response.json();
        setStatus(data.status);
        setModels(data.models);
        setError(data.error);
      } catch (error) {
        setStatus('unavailable');
        setModels([]);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return { status, models, error };
}
