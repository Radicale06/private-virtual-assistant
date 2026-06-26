"""End-to-end processing of one inbound WhatsApp message.

router resolves tenant → (link / onboard / run) → if voice, transcribe → agent loop
→ reply (window-aware) → persist transcript + actions → compaction. Strictly scoped
to one agent throughout.
"""
from __future__ import annotations

from prisma import Prisma

from app.agent.compaction import maybe_compact
from app.agent.runtime import run_turn
from app.logging_config import get_logger
from app.services import message_service as msgs
from app.whatsapp import client as wa
from app.whatsapp import router
from app.whatsapp.webhook import InboundMessage

log = get_logger(__name__)


async def process_inbound(db: Prisma, msg: InboundMessage) -> None:
    phone = msg.from_phone
    route = await router.resolve(db, phone, msg.text)

    # Unknown sender  onboard. They just messaged us, so free-form is allowed.
    if route.onboarding:
        await wa.send_text(phone, router.onboarding_message())
        return

    # Just linked via QR token.
    if route.just_linked and route.agent is not None:
        await wa.send_text(phone, router.linked_message(route.agent.name))
        return

    agent = route.agent
    if agent is None:  # blocked or unresolved
        return

    # Resolve text (transcribe voice notes  converges into the same loop).
    if msg.type == "audio" and msg.media_url:
        from app.voice.transcribe import transcribe_voice_note

        try:
            text = await transcribe_voice_note(msg.media_url)
        except Exception as exc:
            log.warning("transcription_failed", error=str(exc))
            await msgs.reply(db, agent.id, phone, "Sorry, I couldn't understand that voice note.")
            return
    elif msg.text:
        text = msg.text
    else:
        return  # unsupported message type

    # Persist inbound (idempotent on wa_message_id).
    await msgs.log_inbound(db, agent.id, wa_message_id=msg.wa_message_id, text=text, mtype=msg.type)

    # Run the agent loop.
    user = await db.user.find_unique(where={"id": agent.user_id})
    tz = user.timezone if user else "UTC"
    turn = await run_turn(db, agent, tz, text)

    # Reply + record.
    await msgs.reply(db, agent.id, phone, turn.reply_text)
    await msgs.log_actions(db, agent.id, turn.actions)

    # Bound the context window.
    try:
        await maybe_compact(db, agent.id)
    except Exception as exc:  # compaction is best-effort
        log.warning("compaction_failed", error=str(exc))
