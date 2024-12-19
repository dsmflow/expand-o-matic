import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OllamaStatus } from '../StatusIndicator/OllamaStatus';
import { useOllamaModels } from './useOllamaModels';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const { models, status } = useOllamaModels();
  
  const isOllamaModel = selectedModel.includes('ollama:');
  const actualModel = isOllamaModel ? selectedModel.replace('ollama:', '') : selectedModel;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Model Selection</CardTitle>
        <CardDescription>Choose an AI model to process your prompts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={selectedModel} onValueChange={onModelSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">🌀 Gemini Pro</SelectItem>
              <SelectItem value="gpt4">🤖 GPT-4</SelectItem>
              {models.map((model) => (
                <SelectItem key={model} value={`ollama:${model}`}>
                  🦙 {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isOllamaModel && (
          <div className="mt-4">
            <OllamaStatus />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
