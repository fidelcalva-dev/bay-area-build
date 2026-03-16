# Calsan OS Implementation Plan

## Current Phase: Sprint 1 — Revenue Protection & Quote Reliability

### Completed
- [x] Master System Audit (docs/MASTER_SYSTEM_AUDIT.md) — 350+ routes audited
- [x] Off-strategy pages noindexed (Technology, GreenHalo, GreenImpact, SoCal/Central Valley hubs)
- [x] Homepage CTAs verified (/quote, /waste-vision, /schedule-delivery, /contractor-application)
- [x] AI Project Estimator deployed with DB-backed templates (16 project types)
- [x] Heavy material constraint (5/8/10 yd) enforced in estimator
- [x] Bilingual support (EN/ES) in AI assistant

### Sprint 1 Remaining
- [ ] Verify quote flow end-to-end persistence (size, material, date, window, notes)
- [ ] Verify lead-ingest fires at all 4 progressive milestones
- [ ] Verify PDF generation has no dead states
- [ ] Audit /quick-order for redundancy with /quote

### Sprint 2: Sales & Document Workflow
- [ ] Verify /sales/quotes/new opens full calculator by default
- [ ] Verify quote preview/PDF/send
- [ ] Verify contract sign → Customer 360 visibility
- [ ] Verify negotiated price range controls
- [ ] Verify commercial account tier → discount

### Sprint 3: Customer 360 & Identity
- [ ] Verify all 12 tabs populated
- [ ] Verify Documents tab completeness
- [ ] Verify identity merge review UI
- [ ] Verify Customer Health Score

### Sprint 4: Dispatch & Driver Ops
- [ ] Verify placement marking → logistics verification → driver
- [ ] Verify driver checkpoint workflow
- [ ] Verify extras reporting → billing
- [ ] Mobile UX pass

### Sprint 5: Finance & Collections
- [ ] Invoice generation from orders
- [ ] Payment link flow
- [ ] AR aging accuracy
- [ ] Mobile UX pass

### Sprint 6: SEO & QA Consolidation
- [ ] City pages with representative pricing
- [ ] Full SEO health audit pass
- [ ] Archive legacy routes
- [ ] Final mobile UX pass for all roles
