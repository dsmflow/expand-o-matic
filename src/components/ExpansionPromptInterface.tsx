import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface ExpansionMode {
  id: string;
  name: string;
  description: string;
  template: string;
}

const expansionModes: ExpansionMode[] = [
  {
    id: 'content',
    name: 'Content Generation',
    description: 'Create detailed content from brief inputs',
    template: 'Expand on the following topic with detailed analysis: '
  },
  {
    id: 'explanation',
    name: 'Explanation',
    description: 'Generate comprehensive explanations',
    template: 'Provide a detailed explanation of: '
  },
  {
    id: 'learning',
    name: 'Learning',
    description: 'Create educational content',
    template: 'Create a learning module about: '
  },
  {
    id: 'ideation',
    name: 'Ideation',
    description: 'Generate creative ideas and concepts',
    template: 'Generate innovative ideas around: '
  },
  {
    id: 'story',
    name: 'Story Writing',
    description: 'Develop narrative content',
    template: 'Create a story based on: '
  }
];

const ExpansionPromptInterface = () => {
  const [selectedMode, setSelectedMode] = useState<string>('content');
  const [input, setInput] = useState<string>('');
  const [modelSelection, setModelSelection] = useState<string>('gemini');
  const { toast } = useToast();

  const handleGenerate = () => {
    toast({
      title: "Generating Content",
      description: "Your expanded content will appear here soon.",
    });
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-cyan-600">
          Expansion Prompts
        </CardTitle>
        <p className="text-sm text-gray-500">
          Transform brief inputs into comprehensive content
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Expansion Mode
            </label>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {expansionModes.map(mode => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              AI Model
            </label>
            <Select value={modelSelection} onValueChange={setModelSelection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini Pro</SelectItem>
                <SelectItem value="gpt4">GPT-4</SelectItem>
                <SelectItem value="claude">Claude 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Your Input
            </label>
            <span className="text-xs text-gray-500">
              {input.length} / 1000 characters
            </span>
          </div>
          <Textarea
            placeholder="Enter your input for expansion..."
            className="min-h-[120px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
          <h3 className="font-semibold text-cyan-800 mb-1">
            {expansionModes.find(m => m.id === selectedMode)?.name}
          </h3>
          <p className="text-sm text-cyan-600">
            {expansionModes.find(m => m.id === selectedMode)?.description}
          </p>
        </div>

        <Button 
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
          disabled={!input.trim()}
          onClick={handleGenerate}
        >
          Generate Expanded Content
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExpansionPromptInterface;