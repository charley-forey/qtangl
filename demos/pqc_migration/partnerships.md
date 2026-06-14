# Qtangl partnership targets (E5)

## MSSPs and auditors

| Partner type | Value exchange | Next step |
|--------------|----------------|-----------|
| Regional MSSP | White-label Monitor scans for clients | Offer pilot rev-share SOW |
| Big 4 / boutique audit | Verify link + evidence ZIP in audit packs | Send sample CBOM + signed PDF |
| OQS ecosystem | Scanner credibility, algorithm references | List on OQS adopters page |

**MSSP target list (70 partners):** [outreach/mssp-partner-target-list.md](./outreach/mssp-partner-target-list.md) · [CSV](./outreach/mssp-partner-target-list.csv)  
**P1 partner contacts (15):** [outreach/mssp-partner-contacts-p1.md](./outreach/mssp-partner-contacts-p1.md) · [CSV](./outreach/mssp-partner-contacts-p1.csv)

## Cloud and PKI

| Vendor | Integration | Status |
|--------|-------------|--------|
| AWS ACM | JSON import + scheduled pull | Import via upload; schedule `cloudImportPayload` |
| Azure Key Vault | JSON import | Via `parse_cloud_inventory` |
| Kubernetes | TLS secret list JSON | Via upload-bundle |

## Channel

- **Stripe self-serve** — `/access` Monitor checkout when keys configured
- **Manual provision** — `POST /public/monitor-provision` for invoice pilots

## SIEM / GRC

- Webhook v2 payload on scan complete (Slack, generic HTTPS)
- Splunk/Sentinel: use webhook + field mapping doc in `backend/docs/WEBHOOK_V2.md`

## Contact

partnerships@qtangl.com (alias to hello@qtangl.com until dedicated inbox)
