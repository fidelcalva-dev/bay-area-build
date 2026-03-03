

## Plan: Update Homepage Copy in `src/pages/Index.tsx`

The build errors are **infrastructure timeouts** (output truncated at chunk listing, no syntax/type errors shown). The last diff was in `CalsanAIChat.tsx`, not `Index.tsx`. The build will retry successfully.

### Changes needed in `src/pages/Index.tsx` (copy-only edits):

**1. HERO (lines 90-102)**
- H1: `"Dumpster Rental in the Bay Area"` → `"Professional Dumpster Rental. Done Right."`
- Remove Bay Area underline span styling
- Subheadline: merge two `<p>` tags into one: `"Exact pricing by ZIP. Clear rental terms. Reliable delivery across the Bay Area."`

**2. GUIDED ASSISTANT section (line 137-141)**
- Add helper text below `<GuidedAssistant />`: `"You'll see your total before you confirm. No surprises."`

**3. EXPERTISE section (lines 149-170)**
- Title: `"We Specialize in Dumpster Rental"` → `"Dumpster Rental Is All We Do."`
- Body: Update to requested two-paragraph copy about 2009/2015 history + "Clear rules, reliable scheduling..."

**4. SIZES section (line 181-183)**
- Title: `"Dumpster Sizes Available"` → `"Dumpster Sizes"`

**5. SERVICE AREAS section (lines 233-237)**
- Title: `"Dumpster Rental Near You"` → `"Serving the Bay Area"`

**6. FINAL CTA / FOOTER tagline (line 299-301)**
- Change from `"Serving the Bay Area since 2009..."` → `"Calsan Dumpsters Pro — Dumpster Rental. Done Right."`

**What stays unchanged:**
- All imports, routing, Layout wrapper, GuidedAssistant component and its buttons/flows
- Trust strip items (already match requirements)
- FAQ section (already `limit={4}`)
- Build fingerprint block
- All navigation links and CTAs targets

