# Privacy Notice at Collection

> Last updated: 2026-03-31

## Component

**`PrivacyNoticeAtCollection`** (`src/components/legal/PrivacyNoticeAtCollection.tsx`)

Reusable component that displays a CCPA/CPRA-compliant notice at or before the point of personal information collection.

## Variants

| Variant | Use Case |
|---|---|
| `compact` | Inline single-paragraph for forms (default) |
| `full` | Bordered card with bullet points for standalone sections |

## Placement

| Page | Location | Status |
|---|---|---|
| `/quote` (V3QuoteFlow) | Contact step, before submit | ✅ |
| `/contact-us` | Before submit button | ✅ |
| `/cleanup/contact` | Before submit button | ✅ |
| `/contractor-application` | Before submit button | ✅ |

## Content

- Categories: Name, phone, email, address, project details, device/browser analytics
- Purposes: Quotes, service delivery, communication, analytics, legal compliance
- Retention: Active account/project duration + legal requirements
- Links: Privacy Policy (`/privacy`)
