import React, { useEffect, useState } from 'react';
import './OllamaStatus.css';

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface OllamaStatusData {
  status: 'available' | 'unavailable' | 'loading';
  lastChecked: string;
  models: string[];
  error?: string;
}

export function OllamaStatus() {
  const [statusData, setStatusData] = useState<OllamaStatusData>({
    status: 'loading',
    lastChecked: new Date().toISOString(),
    models: [],
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ollama/status`);
        if (!response.ok) {
          throw new Error('Failed to fetch Ollama status');
        }
        const data = await response.json();
        setStatusData(data);
      } catch (error) {
        setStatusData({
          status: 'unavailable',
          lastChecked: new Date().toISOString(),
          models: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ollama-status">
      <div className={`status-indicator ${statusData.status}`}>
        <div className="status-dot"></div>
        <span className="status-text">Ollama: {statusData.status}</span>
      </div>
      {statusData.status === 'available' && statusData.models.length > 0 && (
        <div className="models-list">
          <span className="models-label">Available Models:</span>
          <div className="models-grid">
            {statusData.models.map((model) => (
              <span key={model} className="model-tag">{model}</span>
            ))}
          </div>
        </div>
      )}
      {statusData.error && (
        <div className="error-message">{statusData.error}</div>
      )}
    </div>
  );
}
