"""Voice note -> text. Downloads the Twilio media URL then transcribes via the LLM.

Voice and text converge into the SAME agent loop; transcription is just preprocessing.
"""
from __future__ import annotations

from app.llm.factory import get_llm_client
from app.whatsapp.media import download_media


async def transcribe_voice_note(media_url: str) -> str:
    audio = await download_media(media_url)
    llm = get_llm_client()
    return await llm.transcribe(audio, filename="voice.ogg")
