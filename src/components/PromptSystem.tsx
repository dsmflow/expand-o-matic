import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { TemplateLibrary, PromptTemplate } from '../lib/templateLoader';
import { sendPrompt } from '../lib/llmService';
import { ModelSelector } from './ModelSelector/ModelSelector';

// Prompt Type Interfaces
interface PromptTypeConfig {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  modes: PromptMode[];
}

interface PromptMode {
  id: string;
  name: string;
  description: string;
}

interface MetaPromptConfig {
  purpose: string;
  instructions: string[];
  sections?: string[];
  variables?: string[];
}

// Configuration Data
const promptTypes: PromptTypeConfig[] = [
  {
    id: 'expansion',
    name: 'Expansion Prompts',
    shortDescription: 'Small input -> Large output.',
    description: 'Transform brief inputs into comprehensive content',
    icon: '📝',
    modes: [
      { id: 'content', name: 'Content Generation', description: 'Create detailed content' },
      { id: 'explanation', name: 'Explanation', description: 'Generate explanations' },
      { id: 'learning', name: 'Learning', description: 'Create educational content' },
      { id: 'ideation', name: 'Ideation', description: 'Generate ideas' },
      { id: 'story', name: 'Story Writing', description: 'Create stories' }
    ]
  },
  {
    id: 'compression',
    name: 'Compression Prompts',
    shortDescription: 'Large input -> Small output.',
    description: 'Distill and summarize information',
    icon: '📊',
    modes: [
      { id: 'summary', name: 'Text Summarization', description: 'Create summaries' },
      { id: 'key-points', name: 'Key Points', description: 'Extract main points' },
      { id: 'abstract', name: 'Abstract Generation', description: 'Generate abstracts' }
    ]
  },
  {
    id: 'conversion',
    name: 'Conversion Prompts',
    shortDescription: 'Input format -> Different output format.',
    description: 'Transform content while preserving meaning',
    icon: '🔀',
    modes: [
      { id: 'text-to-code', name: 'Text to Code', description: 'Convert to code' },
      { id: 'text-to-sql', name: 'Text to SQL', description: 'Convert to SQL' },
      { id: 'format', name: 'Format Conversion', description: 'Convert formats' }
    ]
  },
  {
    id: 'seeker',
    name: 'Seeker Prompts',
    shortDescription: 'Query -> Relevant information.',
    description: 'Find and retrieve specific information',
    icon: '🔍',
    modes: [
      { id: 'qa', name: 'Question Answering', description: 'Get answers' },
      { id: 'extraction', name: 'Information Extraction', description: 'Extract info' },
      { id: 'search', name: 'Document Search', description: 'Search documents' }
    ]
  },
  {
    id: 'action',
    name: 'Action Prompts',
    shortDescription: 'Command -> Execution result.',
    description: 'Execute commands and workflows',
    icon: '⚡',
    modes: [
      { id: 'automation', name: 'Task Automation', description: 'Automate tasks' },
      { id: 'command', name: 'Command Execution', description: 'Run commands' },
      { id: 'workflow', name: 'Workflow Management', description: 'Manage workflows' }
    ]
  },
  {
    id: 'reasoning',
    name: 'Reasoning Prompts',
    shortDescription: 'Complex input -> Judgment/Insight/Decision.',
    description: 'Provide analysis and insights',
    icon: '🧠',
    modes: [
      { id: 'decision', name: 'Decision Making', description: 'Make decisions' },
      { id: 'planning', name: 'Planning', description: 'Create plans' },
      { id: 'problem', name: 'Problem Solving', description: 'Solve problems' }
    ]
  }
];

export const PromptSystem: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('expansion');
  const [mode, setMode] = useState('');
  const [model, setModel] = useState('gemini');
  const [input, setInput] = useState('');
  const [useMetaPrompt, setUseMetaPrompt] = useState(false);
  const [metaPrompt, setMetaPrompt] = useState<MetaPromptConfig>({
    purpose: '',
    instructions: [],
    sections: [],
    variables: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize template library
  useEffect(() => {
    const library = new TemplateLibrary();
    if (activeCategory && mode) {
      const availableTemplates = library.getTemplatesForMode(activeCategory, mode);
      setTemplates(availableTemplates);
    }
  }, [activeCategory, mode]);

  // Load template when selected
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMetaPrompt({
        purpose: template.content.purpose,
        instructions: template.content.instructions,
        sections: template.content.sections || [],
        variables: template.content.variables || []
      });
      setUseMetaPrompt(true);
    }
  };

  const activeType = promptTypes.find(type => type.id === activeCategory);
  const activeModes = activeType?.modes || [];

  const getModelName = (modelId: string): string => {
    if (modelId.startsWith('ollama:')) {
      return modelId.replace('ollama:', '');
    }
    switch (modelId) {
      case 'gemini':
        return 'gemini-pro';
      case 'gpt4':
        return 'gpt-4';
      default:
        return modelId;
    }
  };

  const getModelProvider = (modelId: string): string => {
    if (modelId.startsWith('ollama:')) {
      return 'ollama';
    }
    switch (modelId) {
      case 'gemini':
        return 'google';
      case 'gpt4':
        return 'openai';
      default:
        return modelId;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const provider = getModelProvider(model);
      const modelName = getModelName(model);

      console.log('Sending request:', {
        mode: activeCategory,
        provider,
        model: modelName,
        input_text: input,
        meta_prompt: useMetaPrompt ? metaPrompt : undefined,
      });

      const result = await sendPrompt({
        mode: activeCategory as any,
        provider: provider as any,
        model: modelName,
        input_text: input,
        meta_prompt: useMetaPrompt ? metaPrompt : undefined,
        temperature: 0.7,
        max_tokens: 1000,
      });

      console.log('Received response:', result);

      if (result.error) {
        setError(result.error);
      } else {
        setResponse(result.content);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <ModelSelector selectedModel={model} onModelSelect={setModel} />
          
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="grid grid-cols-6 w-full bg-white border border-gray-200 shadow-md rounded-lg scale-75 transform origin-top min-h-[120px]">
                  {promptTypes.map(type => (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="flex flex-col items-center justify-center py-4 px-2 border-r last:border-r-0 border-gray-200
                        hover:bg-gray-50 transition-colors relative min-h-[120px]
                        data-[state=active]:border-b-2 data-[state=active]:border-b-cyan-500 data-[state=active]:bg-white"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-2xl leading-none">{type.icon}</span>
                        <span className="text-xs font-medium text-gray-600 data-[state=active]:text-cyan-600">
                          {type.name.split(' ')[0]}
                        </span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {/* Main Content */}
          <Card className="p-6 shadow-md border border-gray-200">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-cyan-500">{activeType?.name}</h1>
              <p className="text-gray-600">{activeType?.description}</p>
            </div>

            <div className="space-y-6">
              {/* Meta Prompt Structure */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Structured Prompt</h3>
                  <p className="text-sm text-gray-600">Add purpose, instructions, and structure to your prompt</p>
                </div>
                <Switch
                  checked={useMetaPrompt}
                  onCheckedChange={setUseMetaPrompt}
                />
              </div>

              {/* Structured Prompt Fields */}
              {useMetaPrompt && (
                <div className="space-y-4 border-l-2 border-cyan-200 pl-4">
                  {/* Template Selection */}
                  {templates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={(value) => {
                          setSelectedTemplate(value);
                          loadTemplate(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <Textarea
                      placeholder="What is the main goal of this prompt?"
                      value={metaPrompt.purpose}
                      onChange={(e) => setMetaPrompt({...metaPrompt, purpose: e.target.value})}
                      className="min-h-[60px] bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <Textarea
                      placeholder="List specific instructions for the model (one per line)"
                      value={metaPrompt.instructions.join('\n')}
                      onChange={(e) => setMetaPrompt({
                        ...metaPrompt, 
                        instructions: e.target.value.split('\n').filter(line => line.trim())
                      })}
                      className="min-h-[100px] bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Required Sections</label>
                      <Textarea
                        placeholder="List required sections in output (one per line)"
                        value={metaPrompt.sections?.join('\n') || ''}
                        onChange={(e) => setMetaPrompt({
                          ...metaPrompt,
                          sections: e.target.value.split('\n').filter(line => line.trim())
                        })}
                        className="min-h-[60px] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input Variables</label>
                      <Textarea
                        placeholder="List variables to include (one per line)"
                        value={metaPrompt.variables?.join('\n') || ''}
                        onChange={(e) => setMetaPrompt({
                          ...metaPrompt,
                          variables: e.target.value.split('\n').filter(line => line.trim())
                        })}
                        className="min-h-[60px] bg-white"
                      />
                    </div>
                  </div>

                  {/* Preview of Final Prompt Structure */}
                  <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono">
                    <div className="text-gray-500 mb-2">Final Prompt Structure:</div>
                    <div className="whitespace-pre-wrap">
                      {`<purpose>\n${metaPrompt.purpose || '...'}\n</purpose>\n\n` +
                       `<instructions>\n${metaPrompt.instructions.map(i => `  ${i}`).join('\n') || '...'}\n</instructions>\n\n` +
                       (metaPrompt.sections?.length ? `<sections>\n${metaPrompt.sections.map(s => `  ${s}`).join('\n')}\n</sections>\n\n` : '') +
                       (metaPrompt.variables?.length ? `<variables>\n${metaPrompt.variables.map(v => `  ${v}`).join('\n')}\n</variables>` : '')}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeType?.name.split(' ')[0]} Mode
                </label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeModes.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Main Input Area */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Your Input</label>
                  <span className="text-sm text-gray-500">{input.length} / 1000 characters</span>
                </div>
                <Textarea
                  placeholder={useMetaPrompt ? 
                    `Enter values for: ${metaPrompt.variables?.join(', ') || 'no variables defined'}` :
                    `Enter your input for ${activeType?.name.toLowerCase()}...`
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] bg-white"
                />
              </div>

              {/* Mode Description */}
              {mode && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-blue-900 font-medium">
                    {activeModes.find(m => m.id === mode)?.name}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {activeModes.find(m => m.id === mode)?.description}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="w-full mt-4"
              >
                {isLoading ? 'Processing...' : 'Generate'}
              </Button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Response */}
              {response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {response}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
