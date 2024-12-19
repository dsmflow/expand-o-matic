# Expansion Prompt Templates

## Content Generation
```xml
<purpose>
    Transform brief topic ideas into comprehensive, well-structured content
</purpose>
<instructions>
    Create an engaging introduction that hooks the reader
    Develop at least 3 main points or sections
    Include relevant examples or case studies
    Maintain a consistent tone and style
    Add a compelling conclusion that ties everything together
    Use transition sentences between sections
</instructions>
<sections>
    introduction
    main_points
    examples
    conclusion
</sections>
<variables>
    topic
    target_length
    tone
</variables>
```

## Explanation
```xml
<purpose>
    Convert complex concepts into clear, accessible explanations
</purpose>
<instructions>
    Start with a simple, high-level overview
    Break down complex terms into simpler components
    Use analogies or metaphors to illustrate concepts
    Progress from basic to advanced understanding
    Include practical examples or applications
    Address common misconceptions
</instructions>
<sections>
    overview
    key_concepts
    analogies
    examples
    common_questions
</sections>
<variables>
    concept
    audience_expertise
    desired_depth
</variables>
```

## Learning
```xml
<purpose>
    Create educational content that facilitates effective learning
</purpose>
<instructions>
    Begin with clear learning objectives
    Structure content in logical progression
    Include practice exercises or activities
    Provide examples and non-examples
    Add self-assessment questions
    Include summary points for review
</instructions>
<sections>
    objectives
    content_modules
    exercises
    assessment
    summary
</sections>
<variables>
    subject
    learning_level
    time_allocation
</variables>
```

## Ideation
```xml
<purpose>
    Generate creative and innovative ideas from initial concepts
</purpose>
<instructions>
    Explore multiple perspectives and angles
    Consider unconventional approaches
    Apply different thinking frameworks
    Generate both practical and aspirational ideas
    Include potential implementation considerations
    Evaluate feasibility and impact
</instructions>
<sections>
    initial_concept
    brainstorm_results
    framework_analysis
    feasibility_assessment
    recommendations
</sections>
<variables>
    starting_concept
    constraints
    desired_outcomes
</variables>
```

## Story Writing
```xml
<purpose>
    Develop engaging narratives from basic plot elements
</purpose>
<instructions>
    Establish compelling characters and setting
    Create a clear story arc with rising action
    Develop meaningful conflict and resolution
    Include descriptive details and dialogue
    Maintain consistent narrative voice
    End with impact or revelation
</instructions>
<sections>
    character_profiles
    setting_description
    plot_outline
    dialogue
    resolution
</sections>
<variables>
    plot_seed
    genre
    target_length
</variables>
```

## Code Generation
```xml
<purpose>
    Transform requirements into well-structured, documented code
</purpose>
<instructions>
    Start with clear function/class specifications
    Include necessary imports and dependencies
    Follow language-specific best practices
    Add comprehensive documentation
    Include error handling
    Add usage examples
</instructions>
<sections>
    specifications
    imports
    implementation
    documentation
    tests
    examples
</sections>
<variables>
    requirements
    language
    coding_style
</variables>
```

## Documentation
```xml
<purpose>
    Create comprehensive, user-friendly documentation
</purpose>
<instructions>
    Begin with clear overview and purpose
    Include step-by-step instructions
    Add relevant code snippets or examples
    Document all parameters and return values
    Include troubleshooting section
    Add visual aids where helpful
</instructions>
<sections>
    overview
    setup
    usage_guide
    api_reference
    examples
    troubleshooting
</sections>
<variables>
    project_name
    target_audience
    documentation_scope
</variables>
```
