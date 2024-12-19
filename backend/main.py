from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import os
from dotenv import load_dotenv
from models import (
    PromptRequest, PromptResponse, LLMProvider,
    ExpansionPrompt, CompressionPrompt
)
import openai
import anthropic
import google.generativeai as genai
import requests

load_dotenv()

app = FastAPI()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure API clients
openai.api_key = os.getenv("OPENAI_API_KEY")
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class LLMFactory:
    @staticmethod
    def create_prompt(mode: str, meta_prompt: Dict[str, Any]) -> str:
        if not meta_prompt:
            return ""
            
        prompt_parts = [
            f"Purpose: {meta_prompt['purpose']}",
            "\nInstructions:",
            *[f"- {instruction}" for instruction in meta_prompt['instructions']],
        ]
        
        if meta_prompt.get('sections'):
            prompt_parts.extend([
                "\nRequired Sections:",
                *[f"- {section}" for section in meta_prompt['sections']]
            ])
            
        return "\n".join(prompt_parts)

    @staticmethod
    async def get_completion(request: PromptRequest) -> PromptResponse:
        system_prompt = LLMFactory.create_prompt(request.mode, request.meta_prompt.dict() if request.meta_prompt else None)
        
        try:
            if request.provider == LLMProvider.OPENAI:
                response = await openai.ChatCompletion.acreate(
                    model=request.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.input_text}
                    ],
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                )
                return PromptResponse(
                    content=response.choices[0].message.content,
                    usage=response.usage
                )

            elif request.provider == LLMProvider.ANTHROPIC:
                response = await anthropic_client.messages.create(
                    model=request.model,
                    system=system_prompt,
                    messages=[{"role": "user", "content": request.input_text}],
                    max_tokens=request.max_tokens,
                    temperature=request.temperature
                )
                return PromptResponse(
                    content=response.content[0].text,
                    usage={"total_tokens": response.usage.total_tokens}
                )

            elif request.provider == LLMProvider.GOOGLE:
                model = genai.GenerativeModel(request.model)
                response = await model.generate_content(
                    f"{system_prompt}\n\n{request.input_text}",
                    generation_config=genai.types.GenerationConfig(
                        temperature=request.temperature,
                        max_output_tokens=request.max_tokens
                    )
                )
                return PromptResponse(
                    content=response.text,
                    usage=None  # Google doesn't provide token usage
                )

            elif request.provider == LLMProvider.OLLAMA:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": request.model,
                        "prompt": f"{system_prompt}\n\n{request.input_text}",
                        "temperature": request.temperature,
                    }
                )
                return PromptResponse(
                    content=response.json()["response"],
                    usage=None
                )

            elif request.provider == LLMProvider.LMSTUDIO:
                response = requests.post(
                    "http://localhost:1234/v1/chat/completions",
                    json={
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": request.input_text}
                        ],
                        "temperature": request.temperature,
                        "max_tokens": request.max_tokens
                    }
                )
                return PromptResponse(
                    content=response.json()["choices"][0]["message"]["content"],
                    usage=response.json().get("usage")
                )

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/prompt", response_model=PromptResponse)
async def process_prompt(request: PromptRequest) -> PromptResponse:
    """Process a prompt request using the specified LLM provider"""
    return await LLMFactory.get_completion(request)
