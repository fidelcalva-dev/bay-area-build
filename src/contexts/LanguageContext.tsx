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
    'hero.title': 'Fast & Reliable Dumpster Rentals',
    'hero.subtitle': 'in Northern California',
    'hero.description': 'Instant pricing. Contractor-friendly. No hidden fees.',
    'hero.cta.quote': 'Get Instant Quote',
    'hero.cta.call': 'Call Now',
    'hero.cta.order': 'Order Now',
    'hero.spanish': 'Hablamos Español',
    'hero.trust': 'Google Guaranteed',
    'hero.benefit.sameDay': 'Same-Day Delivery',
    'hero.benefit.transparent': 'Transparent Pricing',
    'hero.benefit.onTime': 'On-Time Guaranteed',
    'hero.stats.counties': 'Counties Served',
    'hero.stats.customers': 'Happy Customers',
    'hero.stats.delivery': 'Delivery',
    
    // Features
    'features.sameDay': 'Same-Day Delivery',
    'features.sameDayDesc': 'Need a dumpster today? We deliver.',
    'features.transparent': 'Transparent Pricing',
    'features.transparentDesc': 'No hidden fees. Ever.',
    'features.onTime': 'On-Time Service',
    'features.onTimeDesc': 'We show up when we say we will.',
    'features.textUpdates': 'Text Updates',
    'features.textUpdatesDesc': 'Track your delivery via SMS.',
    'features.title': 'Why Choose Us?',
    'features.subtitle': 'Thousands of homeowners and contractors rely on Calsan Dumpsters Pro for reliable, hassle-free dumpster rentals.',
    'features.googleGuaranteed': 'Google Guaranteed',
    'features.googleGuaranteedDesc': 'Protected by Google Local Services.',
    'features.ecoFriendly': 'Eco-Friendly',
    'features.ecoFriendlyDesc': 'We recycle and dispose responsibly.',
    
    // How It Works
    'howItWorks.title': 'How It Works',
    'howItWorks.subtitle': 'Renting a dumpster is easy. Four simple steps from quote to haul-away.',
    'howItWorks.step1.title': 'Get a Quote',
    'howItWorks.step1.description': 'Tell us your project type, location, and preferred size. Get instant pricing in seconds.',
    'howItWorks.step2.title': 'We Deliver',
    'howItWorks.step2.description': 'Same-day or scheduled delivery. We place the dumpster exactly where you need it.',
    'howItWorks.step3.title': 'Fill It Up',
    'howItWorks.step3.description': 'Take your time—standard rental is 7 days. Load at your own pace.',
    'howItWorks.step4.title': 'We Haul Away',
    'howItWorks.step4.description': 'Call or text when ready. We pick up within 1-3 business days.',
    'howItWorks.cta': 'Get Your Instant Quote',
    
    // CTA Section
    'ctaSection.title': 'Ready to Get Started?',
    'ctaSection.subtitle': 'Book your dumpster in minutes. Same-day delivery available for orders placed before noon.',
    
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
    'sizes.subtitle': 'From small cleanouts to major construction projects. Find the perfect size for your needs.',
    'sizes.perfectFor': 'Perfect for:',
    'sizes.dimensions': 'Dimensions:',
    'sizes.choose': 'Choose This Size',
    'sizes.yards': 'Yard',
    'sizes.from': 'From',
    'sizes.viewAll': 'View All Sizes',
    
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
    'faq.subtitle': 'Everything you need to know about our dumpster rental services.',
    'faq.moreQuestions': 'Still have questions?',
    'faq.callUs': 'Call us at',
    
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
    'hero.title': 'Alquiler de Contenedores Rápido y Confiable',
    'hero.subtitle': 'en el Norte de California',
    'hero.description': 'Precios instantáneos. Ideal para contratistas. Sin cargos ocultos.',
    'hero.cta.quote': 'Cotización Gratis',
    'hero.cta.call': 'Llamar Ahora',
    'hero.cta.order': 'Ordenar Ahora',
    'hero.spanish': 'Hablamos Español',
    'hero.trust': 'Garantizado por Google',
    'hero.benefit.sameDay': 'Entrega el Mismo Día',
    'hero.benefit.transparent': 'Precios Transparentes',
    'hero.benefit.onTime': 'Puntualidad Garantizada',
    'hero.stats.counties': 'Condados',
    'hero.stats.customers': 'Clientes Felices',
    'hero.stats.delivery': 'Entrega',
    
    // Features
    'features.sameDay': 'Entrega el Mismo Día',
    'features.sameDayDesc': '¿Necesita un contenedor hoy? Lo entregamos.',
    'features.transparent': 'Precios Transparentes',
    'features.transparentDesc': 'Sin cargos ocultos. Nunca.',
    'features.onTime': 'Servicio Puntual',
    'features.onTimeDesc': 'Llegamos cuando decimos.',
    'features.textUpdates': 'Actualizaciones por Texto',
    'features.textUpdatesDesc': 'Siga su entrega por SMS.',
    'features.title': '¿Por Qué Elegirnos?',
    'features.subtitle': 'Miles de propietarios y contratistas confían en Calsan Dumpsters Pro para alquileres confiables.',
    'features.googleGuaranteed': 'Garantizado por Google',
    'features.googleGuaranteedDesc': 'Protegido por Servicios Locales de Google.',
    'features.ecoFriendly': 'Ecológico',
    'features.ecoFriendlyDesc': 'Reciclamos y desechamos responsablemente.',
    
    // How It Works
    'howItWorks.title': 'Cómo Funciona',
    'howItWorks.subtitle': 'Alquilar un contenedor es fácil. Cuatro pasos simples desde la cotización hasta el retiro.',
    'howItWorks.step1.title': 'Obtén una Cotización',
    'howItWorks.step1.description': 'Cuéntanos tu proyecto, ubicación y tamaño preferido. Obtén precios al instante.',
    'howItWorks.step2.title': 'Lo Entregamos',
    'howItWorks.step2.description': 'Entrega el mismo día o programada. Colocamos el contenedor donde lo necesites.',
    'howItWorks.step3.title': 'Llénalo',
    'howItWorks.step3.description': 'Toma tu tiempo—el alquiler estándar es de 7 días. Carga a tu propio ritmo.',
    'howItWorks.step4.title': 'Lo Retiramos',
    'howItWorks.step4.description': 'Llama o envía un mensaje cuando estés listo. Recogemos en 1-3 días hábiles.',
    'howItWorks.cta': 'Obtén Tu Cotización Gratis',
    
    // CTA Section
    'ctaSection.title': '¿Listo para Empezar?',
    'ctaSection.subtitle': 'Reserva tu contenedor en minutos. Entrega el mismo día para pedidos antes del mediodía.',
    
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
    'sizes.subtitle': 'Desde limpiezas pequeñas hasta grandes proyectos de construcción. Encuentra el tamaño perfecto.',
    'sizes.perfectFor': 'Perfecto para:',
    'sizes.dimensions': 'Dimensiones:',
    'sizes.choose': 'Elegir Este Tamaño',
    'sizes.yards': 'Yardas',
    'sizes.from': 'Desde',
    'sizes.viewAll': 'Ver Todos los Tamaños',
    
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
    'faq.subtitle': 'Todo lo que necesita saber sobre nuestros servicios de alquiler de contenedores.',
    'faq.moreQuestions': '¿Aún tiene preguntas?',
    'faq.callUs': 'Llámenos al',
    
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
