from __future__ import annotations

import os
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
from api.ollama_endpoints import router as ollama_router

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Add debug logging for available routes
@app.on_event("startup")
async def startup_event():
    logger.info("Available routes:")
    for route in app.routes:
        logger.info(f"  {route.path} [{','.join(route.methods)}]")

# Configure CORS for frontend - more permissive during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(ollama_router)

# Initialize OpenAI clients
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
cloud_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
local_client = AsyncOpenAI(
    base_url=f"{OLLAMA_BASE_URL}/v1",
    api_key="ollama"
)

class MetaPromptConfig(BaseModel):
    purpose: str
    instructions: List[str]
    sections: Optional[List[str]] = None
    variables: Optional[List[str]] = None

class PromptRequest(BaseModel):
    mode: str
    provider: str
    model: str
    input_text: str
    meta_prompt: Optional[MetaPromptConfig] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class PromptResponse(BaseModel):
    content: str
    usage: Optional[Dict[str, int]] = None
    error: Optional[str] = None

class ExpansionResult(BaseModel):
    """Result of expanding content based on meta prompt structure."""
    expanded_content: str = Field(description="The expanded content following the meta prompt structure")
    sections: Dict[str, str] = Field(description="Content organized by sections as specified in meta prompt")
    
    def to_response(self) -> PromptResponse:
        return PromptResponse(
            content=self.expanded_content,
            usage=None  # We'll add usage stats from the actual API response
        )

def create_system_prompt(mode: str, meta_prompt: Optional[MetaPromptConfig]) -> str:
    """Create a system prompt based on mode and meta prompt configuration."""
    base_prompt = f"You are an expert at {mode}. The current date is: {datetime.now().strftime('%Y-%m-%d')}"
    
    if meta_prompt:
        prompt_parts = [
            base_prompt,
            f"\nPurpose: {meta_prompt.purpose}",
            "\nInstructions:",
            *[f"- {instruction}" for instruction in meta_prompt.instructions],
        ]
        
        if meta_prompt.sections:
            prompt_parts.extend([
                "\nRequired Sections:",
                *[f"- {section}" for section in meta_prompt.sections]
            ])
            
        return "\n".join(prompt_parts)
    
    return base_prompt

def get_model(provider: str, model_name: str, temperature: float = 0.7, max_tokens: int = 1000) -> OpenAIModel:
    """Get the appropriate model based on provider and model name."""
    model_kwargs = {
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    if provider in ['openai', 'anthropic', 'google']:
        return OpenAIModel(model_name, openai_client=cloud_client, **model_kwargs)
    else:  # ollama or lmstudio
        return OpenAIModel(model_name, openai_client=local_client, **model_kwargs)

async def process_expansion(
    ctx: RunContext,
    input_text: str,
    meta_prompt: Optional[MetaPromptConfig] = None
) -> ExpansionResult:
    """Process an expansion request using pydantic-ai."""
    sections = {}
    
    if meta_prompt and meta_prompt.sections:
        for section in meta_prompt.sections:
            section_content = await ctx.model.complete(
                f"For the input: {input_text}\n\nGenerate content for the '{section}' section:"
            )
            sections[section] = section_content
    
    expanded_content = await ctx.model.complete(
        f"Expand the following content according to the given instructions:\n\n{input_text}"
    )
    
    return ExpansionResult(
        expanded_content=expanded_content,
        sections=sections
    )

@app.post("/api/prompt", response_model=PromptResponse)
async def process_prompt(request: PromptRequest) -> PromptResponse:
    """Process a prompt request using the specified LLM provider"""
    try:
        logger.info(f"Received request: {request}")
        model = get_model(
            request.provider, 
            request.model,
            temperature=request.temperature or 0.7,
            max_tokens=request.max_tokens or 1000
        )
        system_prompt = create_system_prompt(request.mode, request.meta_prompt)
        
        logger.info(f"Using model: {request.provider}/{request.model}")
        logger.info(f"System prompt: {system_prompt}")
        
        agent = Agent(
            model,
            system_prompt=system_prompt
        )
        
        if request.mode == "expansion":
            logger.info("Processing expansion request")
            result = await agent.run(
                process_expansion,
                input_text=request.input_text,
                meta_prompt=request.meta_prompt
            )
            logger.info(f"Expansion result: {result}")
            return result.to_response()
        else:
            # For other modes, use direct completion
            logger.info(f"Processing {request.mode} request")
            content = await agent.model.complete(request.input_text)
            logger.info(f"Response content: {content}")
            return PromptResponse(content=content)
            
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
