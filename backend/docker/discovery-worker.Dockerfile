FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    crane \
    skopeo \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scanner-versions.lock .
COPY alembic ./alembic
COPY alembic.ini .

ENV QTANGL_ENV=production
ENV QTANGL_ALLOW_REGEX_FALLBACK=false
ENV QTANGL_SCANNER_SANDBOX=1

# OSS engines installed at build time via vendor script (pinned in scanner-versions.lock)
RUN mkdir -p /opt/qtangl/scanners

CMD ["python", "-m", "app.worker"]
