# Document Delivery Matrix

## Document Types

| Document | Generate | Preview | PDF | Email | SMS | Sign | Customer 360 |
|---|---|---|---|---|---|---|---|
| Quote | ✅ save-quote | ✅ inline | ✅ generate-internal-pdf | ✅ send-outbound-quote | ✅ send-outbound-quote | N/A | ✅ QuotesTab |
| MSA Contract | ✅ contractService | ✅ buildMSATerms | ✅ generate-internal-pdf | ✅ send-contract | ✅ send-contract | ✅ /contract/:token | ✅ ContractsTab |
| Addendum | ✅ contractService | ✅ buildAddendumTerms | ✅ generate-internal-pdf | ✅ send-contract | ✅ send-contract | ✅ /contract/:token | ✅ ContractsTab |
| Invoice | ✅ invoices table | ✅ inline | ✅ generate-internal-pdf | ✅ send-payment-request | N/A | N/A | ✅ PaymentsTab |
| Payment Receipt | N/A | ✅ inline | ✅ send-payment-receipt | ✅ send-payment-receipt | ✅ send-payment-receipt | N/A | ✅ PaymentsTab |

## Canonical Services

| Service | File | Purpose |
|---|---|---|
| ContractService | `src/lib/contractService.ts` | Create/check/update contracts and addenda |
| ContractTemplates | `src/lib/contractTemplates.ts` | Build MSA and addendum terms HTML |
| MergeTagResolver | `src/lib/mergeTagResolver.ts` | Resolve template merge tags |
| PolicyLanguage | `src/lib/policyLanguage.ts` | Version-controlled legal text |
| AuditLog | `src/lib/auditLog.ts` | Document delivery audit trail |

## Edge Functions

| Function | Purpose |
|---|---|
| `generate-internal-pdf` | Server-side PDF generation |
| `send-outbound-quote` | Quote delivery (email/SMS) |
| `send-contract` | Contract/addendum delivery |
| `send-quote-contract` | Combined quote+contract delivery |
| `send-quote-summary` | Post-submission summary to customer |
| `send-payment-request` | Payment link delivery |
| `send-payment-receipt` | Payment confirmation |

## Signed Document Visibility

Signed documents appear in:
1. **Customer 360 ContractsTab** — primary view with signer metadata
2. **Customer 360 DocumentsTab** — unified document list with signed status
3. **Portal** — customer-facing document access
4. **document_acceptances** table — granular acceptance log
5. **document_delivery_audit_ledger** — delivery tracking

## No Dead-End Policy

- Every document action has a fallback (Generate PDF button, printable link)
- "PDF not available yet" states are replaced with Generate action
- Upload Signed action auto-updates contract status
