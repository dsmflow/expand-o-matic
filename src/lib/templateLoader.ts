// Client-side template loader
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  mode: string;
  content: {
    purpose: string;
    instructions: string[];
    sections?: string[];
    variables?: string[];
  };
}

// Static templates for now - we'll add dynamic loading later
export const defaultTemplates: PromptTemplate[] = [
  {
    id: "content-generation",
    name: "Content Generation",
    category: "expansion",
    mode: "content",
    content: {
      purpose: "Transform brief topic ideas into comprehensive, well-structured content",
      instructions: [
        "Create an engaging introduction that hooks the reader",
        "Develop at least 3 main points or sections",
        "Include relevant examples or case studies",
        "Maintain a consistent tone and style",
        "Add a compelling conclusion that ties everything together",
        "Use transition sentences between sections"
      ],
      sections: [
        "introduction",
        "main_points",
        "examples",
        "conclusion"
      ],
      variables: [
        "topic",
        "target_length",
        "tone"
      ]
    }
  },
  {
    id: "explanation",
    name: "Explanation",
    category: "expansion",
    mode: "explain",
    content: {
      purpose: "Convert complex concepts into clear, accessible explanations",
      instructions: [
        "Start with a simple, high-level overview",
        "Break down complex terms into simpler components",
        "Use analogies or metaphors to illustrate concepts",
        "Progress from basic to advanced understanding",
        "Include practical examples or applications",
        "Address common misconceptions"
      ],
      sections: [
        "overview",
        "key_concepts",
        "analogies",
        "examples",
        "common_questions"
      ],
      variables: [
        "concept",
        "audience_expertise",
        "desired_depth"
      ]
    }
  }
];

export class TemplateLibrary {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates() {
    defaultTemplates.forEach(template => {
      this.templates.set(`${template.category}:${template.mode}:${template.id}`, template);
    });
  }

  getTemplate(category: string, mode: string, id: string): PromptTemplate | undefined {
    return this.templates.get(`${category}:${mode}:${id}`);
  }

  getTemplatesForCategory(category: string): PromptTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  getTemplatesForMode(category: string, mode: string): PromptTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category && template.mode === mode);
  }

  addTemplate(template: PromptTemplate) {
    this.templates.set(`${template.category}:${template.mode}:${template.id}`, template);
  }
}
