# Admin Activation Hub Specification

> Last updated: 2026-03-30

## Location

`/admin/configuration` — the visual Admin Activation Hub

## Module Groups

### Core CRM
| Module | Route | Owner | Status |
|---|---|---|---|
| Customer 360 | `/admin/customers/:id` | Sales/CS | ✅ Active |
| Customers List | `/admin/customers` | Sales/CS | ✅ Active |
| Orders | `/admin/orders` | CS/Dispatch | ✅ Active |
| Tickets | `/admin/tickets` | CS | ✅ Active |

### Pricing
| Module | Route | Owner | Status |
|---|---|---|---|
| Master Pricing Hub | `/admin/pricing` | Admin | ✅ Active |
| Extras Catalog | `/admin/extras` | Admin | ✅ Active |
| Vendors | `/admin/vendors` | Admin | ✅ Active |

### Leads / Sales
| Module | Route | Owner | Status |
|---|---|---|---|
| Lead Hub | `/sales/leads` | Sales | ✅ Active |
| Internal Calculator | `/sales/quotes/new` | Sales | ✅ Active |
| Lead Engine Settings | `/admin/leads/settings` | Admin | ✅ Active |
| Sales Performance | `/admin/dashboards/sales` | Admin | ✅ Active |

### Operations
| Module | Route | Owner | Status |
|---|---|---|---|
| Dispatch | `/dispatch` | Dispatch | ✅ Active |
| Control Tower | `/dispatch/control-tower` | Dispatch | ✅ Active |
| Driver App | `/driver` | Driver | ✅ Active |
| Yards | `/admin/yards` | Admin | ✅ Active |
| Markets | `/admin/markets` | Admin | ✅ Active |
| Zones | `/admin/zones` | Admin | ✅ Active |
| Inventory | `/admin/inventory` | Admin | ✅ Active |
| Assets | `/admin/assets` | Admin | ✅ Active |
| Facilities | `/admin/facilities` | Admin | ✅ Active |

### Finance
| Module | Route | Owner | Status |
|---|---|---|---|
| Finance Dashboard | `/finance` | Finance | ✅ Active |
| AR Aging | `/finance/ar-aging` | Finance | ✅ Active |
| Overdue Billing | `/admin/overdue` | Finance | ✅ Active |
| Compensation | `/admin/compensation` | Admin | ✅ Active |

### Integrations
| Module | Route | Owner | Status |
|---|---|---|---|
| GHL Integration | `/admin/ghl` | Admin | ✅ Active |
| Google Settings | `/admin/google` | Admin | ✅ Active |
| Messaging | `/admin/messaging` | Admin | ✅ Active |
| Notifications Config | `/admin/notifications-config` | Admin | ✅ Active |

### SEO / Local
| Module | Route | Owner | Status |
|---|---|---|---|
| SEO Dashboard | `/admin/seo/dashboard` | Admin | ✅ Active |
| SEO Health | `/admin/seo/health` | Admin | ✅ Active |
| Local Search | `/admin/local` | Admin | ✅ Active |

### QA / Health
| Module | Route | Owner | Status |
|---|---|---|---|
| QA Control Center | `/admin/qa/control-center` | Admin | ✅ Active |
| Config Health | `/admin/config/health` | Admin | ✅ Active |
| Security Health | `/admin/security` | Admin | ✅ Active |
| Build Health | `/admin/qa/build` | Admin | ✅ Active |
| Route Health | `/admin/qa/routes` | Admin | ✅ Active |

### AI / Automations
| Module | Route | Owner | Status |
|---|---|---|---|
| AI Control Center | `/admin/ai` | Admin | ✅ Active |
| AI Performance | `/admin/ai-performance` | Admin | ✅ Active |
| AI Chat | `/admin/ai-chat` | Admin | ✅ Active |

### Legal / Documents
| Module | Route | Owner | Status |
|---|---|---|---|
| Contracts Config | `/admin/contracts-config` | Admin | ✅ Active |
| Internal Docs | `/admin/docs` | Admin | ✅ Active |
| Approval Queue | `/admin/approval-queue` | Admin | ✅ Active |

## Module Card Requirements

Each module card shows:
- Module name
- Canonical route
- Active/inactive status badge
- Health status indicator
- Owner role
- Last update timestamp
- Quick navigation action
