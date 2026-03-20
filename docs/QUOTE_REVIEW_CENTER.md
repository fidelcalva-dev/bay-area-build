# Quote Review Center

## Location

The Quote Review Center is embedded within the **Sales Quote Detail** page (`/sales/quotes/:id`).

## Capabilities

| Capability | Status |
|---|---|
| Preview quote summary | ✅ Inline on quote detail |
| Preview contract (MSA) | ✅ Via ContractsTab in Customer 360 |
| Preview addendum | ✅ Via ContractsTab in Customer 360 |
| Inspect pricing summary | ✅ Quote detail shows subtotal, range, size |
| Inspect material/size | ✅ material_type, selected_size_yards, recommended_size_yards |
| Inspect heavy-material warnings | ✅ Heavy material class displayed |
| Inspect delivery notes | ✅ delivery_date, time_window, driver_notes |
| Inspect placement notes | ✅ access_flags, placement_type, gate_code |
| Inspect readiness state | ✅ 7-point order readiness validation |
| Inspect terms/contract version | ✅ CONTRACT_VERSION, ADDENDUM_VERSION from policyLanguage.ts |

## Document Actions

| Action | Service | Edge Function |
|---|---|---|
| Generate PDF | PdfGenerationService | `generate-internal-pdf` |
| Preview PDF | DocumentPreviewService | Client-side HTML render |
| Send by Email | DocumentSendService | `send-outbound-quote` |
| Send by SMS | DocumentSendService | `send-outbound-quote` |
| Copy Secure Link | PortalAccessService | Portal URL generation |
| Upload Signed Copy | ContractService | `contractService.ts` upload |
| Resend | DocumentSendService | Re-invoke send function |

## Contract/Addendum Review

Via `contractService.ts` and `contractTemplates.ts`:
- `buildMSATerms()` — renders Master Service Agreement
- `buildAddendumTerms()` — renders Service Addendum (Residential/Contractor/Commercial)
- `getAddendumTemplateType()` — determines addendum type from customer data
- Version tracking via `CONTRACT_VERSION`, `ADDENDUM_VERSION`, `POLICY_VERSION`

## Send Center Integration

The Send Center is accessible from:
1. Quote Detail page — inline send actions
2. Customer 360 ContractsTab — contract/addendum send
3. Customer 360 DocumentsTab — document delivery actions
