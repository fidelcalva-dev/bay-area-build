# Contact Form Reliability

> Last updated: 2026-03-31

## Contact Forms

| Form | Route | Brand | Handler | Reliability |
|---|---|---|---|---|
| Main Contact | `/contact-us` | CALSAN_DUMPSTERS_PRO | `lead-ingest` | ✅ Reliable |
| Cleanup Contact | `/cleanup/contact` | CALSAN_CD_WASTE_REMOVAL | `lead-ingest` | ✅ Reliable |

## Error Handling

Both forms:
- Show toast on success/failure
- Catch and log errors to console
- Display user-friendly error messages
- Reset form on success

## Lead Hub Visibility

- **Tab**: "Contact Form" (`source_channel IN ('CONTACT_FORM', 'CLEANUP_CONTACT', 'CALLBACK_REQUEST', 'CLICK_TO_CALL', 'CLICK_TO_TEXT')`)
- **Source Labels**: "Contact Form", "Cleanup Contact", "Callback"

## Failsafe

`lead-ingest` has a built-in failsafe: if the main processing fails, the payload is written to `lead_fallback_queue` so no lead is ever lost.
