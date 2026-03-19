# RBAC / PERMISSIONS AUDIT

> Generated: 2026-03-19

## Auth Guard Summary

| Area | Guard Type | Notes |
|------|-----------|-------|
| `/admin/*` | AdminLayout → useAdminAuth | Checks user + canAccessAdmin() |
| `/sales/*` | SalesLayout | Role-based auth |
| `/cs/*` | CSLayout | Role-based auth |
| `/dispatch/*` | DispatchLayout | Role-based auth |
| `/driver/*` | DriverLayout | Role-based auth |
| `/finance/*` | FinanceLayout | Role-based auth |
| `/portal/dashboard,orders,documents,order/*,orders/*,payment-complete` | PortalAuthGuard | SMS OTP auth |
| `/portal/quote/:id,schedule,pay,sign-quote-contract,activate` | None (SMS link) | Token-based access |
| `/contract/:token` | None (token) | Token-based access |
| `/internal/calculator` | None visible in router | ⚠️ Needs verification |
| `/ops/calculator`, `/sales/calculator`, etc. | None visible in router | ⚠️ Aliases — check component-level auth |

---

## Route-Level Protection Status

### Public (No auth required) — CORRECT
| Route Pattern | Count |
|--------------|-------|
| `/` and all marketing pages | ~70 |
| `/quote/*` | 4 |
| `/blog/*` | 2 |
| SEO engine pages | ~500+ dynamic |
| `/staff`, `/admin/login`, `/set-password` | 3 |

### Protected — Admin Layout Guard
All `/admin/*` routes (155) are wrapped in AdminLayout which checks:
1. User is authenticated
2. User passes `canAccessAdmin()` role check
3. Redirects to `/admin/login` if no user
4. Redirects to `/app` if no admin access

### Protected — Department Layouts
| Portal | Layout Guard | Role |
|--------|-------------|------|
| `/sales/*` | SalesLayout | sales |
| `/cs/*` | CSLayout | cs |
| `/dispatch/*` | DispatchLayout | dispatch |
| `/driver/*` | DriverLayout | driver |
| `/finance/*` | FinanceLayout | finance |

### Protected — Portal Auth Guard
| Route | Guard | Auth Type |
|-------|-------|-----------|
| `/portal/dashboard` | PortalAuthGuard | SMS OTP |
| `/portal/orders` | PortalAuthGuard | SMS OTP |
| `/portal/documents` | PortalAuthGuard | SMS OTP |
| `/portal/order/:orderId` | PortalAuthGuard | SMS OTP |
| `/portal/orders/:orderId` | PortalAuthGuard | SMS OTP |
| `/portal/payment-complete` | PortalAuthGuard | SMS OTP |

### Unprotected but Sensitive — REVIEW NEEDED

| Route | Risk | Notes |
|-------|------|-------|
| `/internal/calculator` | 🟡 Medium | No visible router-level guard — may have component-level auth |
| `/ops/calculator` | 🟡 Medium | Same concern |
| `/portal/quote/:quoteId` | 🟢 Low | Intentionally open for SMS links, but quote data exposed |
| `/portal/pay` | 🟢 Low | Intentionally open for SMS payment links |
| `/portal/sign-quote-contract` | 🟢 Low | Intentionally open for signing |
| `/contract/:token` | 🟢 Low | Token-based — secure if tokens are unguessable |
| `/green-halo/portal/*` | 🟢 Low | Demo — no real data |

---

## robots.txt Coverage
All protected routes are correctly blocked in robots.txt:
- `/admin/`, `/portal/`, `/sales/`, `/cs/`, `/dispatch/`, `/driver/`, `/finance/`, `/internal/`, `/staff`, `/login`, `/set-password`
