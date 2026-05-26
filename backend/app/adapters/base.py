from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.models.canonical import CanonicalProblem


@dataclass(slots=True)
class SourceEnvelope:
    source_name: str
    payload: dict


class SourceAdapter(Protocol):
    source_name: str

    def to_canonical(self, envelope: SourceEnvelope) -> CanonicalProblem:
        """Map an external source payload into the canonical Qtangl problem schema."""
