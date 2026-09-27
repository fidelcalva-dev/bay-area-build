# CAL 001A — Protección del guardado de cotizaciones (2026-09-27)

## Qué se corrigió
- `save-quote`: actualizar un borrador exige un comprobante firmado por el servidor (HMAC-SHA256, limitado a esa cotización, vence en 72 h, secreto `QUOTE_DRAFT_SIGNING_SECRET` solo en servidor). Sin comprobante 401, alterado/vencido 401, de otra cotización 403, cotización inexistente 404, cerrada/convertida/con orden 409.
- Se eliminó el "insert de respaldo": una actualización fallida devuelve error y nunca crea otra cotización.
- El estado lo decide el servidor: solo `draft` o `pending`. Se ignora el estado enviado por el navegador. Un `pending` no vuelve a `draft`.
- Reglas de acceso a `quotes`: se eliminó "Public can update recent own quotes before order". La creación pública solo acepta `draft`/`pending` sin orden ni conversión. Staff/admin sin cambios.
- UI (V3QuoteFlow, InstantQuoteCalculatorV3): al fallar muestra "Quote not saved" con botón Retry y conserva los campos. Éxito solo si el servidor confirma `quote_id`.
- El envío final de V3 reutiliza el borrador (mismo `quote_id` + comprobante) en lugar de crear otro.
- Hallazgo adicional: la numeración CA-### se cortaba a 3 dígitos al pasar de 999; **ninguna cotización se guardaba desde 2026-07-29**. Corregido en `set_quote_display_id` (ahora CA-2130, etc.).

## Pruebas ejecutadas (datos ficticios ZIP 99999, borrados al terminar)
`bun test tests/save-quote-auth.test.ts` — 11/11 OK: creación, actualización con comprobante, reintento idempotente, sin comprobante, alterado, vencido, de otra cotización, id inválido, update directo anónimo bloqueado, insert directo "paid" bloqueado, estado forzado a draft. Manual: cotización cerrada → 409 sin crear otra.
No probado: 404 de borrador inexistente con comprobante válido (requiere el secreto); error de BD simulado; prueba visual del mensaje Retry en navegador.

## Pendiente
- Si el usuario pierde el comprobante (otra pestaña/dispositivo, memoria borrada al recargar — hoy vive solo en memoria de la página) el envío final crea una cotización nueva. Falta detección/fusión de duplicados.
- `InstantQuoteCalculatorV3` y otros formularios aún crean cotización nueva en cada envío (no usan borrador).
- `save-quote` aún acepta del navegador precios, descuentos, `vendor_cost` y `margin`; el precio debe recalcularse en servidor (entrega aparte).
- `create-order-from-quote` se llama desde el navegador tras el envío; revisar su autorización (fuera de alcance).
- Política de lectura "Owners can view own quotes" basada en `app.current_phone` no funciona para clientes; revisar con el portal.

## Recuperación
1. Revertir la versión en el historial de Lovable (código y función).
2. Restaurar políticas anteriores (solo si es imprescindible, reabre el hueco):
```sql
DROP POLICY IF EXISTS "Public quote creation (draft or pending only)" ON public.quotes;
CREATE POLICY "Public quote creation" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update recent own quotes before order" ON public.quotes FOR UPDATE TO anon, authenticated
 USING ((status IS NULL OR status = ANY (ARRAY['draft','saved','pinned','scheduled','checkout_started'])) AND created_at > now() - interval '24 hours')
 WITH CHECK (status IS NULL OR status = ANY (ARRAY['draft','saved','pinned','scheduled','checkout_started']));
```
No revertir la corrección de numeración.

## Entrada de registro
CAL 001A — 2026-09-27 — Protección del guardado de cotizaciones aplicada (función, reglas de acceso, mensajes de error) y corregida la numeración que impedía guardar cotizaciones desde julio. 11 pruebas automáticas + 1 manual OK. Pendiente: duplicados al perder comprobante, precio calculado en servidor, autorización de creación de órdenes. El flujo completo de pedidos NO está terminado.
