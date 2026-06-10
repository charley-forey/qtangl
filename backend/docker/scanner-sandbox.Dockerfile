FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -r -s /bin/false scanner

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scanner-versions.lock .

RUN mkdir -p /opt/qtangl/scanners && chown -R scanner:scanner /app /opt/qtangl

USER scanner
ENV QTANGL_SCANNER_SANDBOX=1
ENV QTANGL_SCANNER_NO_NETWORK=1
ENV QTANGL_ENV=production
ENV QTANGL_ALLOW_REGEX_FALLBACK=false
ENV HOME=/tmp

ENTRYPOINT ["python", "-c", "from app.discovery.orchestrator import run_sandbox_cli; run_sandbox_cli()"]
