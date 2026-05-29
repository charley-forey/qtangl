# EV fleet QPU calibration notes

Fixture replay uses a cached distribution from `qpu_trace.json` for production-safe demos.
Live QAOA runs require `QTANGL_ENABLE_QAOA=true` and stay within `QTANGL_EVFLEET_QAOA_MAX_VARIABLES`.
