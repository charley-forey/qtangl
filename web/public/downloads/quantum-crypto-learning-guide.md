# Quantum Cryptography Learning Guide

A four-week curriculum from Shor's algorithm through post-quantum migration — with **on-site video companions** (embedded YouTube), **NIST references**, and **action checkpoints**.

Download companion: use alongside [/blog/learning-quantum-crypto-4-week-path](/blog/learning-quantum-crypto-4-week-path), the [/learn/quantum-crypto](/learn/quantum-crypto) curriculum hub, and [/learn/quantum-crypto/guide](/learn/quantum-crypto/guide) printable guide.

---

## Week 1 — The threat (Shor's and Grover's)

| Resource | Type | Link |
|----------|------|------|
| minutephysics — Shor's algorithm | Video + companion | [YouTube](https://www.youtube.com/watch?v=lvTqbM5Dq4Q) · [/blog/video-companion-shors-algorithm-minutephysics](/blog/video-companion-shors-algorithm-minutephysics) |
| Veritasium — quantum power & PQC | Video + companion | [YouTube](https://www.youtube.com/watch?v=-UrdExQW0cs) · [/blog/video-companion-quantum-power-veritasium](/blog/video-companion-quantum-power-veritasium) |
| PBS Infinite Series — period-finding | Video + companion | [YouTube](https://www.youtube.com/watch?v=wUwZZaI5u0c) · [/blog/video-companion-pbs-shor-period-finding](/blog/video-companion-pbs-shor-period-finding) |
| Peter Shor interview | Video + companion | [YouTube](https://www.youtube.com/watch?v=hOlOY7NyMfs) · [/blog/video-companion-physics-world-shor](/blog/video-companion-physics-world-shor) |
| Shor's for CISOs | Article | [/blog/shors-algorithm-explained-for-cisos](/blog/shors-algorithm-explained-for-cisos) |
| Grover's and AES | Article | [/blog/grovers-algorithm-and-aes](/blog/grovers-algorithm-and-aes) |
| NIST PQC overview | Official | [nist.gov/pqc](https://www.nist.gov/pqc) |
| PostQuantum.com Shor's article | Article | [postquantum.com](https://postquantum.com/post-quantum/shors-algorithm-a-quantum-threat/) |

**Checkpoint:** Explain why RSA breaks but AES-256 mostly survives.

---

## Week 2 — HNDL urgency (Mosca inequality)

| Resource | Type | Link |
|----------|------|------|
| Jeremy Allison on HNDL | Video + companion | [YouTube](https://www.youtube.com/watch?v=u4mVljNQnBw) · [/blog/video-companion-hndl-jeremy-allison](/blog/video-companion-hndl-jeremy-allison) |
| Michele Mosca public lecture | Video + companion | [YouTube](https://www.youtube.com/watch?v=vWP4LF2hz80) · [/blog/video-companion-mosca-intel-quantum-security](/blog/video-companion-mosca-intel-quantum-security) |
| Mosca worked examples | Article | [/blog/mosca-inequality-worked-examples](/blog/mosca-inequality-worked-examples) |
| HNDL collection vectors | Article | [/blog/hndl-collection-vectors-deep-dive](/blog/hndl-collection-vectors-deep-dive) |
| GRI Mosca report | Report | [globalriskinstitute.org](https://globalriskinstitute.org/publications/quantum-threat-timeline-report-2023/) |
| HNDL hub + calculator | Interactive | [/q-day/hndl](/q-day/hndl) · [/q-day/mosca-inequality](/q-day/mosca-inequality) |

**Checkpoint:** Apply X + Y > Z to one data class from your retention policy.

---

## Week 3 — NIST standards (FIPS 203–205)

| Resource | Type | Link |
|----------|------|------|
| NIST PQC algorithms overview | Video + companion | [YouTube](https://www.youtube.com/watch?v=3lCLvfv-XoY) · [/blog/video-companion-pq-algorithms-nist](/blog/video-companion-pq-algorithms-nist) |
| Alfred Menezes ML-KEM/ML-DSA | Video + companion | [YouTube](https://www.youtube.com/watch?v=9NKm84vKALc) · [/blog/video-companion-kyber-dilithium-menezes](/blog/video-companion-kyber-dilithium-menezes) |
| RWPQC 2026 NIST update | Video + companion | [YouTube](https://www.youtube.com/watch?v=pbPoUE7MmQw) · [/blog/video-companion-nist-pqc-update-rwpqc-2026](/blog/video-companion-nist-pqc-update-rwpqc-2026) |
| FIPS 203–205 primer | Article | [/blog/nist-fips-203-204-205-primer](/blog/nist-fips-203-204-205-primer) |
| FIPS 203 ML-KEM | Standard | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/fips/203/final) |
| FIPS 204 ML-DSA | Standard | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/fips/204/final) |
| FIPS 205 SLH-DSA | Standard | [csrc.nist.gov](https://csrc.nist.gov/publications/detail/fips/205/final) |
| ML-KEM framework guide | Guide | [/q-day/frameworks/ml-kem](/q-day/frameworks/ml-kem) |

**Checkpoint:** Name ML-KEM, ML-DSA, and SLH-DSA and what each replaces.

---

## Week 4 — Migration in practice

| Resource | Type | Link |
|----------|------|------|
| Dustin Moody 12-month strategy | Video + companion | [YouTube](https://www.youtube.com/watch?v=-_QiWSTud7I) · [/blog/video-companion-dustin-moody-nist-strategy](/blog/video-companion-dustin-moody-nist-strategy) |
| CISA PQC transition panel | Video + companion | [YouTube](https://www.youtube.com/watch?v=z85LaInxjrg) · [/blog/video-companion-cisa-quantum-readiness](/blog/video-companion-cisa-quantum-readiness) |
| Open Quantum Safe hands-on | Video + companion | [/blog/video-companion-open-quantum-safe-liboqs](/blog/video-companion-open-quantum-safe-liboqs) |
| Migration phases | Article | [/blog/pqc-migration-phases-explained](/blog/pqc-migration-phases-explained) |
| Hybrid TLS guide | Article | [/blog/hybrid-tls-migration-guide](/blog/hybrid-tls-migration-guide) |
| Attack surface map | Article | [/blog/crypto-attack-surface-map](/blog/crypto-attack-surface-map) |
| QKD vs PQC | Article | [/blog/qkd-vs-post-quantum-cryptography](/blog/qkd-vs-post-quantum-cryptography) |
| NIST IR 8547 | Standard | [csrc.nist.gov](https://csrc.nist.gov/pubs/ir/8547/final) |
| CISA quantum readiness | Policy | [cisa.gov](https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography) |
| Open Quantum Safe | Hands-on | [openquantumsafe.org](https://openquantumsafe.org/) |

**Checkpoint:** Describe hybrid TLS and list three non-HTTPS crypto locations in your estate.

---

## Full video companion index (15 articles with embeds)

1. [/blog/video-companion-q-day-explained](/blog/video-companion-q-day-explained)
2. [/blog/video-companion-hndl-jeremy-allison](/blog/video-companion-hndl-jeremy-allison)
3. [/blog/video-companion-pq-algorithms-nist](/blog/video-companion-pq-algorithms-nist)
4. [/blog/video-companion-shors-algorithm-minutephysics](/blog/video-companion-shors-algorithm-minutephysics)
5. [/blog/video-companion-quantum-power-veritasium](/blog/video-companion-quantum-power-veritasium)
6. [/blog/video-companion-pbs-shor-period-finding](/blog/video-companion-pbs-shor-period-finding)
7. [/blog/video-companion-physics-world-shor](/blog/video-companion-physics-world-shor)
8. [/blog/video-companion-dustin-moody-nist-strategy](/blog/video-companion-dustin-moody-nist-strategy)
9. [/blog/video-companion-nist-pqc-update-rwpqc-2026](/blog/video-companion-nist-pqc-update-rwpqc-2026)
10. [/blog/video-companion-mosca-intel-quantum-security](/blog/video-companion-mosca-intel-quantum-security)
11. [/blog/video-companion-root-causes-moody-pqc](/blog/video-companion-root-causes-moody-pqc)
12. [/blog/video-companion-cloudflare-pq-roadmap](/blog/video-companion-cloudflare-pq-roadmap)
13. [/blog/video-companion-cisa-quantum-readiness](/blog/video-companion-cisa-quantum-readiness)
14. [/blog/video-companion-kyber-dilithium-menezes](/blog/video-companion-kyber-dilithium-menezes)
15. [/blog/video-companion-open-quantum-safe-liboqs](/blog/video-companion-open-quantum-safe-liboqs)

---

## Next step

Run a baseline cryptographic inventory: [/assess/mini](/assess/mini)

Sources last verified: 2026-06-21
