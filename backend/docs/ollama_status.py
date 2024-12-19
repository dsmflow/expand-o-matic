from __future__ import annotations

import asyncio
import os
from datetime import datetime
from enum import Enum
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')

class OllamaStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    LOADING = "loading"

class OllamaHealthResponse(BaseModel):
    status: OllamaStatus
    last_checked: datetime
    models: list[str] = []
    error: str | None = None

async def check_ollama_health(base_url: str = OLLAMA_BASE_URL) -> OllamaHealthResponse:
    """Check if Ollama is available and get list of available models."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            tags_response = await client.get(f"{base_url}/api/tags")
            
            if tags_response.status_code != 200:
                return OllamaHealthResponse(
                    status=OllamaStatus.UNAVAILABLE,
                    last_checked=datetime.now(),
                    error="Ollama service is not responding correctly"
                )
            
            models_data = tags_response.json()
            # Clean up model names by removing ":latest" suffix
            models = []
            if "models" in models_data:
                for model in models_data["models"]:
                    name = model["name"]
                    if name.endswith(":latest"):
                        name = name[:-7]  # Remove ":latest"
                    models.append(name)
            models.sort()  # Sort alphabetically
            
            return OllamaHealthResponse(
                status=OllamaStatus.AVAILABLE,
                last_checked=datetime.now(),
                models=models
            )
            
    except Exception as e:
        return OllamaHealthResponse(
            status=OllamaStatus.UNAVAILABLE,
            last_checked=datetime.now(),
            error=str(e)
        )

async def monitor_ollama_status(callback=None, interval_seconds: int = 30):
    """Continuously monitor Ollama status and call the callback function with updates."""
    while True:
        status = await check_ollama_health()
        if callback:
            await callback(status)
        await asyncio.sleep(interval_seconds)

async def main():
    async def status_callback(status: OllamaHealthResponse):
        print(f"Ollama Status: {status.status}")
        if status.models:
            print(f"Available models: {', '.join(status.models)}")
        if status.error:
            print(f"Error: {status.error}")
    
    await monitor_ollama_status(status_callback, interval_seconds=10)

if __name__ == "__main__":
    asyncio.run(main())
