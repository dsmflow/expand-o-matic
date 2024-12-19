from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from docs.ollama_status import check_ollama_health
import httpx
import logging

router = APIRouter(prefix="/api/ollama")
logger = logging.getLogger(__name__)

class GenerateRequest(BaseModel):
    mode: str
    provider: str
    model: str
    input_text: str
    meta_prompt: Optional[Dict[str, Any]] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class GenerateResponse(BaseModel):
    content: str
    error: Optional[str] = None

@router.get("/status")
async def get_ollama_status():
    """Get the current status of the Ollama service."""
    try:
        status = await check_ollama_health()
        return {
            "status": status.status,
            "lastChecked": status.last_checked.isoformat(),
            "models": status.models,
            "error": status.error
        }
    except Exception as e:
        logger.error(f"Error checking Ollama status: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/generate")
async def generate_text(request: GenerateRequest) -> GenerateResponse:
    """Generate text using Ollama model."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Prepare the Ollama request
            ollama_request = {
                "model": request.model,
                "prompt": request.input_text,
                "stream": False,
                "options": {
                    "temperature": request.temperature,
                }
            }

            # If meta prompt is provided, format the prompt accordingly
            if request.meta_prompt:
                formatted_prompt = f"""<purpose>
{request.meta_prompt.get('purpose', '')}
</purpose>

<instructions>
{chr(10).join(request.meta_prompt.get('instructions', []))}
</instructions>

<input>
{request.input_text}
</input>"""
                ollama_request["prompt"] = formatted_prompt

            logger.info(f"Sending request to Ollama: {ollama_request}")
            response = await client.post(
                "http://localhost:11434/api/generate",
                json=ollama_request
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Ollama API error: {response.text}"
                )
            
            result = response.json()
            return GenerateResponse(content=result.get("response", ""))

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to Ollama timed out"
        )
    except Exception as e:
        logger.error(f"Error generating text with Ollama: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating text: {str(e)}"
        )
