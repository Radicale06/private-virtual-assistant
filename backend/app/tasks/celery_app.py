"""Celery application + beat schedule.

The durable `jobs` table is the source of truth for reminders/briefings. Beat runs a
poller every minute so nothing is lost if a worker restarts.
"""
from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "pva",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.inbound", "app.tasks.reminders", "app.tasks.briefings"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    worker_max_tasks_per_child=200,
)

celery_app.conf.beat_schedule = {
    "poll-due-jobs-every-minute": {
        "task": "app.tasks.reminders.poll_due_jobs",
        "schedule": 60.0,
    },
    "dispatch-morning-briefings": {
        "task": "app.tasks.briefings.dispatch_briefings",
        "schedule": crontab(minute="*/15"),  # check every 15 min, fire at each user's time
    },
}
