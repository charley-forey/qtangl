FROM python:3.12-slim-bookworm

RUN useradd -r -s /bin/false scanner
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scanner-versions.lock .

USER scanner
ENV QTANGL_SCANNER_SANDBOX=1
ENV QTANGL_SCANNER_NO_NETWORK=1

ENTRYPOINT ["python", "-m", "app.discovery.code_orchestrator"]
