# CAL 010 — Fuentes de precio y diferencias (sin cambios activados)

Fuente oficial: lista por ZIP `src/lib/price-list-data.ts` (META 2026 v2, 5 yd GA confirmado $390).

| Lugar | Qué usa | Ejemplo (ZIP 94501, grupo GA) | Diferencia |
|---|---|---|---|
| Calculadora V3 `/quote` | Lista por ZIP (redondeada) | 8 yd General $512 | Redondea $511.60 |
| Calculadora rápida `/quick-order` | Precio de exhibición | 10 yd $495 | Lista: $581.60 |
| `pricingConfig.ts` / tarjetas | Precios de exhibición | 8 yd $425 | Lista: $511.60 |
| Días extra | V3 $15/día; config compartida $35/día | — | Falta decidir |
| `save-quote` | Confía en el subtotal del navegador | — | Debe calcularse en servidor |
| `create-order-from-quote` | Usa subtotal guardado | — | Hereda lo anterior |
| `getPriceByZip` | Tamaño desconocido → toma el más cercano; precio pesado vacío → usa General | 12 yd → precio de 10 yd | Riesgo de cobrar mal |
| `getPriceFromList` (por ciudad) | Ciudad desconocida → precio de Oakland | — | Riesgo de cobrar mal |

## Cálculo central preparado (NO activo)
`src/lib/pricing/officialQuotePrice.ts`: celda exacta de la lista, en centavos, sin redondeo, sin adivinar tamaño ni material; si algo no está en la lista devuelve "necesita confirmación". Días extra quedan abiertos hasta confirmar la tarifa. Pruebas: `tests/official-price.test.ts` (8/8).

## Decisiones necesarias (Fidel)
1. ¿Se cobra el centavo exacto ($511.60) o se redondea?
2. Tarifa de día extra: $15 o $35.
3. ¿La calculadora rápida y las tarjetas deben mostrar la lista por ZIP?
