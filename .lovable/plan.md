# CAL 001A — Protección del guardado de cotizaciones

## Bloqueo importante (leer primero)
En este proyecto, la vista previa y el sitio publicado comparten **el mismo backend**. Cualquier cambio en la función `save-quote` o en las reglas de acceso de `quotes` queda activo en producción en cuanto se aplica. No existe un entorno separado. Por eso me detuve aquí, como pediste: este plan es el cambio revisable. Nada se ha modificado todavía.

Opciones para probar sin tocar producción: (a) aprobar este plan sabiendo que se aplica en vivo, o (b) usar un borrador aislado de Lovable (backend propio) para probar primero y luego aceptarlo.

## Hallazgos confirmados (solo lectura, ya verificados)
- `save-quote` (línea ~268): actualiza con `existing_quote_id` sin verificar autorización; si falla, **inserta otra cotización** (línea ~278).
- Línea 171: acepta `payload.status` del navegador (incluso "paid").
- `V3QuoteFlow.tsx` (765, 769) e `InstantQuoteCalculatorV3.tsx` (700, 716) muestran "Quote Saved Partially" aunque el servidor rechace.
- Política **activa** en `quotes`: "Public can update recent own quotes before order" — cualquier visitante (anon) puede modificar cualquier cotización de menos de 24 h en estado draft/saved/pinned/scheduled/checkout_started, sin comprobar propietario.
- Política activa "Public quote creation": INSERT abierto con `with_check true` (permite elegir cualquier estado directo desde el navegador).
- "Owners can view own quotes" usa `current_setting('app.current_phone')` — no es explotable por PostgREST, pero tampoco sirve; se deja documentado.

## Cambios propuestos
1. **Comprobante firmado (draft token)** en `save-quote`: al crear un borrador, el servidor devuelve `draft_token` = HMAC-SHA256(quote_id + vencimiento 72 h) con un secreto nuevo `QUOTE_DRAFT_SIGNING_SECRET` (solo servidor). Actualizar exige token válido, no alterado, no vencido y del mismo `quote_id`. Sin token → 401; token de otra cotización → 403.
2. **Sin sustitución**: si la actualización falla o la cotización no existe → error (404/409/500). Se elimina el insert de respaldo.
3. **Cotizaciones protegidas**: si el estado es distinto de draft/pending, o tiene `order_id`/`converted_at`/vinculación a orden → 409 "quote locked".
4. **Estado decidido por el servidor**: se ignora `payload.status`; solo `draft` (borrador) o `pending` (envío final). Nunca paid/approved/scheduled.
5. **Reglas de acceso a `quotes`** (migración): eliminar "Public can update recent own quotes before order"; restringir INSERT público a `status in ('draft','pending')` y sin campos de pago; conservar Admin/Staff. Los clientes siguen usando la función y el portal.
6. **Interfaz**: `draftQuoteService` guarda y reenvía `draft_token`. Si falla: conservar todos los campos, mostrar "Quote not saved" con botón "Retry". Éxito solo con `success: true` y `quote_id` confirmado. Aplicado en V3QuoteFlow e InstantQuoteCalculatorV3.
7. **Borrador → envío final**: el envío final reutiliza el mismo `quote_id` + token (update a `pending`). Pendiente documentado: si el usuario pierde el token (otra pestaña/dispositivo, localStorage borrado) se creará una nueva cotización; el marcado de duplicados queda para una entrega posterior.

## Pruebas (script Deno contra la función, con datos ficticios, sin SMS/email/cobro)
Creación legítima; actualización con token; otro quote_id; token ausente, alterado, vencido; borrador inexistente; cotización cerrada; error de BD simulado; reintento; update directo anon a `quotes` (debe fallar); conservación de campos en la UI (Playwright). Nota: el aviso de lead/SMS que dispara `save-quote` se desactivará en las pruebas con un encabezado de prueba solo aceptado junto al token de servicio.

## Archivos
- `supabase/functions/save-quote/index.ts`
- nueva migración de políticas `quotes`
- `src/lib/draftQuoteService.ts`, `src/components/quote/v3/V3QuoteFlow.tsx`, `src/components/quote/InstantQuoteCalculatorV3.tsx`
- `tests/save-quote-auth.test.ts`, `docs/CAL_001A.md` (entrada de registro, limitaciones, recuperación)

## Recuperación
Revertir la versión en el historial de Lovable y re-crear la política eliminada (SQL incluido en `docs/CAL_001A.md`).
