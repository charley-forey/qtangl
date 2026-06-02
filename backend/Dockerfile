FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

EXPOSE 8000

# Run migrations when possible; always start API (init_db also applies column patches).
CMD ["sh", "-c", "alembic upgrade head || echo 'WARN: alembic upgrade failed — starting API with schema patches'; exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
