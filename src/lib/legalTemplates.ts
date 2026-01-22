/**
 * Legal & Operational Templates
 * Standardized customer-facing communications for receipts, confirmations, and disclaimers
 * Used across SMS, Email, and Portal
 */

// =====================================================
// DISCLAIMERS
// =====================================================

export const DISCLAIMERS = {
  // Heavy Material Disclaimer
  heavyMaterial: {
    en: `Heavy materials must be clean and separated by type. If heavy materials are mixed together or mixed with debris, the load may be reclassified and billed accordingly. Recycling availability depends on facility acceptance and location.`,
    es: `Los materiales pesados deben estar limpios y separados por tipo. Si los materiales pesados se mezclan entre sí o con escombros, la carga puede ser reclasificada y facturada en consecuencia. La disponibilidad de reciclaje depende de la aceptación y ubicación de la instalación.`,
  },

  // Additional Fees & Extras Disclaimer
  additionalFees: {
    en: `Additional fees may apply for: pressure-treated wood, tires, mattresses and bulky furniture, appliances (especially with refrigerants), wet or contaminated materials, overfilled or unsafe loads, cleanup or hand sorting. Fees are determined based on actual conditions and facility documentation.`,
    es: `Pueden aplicarse tarifas adicionales por: madera tratada, llantas, colchones y muebles voluminosos, electrodomésticos (especialmente con refrigerantes), materiales mojados o contaminados, cargas sobrellenadas o inseguras, limpieza o clasificación manual. Las tarifas se determinan según las condiciones reales y la documentación de la instalación.`,
  },

  // Payment & Non-Payment Disclaimer
  payment: {
    en: `Payment is required before or at the time of service unless approved. Post-service charges, including overages and reclassification, are billed after disposal based on scale tickets. Non-payment may result in service suspension and collections.`,
    es: `El pago es requerido antes o al momento del servicio a menos que sea aprobado. Los cargos posteriores al servicio, incluyendo excedentes y reclasificación, se facturan después de la disposición según los tickets de báscula. El no pago puede resultar en suspensión del servicio y cobranza.`,
  },

  // Dry Run / Blocked Access Disclaimer
  dryRun: {
    en: `A dry run fee may apply if the truck cannot safely deliver or pick up due to blocked access, missing permits, or unsafe conditions.`,
    es: `Puede aplicarse una tarifa por viaje fallido si el camión no puede entregar o recoger de manera segura debido a acceso bloqueado, permisos faltantes o condiciones inseguras.`,
  },

  // Portal Records as Final Proof
  portalRecords: {
    en: `Photos, scale tickets, receipts, and records available through the customer portal constitute final documentation of service and billing.`,
    es: `Las fotos, tickets de báscula, recibos y registros disponibles a través del portal del cliente constituyen la documentación final del servicio y facturación.`,
  },

  // Time Window / Arrival Disclaimer
  arrivalTimes: {
    en: `Arrival times are estimates due to traffic and transfer stations. Keep access clear during the scheduled window.`,
    es: `Los tiempos de llegada son estimados debido al tráfico y centros de transferencia. Mantenga el acceso despejado durante la ventana programada.`,
  },

  // Street Placement Permit
  streetPermit: {
    en: `Street placement may require a permit.`,
    es: `La colocación en calle puede requerir un permiso.`,
  },

  // Weight-Based Billing
  weightBilling: {
    en: `Final billing is based on official scale ticket weights.`,
    es: `La facturación final se basa en los pesos oficiales del ticket de báscula.`,
  },
} as const;

// =====================================================
// SCHEDULE CONFIRMATION TEMPLATE
// =====================================================

export interface ScheduleConfirmationData {
  deliveryDate: string;
  deliveryWindow: string;
  pickupDate?: string;
  pickupWindow?: string;
}

export function buildScheduleConfirmationSMS(
  data: ScheduleConfirmationData,
  lang: 'en' | 'es' = 'en'
): string {
  const { deliveryDate, deliveryWindow, pickupDate, pickupWindow } = data;

  if (lang === 'es') {
    let message = `Confirmado ✅\n\nEntrega:\n• Fecha: ${deliveryDate}\n• Ventana: ${deliveryWindow}`;
    if (pickupDate && pickupWindow) {
      message += `\n\nRecogida:\n• Fecha: ${pickupDate}\n• Ventana: ${pickupWindow}`;
    }
    message += `\n\nNotas:\n• ${DISCLAIMERS.arrivalTimes.es}\n• ${DISCLAIMERS.streetPermit.es}`;
    return message;
  }

  // English
  let message = `Confirmed ✅\n\nDelivery:\n• Date: ${deliveryDate}\n• Time Window: ${deliveryWindow}`;
  if (pickupDate && pickupWindow) {
    message += `\n\nPickup:\n• Date: ${pickupDate}\n• Time Window: ${pickupWindow}`;
  }
  message += `\n\nNotes:\n• ${DISCLAIMERS.arrivalTimes.en}\n• ${DISCLAIMERS.streetPermit.en}`;
  return message;
}

export function buildScheduleConfirmationEmail(
  data: ScheduleConfirmationData & { customerName?: string },
  lang: 'en' | 'es' = 'en'
): { subject: string; html: string } {
  const { deliveryDate, deliveryWindow, pickupDate, pickupWindow, customerName } = data;
  const greeting = customerName ? customerName.split(' ')[0] : (lang === 'es' ? 'Estimado cliente' : 'Valued Customer');

  const subject = lang === 'es' 
    ? 'Entrega de Dumpster Confirmada' 
    : 'Dumpster Delivery Confirmed';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%); color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
        .schedule-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .schedule-box h3 { margin: 0 0 8px; color: #166534; }
        .schedule-item { margin: 4px 0; }
        .notes { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; font-size: 14px; }
        .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${lang === 'es' ? '✅ Entrega Confirmada' : '✅ Delivery Confirmed'}</h1>
        </div>
        <div class="content">
          <p>${lang === 'es' ? `Hola ${greeting},` : `Hi ${greeting},`}</p>
          <p>${lang === 'es' ? 'Su entrega de dumpster está confirmada.' : 'Your dumpster delivery is confirmed.'}</p>
          
          <div class="schedule-box">
            <h3>📦 ${lang === 'es' ? 'Entrega' : 'Delivery'}</h3>
            <div class="schedule-item"><strong>${lang === 'es' ? 'Fecha' : 'Date'}:</strong> ${deliveryDate}</div>
            <div class="schedule-item"><strong>${lang === 'es' ? 'Ventana' : 'Time Window'}:</strong> ${deliveryWindow}</div>
          </div>
          
          ${pickupDate && pickupWindow ? `
          <div class="schedule-box">
            <h3>🚛 ${lang === 'es' ? 'Recogida' : 'Pickup'}</h3>
            <div class="schedule-item"><strong>${lang === 'es' ? 'Fecha' : 'Date'}:</strong> ${pickupDate}</div>
            <div class="schedule-item"><strong>${lang === 'es' ? 'Ventana' : 'Time Window'}:</strong> ${pickupWindow}</div>
          </div>
          ` : ''}
          
          <div class="notes">
            <strong>${lang === 'es' ? 'Notas importantes:' : 'Important Notes:'}</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li>${DISCLAIMERS.arrivalTimes[lang]}</li>
              <li>${DISCLAIMERS.streetPermit[lang]}</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          Calsan Dumpsters | Bay Area's Trusted Dumpster Service
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// =====================================================
// SERVICE RECEIPT TEMPLATE
// =====================================================

export interface ServiceReceiptData {
  orderId: string;
  serviceAddress: string;
  size: string;
  materialType: string;
  facilityName: string;
  ticketDate: string;
  totalTons: number;
  includedTons: number;
  overageTons?: number;
  overageRate?: number;
  overageCharge?: number;
  ticketUrl?: string;
  customerName?: string;
}

export function buildServiceReceiptSMS(
  data: ServiceReceiptData,
  lang: 'en' | 'es' = 'en'
): string {
  const { orderId, totalTons, includedTons, overageTons, overageCharge, ticketUrl } = data;
  const hasOverage = (overageTons || 0) > 0;

  if (lang === 'es') {
    let message = `Recibo de Servicio 📄\n\nPedido: #${orderId.slice(0, 8)}\nPeso Total: ${totalTons.toFixed(2)}T\nTons Incluidas: ${includedTons}T`;
    if (hasOverage) {
      message += `\nExcedente: ${overageTons?.toFixed(2)}T = $${overageCharge?.toFixed(2)}`;
    }
    if (ticketUrl) {
      message += `\n\nVer ticket: ${ticketUrl}`;
    }
    message += `\n\n${DISCLAIMERS.weightBilling.es}`;
    return message;
  }

  let message = `Service Receipt 📄\n\nOrder: #${orderId.slice(0, 8)}\nTotal Weight: ${totalTons.toFixed(2)}T\nIncluded Tons: ${includedTons}T`;
  if (hasOverage) {
    message += `\nOverage: ${overageTons?.toFixed(2)}T = $${overageCharge?.toFixed(2)}`;
  }
  if (ticketUrl) {
    message += `\n\nView ticket: ${ticketUrl}`;
  }
  message += `\n\n${DISCLAIMERS.weightBilling.en}`;
  return message;
}

export function buildServiceReceiptEmailSubject(hasOverage: boolean, lang: 'en' | 'es' = 'en'): string {
  if (lang === 'es') {
    return hasOverage ? 'Recibo de Servicio - Cargo por Excedente' : 'Recibo de Servicio Completado';
  }
  return hasOverage ? 'Service Receipt - Overage Charge' : 'Service Receipt - Complete';
}

// =====================================================
// PAYMENT REQUEST TEMPLATE
// =====================================================

export interface PaymentRequestData {
  amount: number;
  paymentType: 'deposit' | 'balance' | 'overage';
  paymentLink: string;
  customerName?: string;
  note?: string;
}

export function buildPaymentRequestSMS(
  data: PaymentRequestData,
  lang: 'en' | 'es' = 'en'
): string {
  const { amount, paymentType, paymentLink, customerName, note } = data;
  const greeting = customerName ? customerName.split(' ')[0] : '';
  const formattedAmount = amount.toFixed(2);

  const typeLabels = {
    deposit: { en: 'deposit', es: 'depósito' },
    balance: { en: 'balance', es: 'saldo' },
    overage: { en: 'overage', es: 'excedente' },
  };

  if (lang === 'es') {
    let message = greeting ? `Hola ${greeting}, ` : '';
    message += `Su pago de ${typeLabels[paymentType].es} de $${formattedAmount} está listo. Pague aquí: ${paymentLink}`;
    if (note) message += `\n\n${note}`;
    message += `\n\n${DISCLAIMERS.payment.es}`;
    return message;
  }

  let message = greeting ? `Hi ${greeting}, ` : '';
  message += `Your Calsan ${typeLabels[paymentType].en} payment of $${formattedAmount} is ready. Pay securely here: ${paymentLink}`;
  if (note) message += `\n\n${note}`;
  message += `\n\n${DISCLAIMERS.payment.en}`;
  return message;
}

// =====================================================
// CRM TEMPLATE BUTTONS (for CS/Admin use)
// =====================================================

export const CRM_TEMPLATES = {
  scheduleConfirmation: {
    key: 'schedule_confirmation',
    label: 'Schedule Confirmation',
    labelEs: 'Confirmación de Horario',
    category: 'operations',
  },
  serviceReceipt: {
    key: 'service_receipt',
    label: 'Service Receipt',
    labelEs: 'Recibo de Servicio',
    category: 'billing',
  },
  paymentRequest: {
    key: 'payment_request',
    label: 'Payment Request',
    labelEs: 'Solicitud de Pago',
    category: 'billing',
  },
  pickupReminder: {
    key: 'pickup_reminder',
    label: 'Pickup Reminder',
    labelEs: 'Recordatorio de Recogida',
    category: 'operations',
  },
  heavyMaterialWarning: {
    key: 'heavy_material_warning',
    label: 'Heavy Material Warning',
    labelEs: 'Advertencia de Material Pesado',
    category: 'operations',
  },
  dryRunNotice: {
    key: 'dry_run_notice',
    label: 'Dry Run Notice',
    labelEs: 'Aviso de Viaje Fallido',
    category: 'operations',
  },
} as const;

// =====================================================
// CONTRACT SIGNATURE TEMPLATES
// =====================================================

export interface ContractSignatureData {
  contractType: 'msa' | 'addendum';
  signingLink: string;
  customerName?: string;
  serviceAddress?: string;
}

export function buildContractRequestSMS(
  data: ContractSignatureData,
  variant: 'initial' | 'reminder_24h' | 'final_48h' = 'initial',
  lang: 'en' | 'es' = 'en'
): string {
  const { contractType, signingLink, customerName, serviceAddress } = data;
  const greeting = customerName ? customerName.split(' ')[0] : '';
  
  const typeLabel = {
    msa: { en: 'Master Service Agreement', es: 'Acuerdo de Servicio Maestro' },
    addendum: { en: 'Service Addendum', es: 'Adenda de Servicio' },
  };

  const messages = {
    initial: {
      en: `${greeting ? `Hi ${greeting}, ` : ''}Please review and sign your ${typeLabel[contractType].en} to proceed with scheduling.${serviceAddress ? ` Address: ${serviceAddress}` : ''}\n\nSign here: ${signingLink}\n\nNo service can be performed until this is completed.`,
      es: `${greeting ? `Hola ${greeting}, ` : ''}Por favor revise y firme su ${typeLabel[contractType].es} para proceder con la programación.${serviceAddress ? ` Dirección: ${serviceAddress}` : ''}\n\nFirme aquí: ${signingLink}\n\nNo se puede realizar servicio hasta que esto esté completo.`,
    },
    reminder_24h: {
      en: `${greeting ? `Hi ${greeting}, ` : ''}Reminder: Your ${typeLabel[contractType].en} is still awaiting signature. Sign now to avoid delays: ${signingLink}`,
      es: `${greeting ? `Hola ${greeting}, ` : ''}Recordatorio: Su ${typeLabel[contractType].es} aún espera firma. Firme ahora para evitar retrasos: ${signingLink}`,
    },
    final_48h: {
      en: `${greeting ? `Hi ${greeting}, ` : ''}FINAL NOTICE: Your ${typeLabel[contractType].en} must be signed to proceed. Without signature, scheduling cannot continue. Sign now: ${signingLink}`,
      es: `${greeting ? `Hola ${greeting}, ` : ''}AVISO FINAL: Su ${typeLabel[contractType].es} debe ser firmado para proceder. Sin firma, la programación no puede continuar. Firme ahora: ${signingLink}`,
    },
  };

  return messages[variant][lang];
}

export function buildContractSignedConfirmationSMS(
  data: ContractSignatureData,
  lang: 'en' | 'es' = 'en'
): string {
  const { contractType, customerName, serviceAddress } = data;
  const greeting = customerName ? customerName.split(' ')[0] : '';
  
  const typeLabel = {
    msa: { en: 'Master Service Agreement', es: 'Acuerdo de Servicio Maestro' },
    addendum: { en: 'Service Addendum', es: 'Adenda de Servicio' },
  };

  if (lang === 'es') {
    return `${greeting ? `Hola ${greeting}, ` : ''}✅ Su ${typeLabel[contractType].es} ha sido firmado exitosamente.${serviceAddress ? ` Dirección: ${serviceAddress}` : ''}\n\nAhora podemos proceder con la programación de su servicio. ¡Gracias!`;
  }
  
  return `${greeting ? `Hi ${greeting}, ` : ''}✅ Your ${typeLabel[contractType].en} has been signed successfully.${serviceAddress ? ` Address: ${serviceAddress}` : ''}\n\nWe can now proceed with scheduling your service. Thank you!`;
}

export function buildContractSignedConfirmationEmail(
  data: ContractSignatureData & { customerName?: string },
  lang: 'en' | 'es' = 'en'
): { subject: string; html: string } {
  const { contractType, customerName, serviceAddress } = data;
  const greeting = customerName ? customerName.split(' ')[0] : (lang === 'es' ? 'Estimado cliente' : 'Valued Customer');
  
  const typeLabel = {
    msa: { en: 'Master Service Agreement', es: 'Acuerdo de Servicio Maestro' },
    addendum: { en: 'Service Addendum', es: 'Adenda de Servicio' },
  };

  const subject = lang === 'es' 
    ? `✅ ${typeLabel[contractType].es} Firmado` 
    : `✅ ${typeLabel[contractType].en} Signed`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%); color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
        .success-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
        .success-box h3 { margin: 0 0 8px; color: #166534; }
        .footer { text-align: center; padding: 16px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">${lang === 'es' ? '✅ Contrato Firmado' : '✅ Contract Signed'}</h1>
        </div>
        <div class="content">
          <p>${lang === 'es' ? `Hola ${greeting},` : `Hi ${greeting},`}</p>
          
          <div class="success-box">
            <h3>${lang === 'es' ? 'Firma Completada' : 'Signature Complete'}</h3>
            <p>${lang === 'es' 
              ? `Su ${typeLabel[contractType].es} ha sido firmado exitosamente.`
              : `Your ${typeLabel[contractType].en} has been signed successfully.`}</p>
            ${serviceAddress ? `<p><strong>${lang === 'es' ? 'Dirección' : 'Address'}:</strong> ${serviceAddress}</p>` : ''}
          </div>
          
          <p>${lang === 'es' 
            ? 'Ahora podemos proceder con la programación de su servicio. Un representante se pondrá en contacto pronto.'
            : 'We can now proceed with scheduling your service. A representative will be in touch shortly.'}</p>
        </div>
        <div class="footer">
          Calsan Dumpsters | Bay Area's Trusted Dumpster Service
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// =====================================================
// HELPER: Get all disclaimers for a specific context
// =====================================================

export function getDisclaimersForContext(
  context: 'schedule' | 'receipt' | 'heavy' | 'payment',
  lang: 'en' | 'es' = 'en'
): string[] {
  const disclaimers: string[] = [];

  switch (context) {
    case 'schedule':
      disclaimers.push(DISCLAIMERS.arrivalTimes[lang]);
      disclaimers.push(DISCLAIMERS.streetPermit[lang]);
      break;
    case 'receipt':
      disclaimers.push(DISCLAIMERS.weightBilling[lang]);
      disclaimers.push(DISCLAIMERS.portalRecords[lang]);
      break;
    case 'heavy':
      disclaimers.push(DISCLAIMERS.heavyMaterial[lang]);
      disclaimers.push(DISCLAIMERS.additionalFees[lang]);
      break;
    case 'payment':
      disclaimers.push(DISCLAIMERS.payment[lang]);
      break;
  }

  return disclaimers;
}
