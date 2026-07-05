FROM python:3.13-slim

WORKDIR /app

# Build toolchain for liboqs. `liboqs-dev` is not packaged in Debian trixie
# (the base for python:3.13-slim), so the shared library is built from source.
# git + libssl-dev are required by the liboqs CMake build; ca-certificates lets
# the HTTPS clone succeed.
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake build-essential git ca-certificates libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Build and install liboqs as a shared library so the liboqs-python wrapper can
# load it at runtime. Pin via build arg; defaults to upstream main.
ARG LIBOQS_VERSION=main
RUN git clone --depth=1 --branch "${LIBOQS_VERSION}" \
        https://github.com/open-quantum-safe/liboqs.git /tmp/liboqs \
    && cmake -S /tmp/liboqs -B /tmp/liboqs/build \
        -DBUILD_SHARED_LIBS=ON \
        -DOQS_BUILD_ONLY_LIB=ON \
        -DCMAKE_BUILD_TYPE=Release \
        -DCMAKE_INSTALL_PREFIX=/usr/local \
    && cmake --build /tmp/liboqs/build --parallel \
    && cmake --install /tmp/liboqs/build \
    && ldconfig \
    && rm -rf /tmp/liboqs

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# PQC signing via the official Open Quantum Safe Python wrapper (loads the
# system liboqs installed above). ML-DSA-65 is the default primary algorithm and
# is verified strictly; SLH-DSA (FIPS 205) is optional/non-default, so its
# availability is reported without failing the build.
RUN pip install --no-cache-dir liboqs-python \
    && python -c "import oqs; sigs=set(oqs.get_enabled_sig_mechanisms()); oqs.Signature('ML-DSA-65'); print('liboqs-python PQC ready | ML-DSA-65 OK | SLH-DSA', 'OK' if 'SLH_DSA_PURE_SHA2_128S' in sigs else 'unavailable')"

COPY app ./app
COPY scripts ./scripts
COPY alembic ./alembic
COPY alembic.ini .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head || echo 'WARN: alembic upgrade failed — starting API with schema patches'; exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
