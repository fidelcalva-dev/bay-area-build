import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.sizes': 'Dumpster Sizes',
    'nav.areas': 'Service Areas',
    'nav.materials': 'Materials Allowed',
    'nav.contractors': 'Contractors',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.orderNow': 'Order Now',
    'nav.getQuote': 'Get Instant Quote',
    
    // Hero
    'hero.title': 'Dumpster Rental Made Easy',
    'hero.subtitle': 'SF Bay Area',
    'hero.description': 'Same-day delivery. Transparent pricing. On-time service. Serving 9 Bay Area counties with reliable roll-off dumpster rentals.',
    'hero.cta.quote': 'Get Instant Quote',
    'hero.cta.call': 'Call Now',
    'hero.cta.order': 'Order Now',
    'hero.spanish': 'Hablamos Español',
    'hero.trust': 'Google Guaranteed',
    
    // Features
    'features.sameDay': 'Same-Day Delivery',
    'features.sameDayDesc': 'Need a dumpster today? We deliver.',
    'features.transparent': 'Transparent Pricing',
    'features.transparentDesc': 'No hidden fees. Ever.',
    'features.onTime': 'On-Time Service',
    'features.onTimeDesc': 'We show up when we say we will.',
    'features.textUpdates': 'Text Updates',
    'features.textUpdatesDesc': 'Track your delivery via SMS.',
    
    // CTA
    'cta.call': 'Call',
    'cta.text': 'Text',
    'cta.quote': 'Quote',
    'cta.order': 'Order Now',
    
    // Forms
    'form.zip': 'ZIP Code',
    'form.size': 'Dumpster Size',
    'form.material': 'Material Type',
    'form.deliveryDate': 'Delivery Date',
    'form.rentalDays': 'Rental Days',
    'form.notes': 'Delivery Notes',
    'form.name': 'Full Name',
    'form.email': 'Email',
    'form.phone': 'Phone Number',
    'form.address': 'Delivery Address',
    'form.submit': 'Get My Estimate',
    'form.submitting': 'Getting Estimate...',
    
    // Sizes
    'sizes.title': 'Dumpster Sizes',
    'sizes.subtitle': 'Choose the right size for your project',
    'sizes.perfectFor': 'Perfect for:',
    'sizes.dimensions': 'Dimensions:',
    'sizes.choose': 'Choose This Size',
    'sizes.yards': 'Yard',
    
    // Footer
    'footer.company': 'Calsan Dumpsters Pro',
    'footer.tagline': 'Your trusted dumpster rental partner in the SF Bay Area.',
    'footer.quickLinks': 'Quick Links',
    'footer.services': 'Services',
    'footer.contact': 'Contact Us',
    'footer.hours': 'Hours: Mon-Sat 7AM-6PM',
    'footer.rights': 'All rights reserved.',
    
    // Trust
    'trust.title': 'Why Choose Us',
    'trust.guarantee': 'Google Guarantee',
    'trust.guaranteeDesc': 'Protected by Google Local Services. If you\'re not satisfied, Google may refund up to $2,000.',
    
    // Reviews
    'reviews.title': 'What Our Customers Say',
    'reviews.leave': 'Leave a Review',
    
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'re here to help. Reach out anytime.',
    'contact.phone': 'Phone (Sales)',
    'contact.support': 'Customer Support',
    'contact.email': 'Email',
    'contact.address': 'Address',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.pricing': 'Precios',
    'nav.sizes': 'Tamaños',
    'nav.areas': 'Áreas de Servicio',
    'nav.materials': 'Materiales',
    'nav.contractors': 'Contratistas',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    'nav.blog': 'Blog',
    'nav.orderNow': 'Ordenar Ahora',
    'nav.getQuote': 'Cotización Gratis',
    
    // Hero
    'hero.title': 'Alquiler de Contenedores Fácil',
    'hero.subtitle': 'Área de la Bahía de SF',
    'hero.description': 'Entrega el mismo día. Precios transparentes. Servicio puntual. Sirviendo 9 condados del Área de la Bahía con contenedores confiables.',
    'hero.cta.quote': 'Cotización Gratis',
    'hero.cta.call': 'Llamar Ahora',
    'hero.cta.order': 'Ordenar Ahora',
    'hero.spanish': 'Hablamos Español',
    'hero.trust': 'Garantizado por Google',
    
    // Features
    'features.sameDay': 'Entrega el Mismo Día',
    'features.sameDayDesc': '¿Necesita un contenedor hoy? Lo entregamos.',
    'features.transparent': 'Precios Transparentes',
    'features.transparentDesc': 'Sin cargos ocultos. Nunca.',
    'features.onTime': 'Servicio Puntual',
    'features.onTimeDesc': 'Llegamos cuando decimos.',
    'features.textUpdates': 'Actualizaciones por Texto',
    'features.textUpdatesDesc': 'Siga su entrega por SMS.',
    
    // CTA
    'cta.call': 'Llamar',
    'cta.text': 'Texto',
    'cta.quote': 'Cotizar',
    'cta.order': 'Ordenar Ahora',
    
    // Forms
    'form.zip': 'Código Postal',
    'form.size': 'Tamaño del Contenedor',
    'form.material': 'Tipo de Material',
    'form.deliveryDate': 'Fecha de Entrega',
    'form.rentalDays': 'Días de Alquiler',
    'form.notes': 'Notas de Entrega',
    'form.name': 'Nombre Completo',
    'form.email': 'Correo Electrónico',
    'form.phone': 'Número de Teléfono',
    'form.address': 'Dirección de Entrega',
    'form.submit': 'Obtener Estimado',
    'form.submitting': 'Obteniendo Estimado...',
    
    // Sizes
    'sizes.title': 'Tamaños de Contenedores',
    'sizes.subtitle': 'Elija el tamaño adecuado para su proyecto',
    'sizes.perfectFor': 'Perfecto para:',
    'sizes.dimensions': 'Dimensiones:',
    'sizes.choose': 'Elegir Este Tamaño',
    'sizes.yards': 'Yardas',
    
    // Footer
    'footer.company': 'Calsan Dumpsters Pro',
    'footer.tagline': 'Su socio confiable de alquiler de contenedores en el Área de la Bahía.',
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.services': 'Servicios',
    'footer.contact': 'Contáctenos',
    'footer.hours': 'Horario: Lun-Sáb 7AM-6PM',
    'footer.rights': 'Todos los derechos reservados.',
    
    // Trust
    'trust.title': 'Por Qué Elegirnos',
    'trust.guarantee': 'Garantía de Google',
    'trust.guaranteeDesc': 'Protegido por Servicios Locales de Google. Si no está satisfecho, Google puede reembolsar hasta $2,000.',
    
    // Reviews
    'reviews.title': 'Lo Que Dicen Nuestros Clientes',
    'reviews.leave': 'Dejar una Reseña',
    
    // FAQ
    'faq.title': 'Preguntas Frecuentes',
    
    // Contact
    'contact.title': 'Contáctenos',
    'contact.subtitle': 'Estamos aquí para ayudar. Comuníquese en cualquier momento.',
    'contact.phone': 'Teléfono (Ventas)',
    'contact.support': 'Soporte al Cliente',
    'contact.email': 'Correo',
    'contact.address': 'Dirección',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
