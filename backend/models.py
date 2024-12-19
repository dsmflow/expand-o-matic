from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from pydantic_ai import OpenAISchema, AIModel

class PromptMode(str, Enum):
    EXPANSION = "expansion"
    COMPRESSION = "compression"
    CONVERSION = "conversion"
    SEEKER = "seeker"
    ACTION = "action"
    REASONING = "reasoning"

class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OLLAMA = "ollama"
    LMSTUDIO = "lmstudio"

class MetaPromptConfig(BaseModel):
    purpose: str
    instructions: List[str]
    sections: Optional[List[str]] = None
    variables: Optional[List[str]] = None

class PromptRequest(BaseModel):
    mode: PromptMode
    provider: LLMProvider
    model: str
    input_text: str
    meta_prompt: Optional[MetaPromptConfig] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class PromptResponse(BaseModel):
    content: str
    usage: Optional[Dict[str, int]] = None
    error: Optional[str] = None

class ExpansionPrompt(OpenAISchema):
    """Expands the input based on the given meta prompt configuration."""
    expanded_content: str = Field(description="The expanded content following the meta prompt structure")
    sections: Dict[str, str] = Field(description="Content organized by sections as specified in meta prompt")
    
    @property
    def response(self) -> PromptResponse:
        return PromptResponse(
            content=self.expanded_content,
            usage=None  # We'll add usage stats from the actual API response
        )

class CompressionPrompt(OpenAISchema):
    """Compresses the input while maintaining key information."""
    compressed_content: str = Field(description="The compressed version of the input")
    key_points: List[str] = Field(description="List of key points preserved in compression")
    
    @property
    def response(self) -> PromptResponse:
        return PromptResponse(
            content=self.compressed_content,
            usage=None
        )

# Add more specialized prompt models for other modes...
