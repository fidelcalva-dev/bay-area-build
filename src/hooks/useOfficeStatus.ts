// Hook to manage real-time office status
import { useState, useEffect, useCallback } from 'react';

export interface OfficeStatus {
  isOpen: boolean;
  statusText: string;
  statusTextEs: string;
  actionLabel: string;
  actionLabelEs: string;
  chatMessage: string;
  chatMessageEs: string;
}

// PST timezone offset (standard time)
const PST_OFFSET = -8;
// PDT timezone offset (daylight saving time)
const PDT_OFFSET = -7;

/**
 * Get current Pacific time hour, accounting for DST
 */
function getPacificHour(): number {
  const now = new Date();
  
  // Check if we're in DST (rough approximation: March-November)
  const month = now.getMonth();
  const isDST = month >= 2 && month <= 10; // March (2) to November (10)
  
  const offset = isDST ? PDT_OFFSET : PST_OFFSET;
  const utcHour = now.getUTCHours();
  const pacificHour = (utcHour + offset + 24) % 24;
  
  return pacificHour;
}

/**
 * Check if currently within office hours (6 AM - 9 PM Pacific)
 */
function checkIsOpen(): boolean {
  const pacificHour = getPacificHour();
  return pacificHour >= 6 && pacificHour < 21; // 6 AM to 9 PM
}

/**
 * Hook to get real-time office status
 */
export function useOfficeStatus(): OfficeStatus {
  const [isOpen, setIsOpen] = useState(checkIsOpen);

  // Update status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(checkIsOpen());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Also check immediately on mount
  useEffect(() => {
    setIsOpen(checkIsOpen());
  }, []);

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Open now — Live support',
      statusTextEs: 'Abierto — Soporte en vivo',
      actionLabel: 'Call Now',
      actionLabelEs: 'Llamar Ahora',
      chatMessage: 'We\'re online and ready to help!',
      chatMessageEs: '¡Estamos en línea y listos para ayudar!',
    };
  }

  return {
    isOpen: false,
    statusText: 'After hours — Leave a message',
    statusTextEs: 'Fuera de horario — Deja un mensaje',
    actionLabel: 'Send a Message',
    actionLabelEs: 'Enviar Mensaje',
    chatMessage: 'We\'re currently offline, but we\'ve received your message and will respond soon.',
    chatMessageEs: 'Estamos fuera de línea, pero hemos recibido su mensaje y responderemos pronto.',
  };
}

/**
 * Get office status without hook (for edge functions / server-side)
 */
export function getOfficeStatus(): OfficeStatus {
  const isOpen = checkIsOpen();
  
  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Open now — Live support',
      statusTextEs: 'Abierto — Soporte en vivo',
      actionLabel: 'Call Now',
      actionLabelEs: 'Llamar Ahora',
      chatMessage: 'We\'re online and ready to help!',
      chatMessageEs: '¡Estamos en línea y listos para ayudar!',
    };
  }

  return {
    isOpen: false,
    statusText: 'After hours — Leave a message',
    statusTextEs: 'Fuera de horario — Deja un mensaje',
    actionLabel: 'Send a Message',
    actionLabelEs: 'Enviar Mensaje',
    chatMessage: 'We\'re currently offline, but we\'ve received your message and will respond soon.',
    chatMessageEs: 'Estamos fuera de línea, pero hemos recibido su mensaje y responderemos pronto.',
  };
}
