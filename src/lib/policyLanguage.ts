/**
 * Canonical Policy Language — Single Source of Truth
 * 
 * ALL customer-facing warnings, notices, and legal text used across
 * the website, quote flow, contracts, addenda, CRM, and billing
 * MUST import from this file. Never hardcode policy text elsewhere.
 * 
 * Version tracking: bump POLICY_VERSION when any clause changes.
 * Older accepted contracts preserve their version via contract_version field.
 * 
 * IMPORTANT: Final legal text should be reviewed by California counsel
 * before production sign-off.
 */

import { POLICIES, HEAVY_ALLOWED_SIZES, formatPrice } from '@/config/pricingConfig';

// ── Version ──────────────────────────────────────────────────
export const POLICY_VERSION = '2026.03.1';
export const TERMS_VERSION = '2026.03.1';
export const CONTRACT_VERSION = '2026.03.1';
export const ADDENDUM_VERSION = '2026.03.1';

// ── Heavy Material Notice ────────────────────────────────────
export const HEAVY_MATERIAL_NOTICE = {
  en: `Heavy materials (concrete, soil, dirt, asphalt, brick, rock) are limited to ${HEAVY_ALLOWED_SIZES.join(', ')}-yard dumpsters. These containers have a visible fill line — do not fill above it. Clean loads of a single material type qualify for flat-fee pricing with disposal included. If a second heavy material is added, the load is reclassified as mixed heavy. If trash or general debris is added, the load is reclassified as general debris and billed by weight.`,
  es: `Los materiales pesados (concreto, tierra, asfalto, ladrillo, roca) están limitados a contenedores de ${HEAVY_ALLOWED_SIZES.join(', ')} yardas. Estos contenedores tienen una línea de llenado visible — no llene por encima de ella. Las cargas limpias de un solo tipo de material califican para precio fijo con disposición incluida. Si se agrega un segundo material pesado, la carga se reclasifica como pesado mixto. Si se agrega basura o escombros generales, la carga se reclasifica como escombros generales y se factura por peso.`,
} as const;

// ── Contamination / Reclassification Notice ──────────────────
export const CONTAMINATION_NOTICE = {
  en: `If a clean material container is contaminated with trash, mixed debris, or a different material type, the load will be
reclassified and billed at the applicable rate. A flat $${POLICIES.contaminationFee} contamination surcharge applies in addition to any disposal cost difference.`,
  es: `Si un contenedor de material limpio se contamina con basura, escombros mixtos o un tipo de material diferente, la carga será
reclasificada y facturada a la tarifa aplicable. Se aplica un cargo fijo de $${POLICIES.contaminationFee} por contaminación además de cualquier diferencia en el costo de disposición.`,
} as const;

// ── Misdeclared / Reroute Notice ─────────────────────────────
export const MISDECLARED_REROUTE_NOTICE = {
  en: `If materials are misdeclared and require disposal at a different facility, you will be charged the actual extra disposal and hauling costs plus a flat $${POLICIES.misdeclaredMaterialFee} reroute surcharge. If you notify us of a material change before pickup, no surcharge applies — we will adjust logistics at no penalty.`,
  es: `Si los materiales son declarados incorrectamente y requieren disposición en una instalación diferente, se le cobrará el costo real adicional de disposición y acarreo más un cargo fijo de $${POLICIES.misdeclaredMaterialFee} por redirección. Si nos notifica de un cambio de material antes de la recogida, no se aplica cargo — ajustaremos la logística sin penalización.`,
} as const;

// ── Weight / Overage Notice ──────────────────────────────────
export const OVERAGE_NOTICE = {
  en: `General debris dumpsters include base tonnage by size. Weight beyond the included allowance is billed at $${POLICIES.overweightCostPerTon}/ton based on official scale tickets. Heavy material dumpsters use flat-fee pricing — no weight overage applies to clean, uncontaminated loads.`,
  es: `Los contenedores de escombros generales incluyen tonelaje base por tamaño. El peso que exceda la asignación incluida se factura a $${POLICIES.overweightCostPerTon}/tonelada basado en tickets de báscula oficiales. Los contenedores de material pesado usan precio fijo — no se aplica cargo por sobrepeso a cargas limpias y no contaminadas.`,
} as const;

// ── Extra Day Notice ─────────────────────────────────────────
export const EXTRA_DAY_NOTICE = {
  en: `Your rental includes ${POLICIES.standardRentalDays} days. Additional days are charged at $${POLICIES.extraDayCost}/day. Contact us before your scheduled pickup to request an extension.`,
  es: `Su alquiler incluye ${POLICIES.standardRentalDays} días. Los días adicionales se cobran a $${POLICIES.extraDayCost}/día. Contáctenos antes de su recogida programada para solicitar una extensión.`,
} as const;

// ── Dry Run / Blocked Access Notice ──────────────────────────
export const DRY_RUN_NOTICE = {
  en: `A dry run fee applies if our truck cannot safely deliver or pick up the dumpster due to blocked access, missing permits, vehicles in the way, or unsafe site conditions. Please ensure the delivery area is clear and accessible during your scheduled service window.`,
  es: `Se aplica una tarifa por viaje fallido si nuestro camión no puede entregar o recoger el contenedor de manera segura debido a acceso bloqueado, permisos faltantes, vehículos en el camino o condiciones inseguras del sitio. Por favor asegúrese de que el área de entrega esté despejada y accesible durante su ventana de servicio programada.`,
} as const;

// ── Placement / Permit Notice ────────────────────────────────
export const PLACEMENT_PERMIT_NOTICE = {
  en: `If the dumpster is placed on a public street, sidewalk, or right-of-way, you are responsible for obtaining all required permits from your local municipality. We can provide guidance on permit requirements, but permit acquisition and fees remain your responsibility. We recommend using plywood or boards under containers on sensitive surfaces such as driveways or decorative concrete.`,
  es: `Si el contenedor se coloca en una calle pública, acera o derecho de paso, usted es responsable de obtener todos los permisos requeridos de su municipalidad local. Podemos proporcionar orientación sobre los requisitos de permisos, pero la adquisición y los costos de permisos son su responsabilidad. Recomendamos usar madera contrachapada o tablones debajo de los contenedores en superficies sensibles como entradas de vehículos o concreto decorativo.`,
} as const;

// ── Fill Line Notice ─────────────────────────────────────────
export const FILL_LINE_NOTICE = {
  en: `Do not fill the dumpster above the marked fill line or above the top edge of the container. Overfilled or overweight loads may result in: (a) refusal of pickup until excess material is removed, (b) additional fees for overweight handling, or (c) a requirement for a second container. You are responsible for any additional fees, delays, or charges resulting from overfilled containers.`,
  es: `No llene el contenedor por encima de la línea de llenado marcada o por encima del borde superior del contenedor. Las cargas sobrellenadas o con sobrepeso pueden resultar en: (a) rechazo de la recogida hasta que se retire el material excedente, (b) cargos adicionales por manejo de sobrepeso, o (c) un requisito de un segundo contenedor. Usted es responsable de cualquier cargo adicional, retrasos o cargos resultantes de contenedores sobrellenados.`,
} as const;

// ── Electronic Records / E-Signature Consent ─────────────────
export const ESIGN_CONSENT = {
  en: `By clicking "I Agree" or providing your electronic signature, you consent to conduct this transaction electronically. You agree that your electronic signature has the same legal effect as a handwritten signature under the California Uniform Electronic Transactions Act (Cal. Civ. Code § 1633.1 et seq.) and the federal Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.). You consent to receive contracts, notices, disclosures, and other communications electronically. You may withdraw this consent at any time by contacting us, but withdrawal may delay or prevent service. You have the right to receive a paper copy of any document upon request.`,
  es: `Al hacer clic en "Acepto" o proporcionar su firma electrónica, usted consiente en realizar esta transacción electrónicamente. Usted acepta que su firma electrónica tiene el mismo efecto legal que una firma manuscrita bajo la Ley Uniforme de Transacciones Electrónicas de California (Cal. Civ. Code § 1633.1 et seq.) y la Ley federal de Firmas Electrónicas en el Comercio Global y Nacional (E-SIGN Act, 15 U.S.C. § 7001 et seq.). Usted consiente en recibir contratos, avisos, divulgaciones y otras comunicaciones electrónicamente. Puede retirar este consentimiento en cualquier momento contactándonos, pero el retiro puede retrasar o impedir el servicio. Tiene derecho a recibir una copia impresa de cualquier documento previa solicitud.`,
} as const;

// ── Payment Terms Notice ─────────────────────────────────────
export const PAYMENT_TERMS_NOTICE = {
  en: `Base rental fees are due before or at the time of delivery. Post-service charges — including tonnage overages, extra rental days, contamination surcharges, and reclassification fees — are billed after pickup based on official scale tickets and facility documentation. You will receive an itemized invoice for any post-service charges. Non-payment may result in service suspension and referral to collections.`,
  es: `Los cargos base de alquiler se deben antes o al momento de la entrega. Los cargos posteriores al servicio — incluyendo excedentes de tonelaje, días adicionales de alquiler, recargos por contaminación y cargos por reclasificación — se facturan después de la recogida basados en tickets de báscula oficiales y documentación de la instalación. Recibirá una factura detallada por cualquier cargo posterior al servicio. El no pago puede resultar en suspensión del servicio y referencia a cobranzas.`,
} as const;

// ── Cancellation Notice ──────────────────────────────────────
export const CANCELLATION_NOTICE = {
  en: `Cancellations made more than 24 hours before scheduled delivery are eligible for a full refund. Cancellations within 24 hours may be subject to a cancellation fee. Once the container is delivered, standard rental charges apply.`,
  es: `Las cancelaciones realizadas con más de 24 horas de anticipación a la entrega programada son elegibles para un reembolso completo. Las cancelaciones dentro de las 24 horas pueden estar sujetas a una tarifa de cancelación. Una vez que el contenedor es entregado, se aplican los cargos estándar de alquiler.`,
} as const;

// ── Prohibited Materials Notice ──────────────────────────────
export const PROHIBITED_MATERIALS_NOTICE = {
  en: `The following materials are prohibited without prior written approval: hazardous materials (chemicals, paints, solvents, asbestos), medical or biohazardous waste, tires (surcharge applies if approved), appliances with refrigerants (freon), electronics (e-waste), mattresses (surcharge applies), and liquids or containers with liquid residue.`,
  es: `Los siguientes materiales están prohibidos sin aprobación previa por escrito: materiales peligrosos (químicos, pinturas, solventes, asbesto), desechos médicos o biopeligrosos, llantas (aplica recargo si se aprueba), electrodomésticos con refrigerantes (freón), electrónicos (e-waste), colchones (aplica recargo) y líquidos o contenedores con residuos líquidos.`,
} as const;

// ── Photo Documentation Notice ───────────────────────────────
export const PHOTO_DOCUMENTATION_NOTICE = {
  en: `You agree to provide access for pre-pickup photo documentation. Our driver will photograph the dumpster contents prior to pickup to verify material type and fill level. These photos serve as evidence for proper billing and disposal routing. If access is denied or photos cannot be taken, you authorize the disposal facility's assessment for final billing.`,
  es: `Usted acepta proporcionar acceso para documentación fotográfica previa a la recogida. Nuestro conductor fotografiará el contenido del contenedor antes de la recogida para verificar el tipo de material y nivel de llenado. Estas fotos sirven como evidencia para la facturación correcta y la ruta de disposición. Si se deniega el acceso o no se pueden tomar fotos, usted autoriza la evaluación de la instalación de disposición para la facturación final.`,
} as const;

// ── Limitation of Liability ──────────────────────────────────
export const LIABILITY_NOTICE = {
  en: `Calsan Dumpsters Pro is not liable for damage to driveways, landscaping, underground utilities, or other property unless caused by gross negligence. We recommend using plywood or boards under containers on sensitive surfaces. Our liability is limited to the amount paid for the specific service. We are not responsible for delays, interruptions, or failures due to circumstances beyond our control, including weather, traffic, mechanical issues, or third-party actions.`,
  es: `Calsan Dumpsters Pro no es responsable de daños a entradas de vehículos, paisajismo, servicios públicos subterráneos u otra propiedad a menos que sea causado por negligencia grave. Recomendamos usar madera contrachapada o tablones debajo de los contenedores en superficies sensibles. Nuestra responsabilidad se limita al monto pagado por el servicio específico. No somos responsables de retrasos, interrupciones o fallas debido a circunstancias fuera de nuestro control, incluyendo clima, tráfico, problemas mecánicos o acciones de terceros.`,
} as const;

// ── Service Windows Notice ───────────────────────────────────
export const SERVICE_WINDOWS_NOTICE = {
  en: `All delivery and pickup times are estimated windows, not guaranteed exact times. Our standard windows are: Morning (7:00 AM – 11:00 AM), Midday (11:00 AM – 3:00 PM), and Afternoon (3:00 PM – 6:00 PM). Traffic, weather, and operational factors may affect arrival times. We will communicate any significant delays.`,
  es: `Todos los tiempos de entrega y recogida son ventanas estimadas, no tiempos exactos garantizados. Nuestras ventanas estándar son: Mañana (7:00 AM – 11:00 AM), Mediodía (11:00 AM – 3:00 PM) y Tarde (3:00 PM – 6:00 PM). El tráfico, el clima y factores operacionales pueden afectar los tiempos de llegada. Comunicaremos cualquier retraso significativo.`,
} as const;

// ── Container Responsibility Notice ──────────────────────────
export const CONTAINER_RESPONSIBILITY_NOTICE = {
  en: `While the dumpster is on your property, you are responsible for the container. In the event of loss, theft, or damage beyond normal wear and tear, you may be charged the replacement value of the container (typically $3,000–$8,000 depending on size). We recommend securing the container when possible and ensuring adequate lighting for placement areas.`,
  es: `Mientras el contenedor esté en su propiedad, usted es responsable del contenedor. En caso de pérdida, robo o daño más allá del desgaste normal, se le puede cobrar el valor de reemplazo del contenedor (típicamente $3,000–$8,000 dependiendo del tamaño). Recomendamos asegurar el contenedor cuando sea posible y asegurar iluminación adecuada para las áreas de colocación.`,
} as const;

// ── Governing Law Notice ─────────────────────────────────────
export const GOVERNING_LAW_NOTICE = {
  en: `This agreement is governed by the laws of the State of California. Any disputes shall be resolved in the courts of Alameda County, California. [Dispute resolution mechanism to be finalized upon counsel review.]`,
  es: `Este acuerdo se rige por las leyes del Estado de California. Cualquier disputa será resuelta en los tribunales del Condado de Alameda, California. [Mecanismo de resolución de disputas a ser finalizado tras revisión legal.]`,
} as const;

// ── Indemnification Notice ───────────────────────────────────
export const INDEMNIFICATION_NOTICE = {
  en: `You agree to indemnify and hold harmless Calsan Dumpsters Pro, its employees, and contractors from any claims, damages, or expenses arising from your use of our services, including but not limited to improper material disposal, failure to obtain permits, or site conditions.`,
  es: `Usted acepta indemnizar y eximir de responsabilidad a Calsan Dumpsters Pro, sus empleados y contratistas de cualquier reclamo, daño o gasto que surja de su uso de nuestros servicios, incluyendo pero no limitado a disposición incorrecta de materiales, falta de obtención de permisos o condiciones del sitio.`,
} as const;

// ── Green Halo Notice ────────────────────────────────────────
export const GREEN_HALO_NOTICE = {
  en: `To receive a Green Halo recycling receipt, the load must be: (a) 100% clean and separated material with no contamination; (b) delivered to a certified recycling facility; and (c) verified by facility staff as recyclable. If the load does not meet these requirements, it will be processed as standard disposal and no Green Halo receipt will be issued.`,
  es: `Para recibir un recibo de reciclaje Green Halo, la carga debe ser: (a) 100% material limpio y separado sin contaminación; (b) entregada a una instalación de reciclaje certificada; y (c) verificada por el personal de la instalación como reciclable. Si la carga no cumple con estos requisitos, será procesada como disposición estándar y no se emitirá recibo Green Halo.`,
} as const;

// ── Aggregate: all notices for contract/T&C generation ───────
export const ALL_POLICY_NOTICES = {
  heavyMaterial: HEAVY_MATERIAL_NOTICE,
  contamination: CONTAMINATION_NOTICE,
  misdeclaredReroute: MISDECLARED_REROUTE_NOTICE,
  overage: OVERAGE_NOTICE,
  extraDay: EXTRA_DAY_NOTICE,
  dryRun: DRY_RUN_NOTICE,
  placementPermit: PLACEMENT_PERMIT_NOTICE,
  fillLine: FILL_LINE_NOTICE,
  esignConsent: ESIGN_CONSENT,
  paymentTerms: PAYMENT_TERMS_NOTICE,
  cancellation: CANCELLATION_NOTICE,
  prohibitedMaterials: PROHIBITED_MATERIALS_NOTICE,
  photoDocumentation: PHOTO_DOCUMENTATION_NOTICE,
  liability: LIABILITY_NOTICE,
  serviceWindows: SERVICE_WINDOWS_NOTICE,
  containerResponsibility: CONTAINER_RESPONSIBILITY_NOTICE,
  governingLaw: GOVERNING_LAW_NOTICE,
  indemnification: INDEMNIFICATION_NOTICE,
  greenHalo: GREEN_HALO_NOTICE,
} as const;
