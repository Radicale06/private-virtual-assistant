.PHONY: install generate push dev worker beat admin lint

install:
	pip install -r requirements.txt

generate:
	prisma generate

push:
	prisma db push

dev:
	uvicorn app.main:app --reload

worker:
	celery -A app.tasks.celery_app.celery_app worker --loglevel=info

beat:
	celery -A app.tasks.celery_app.celery_app beat --loglevel=info

admin:
	python -m scripts.create_admin $(EMAIL) $(PASSWORD)
