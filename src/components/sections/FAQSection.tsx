import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';

const faqs = [
  {
    question: 'How quickly can I get a dumpster delivered?',
    questionEs: '¿Qué tan rápido pueden entregar un contenedor?',
    answer: 'We offer same-day delivery for most Bay Area locations when you order before noon. Next-day delivery is available for all orders placed by 5 PM.',
    answerEs: 'Ofrecemos entrega el mismo día para la mayoría de las ubicaciones del Área de la Bahía cuando ordena antes del mediodía. La entrega al día siguiente está disponible para todos los pedidos realizados antes de las 5 PM.',
  },
  {
    question: 'What happens if I go over the weight limit?',
    questionEs: '¿Qué pasa si excedo el límite de peso?',
    answer: 'Each dumpster size has a weight limit. If you exceed it, you\'ll be charged an overage fee based on the extra weight. We\'ll always let you know the exact amount before pickup. Clean soil and concrete have specific weight limits due to their density.',
    answerEs: 'Cada tamaño de contenedor tiene un límite de peso. Si lo excede, se le cobrará una tarifa adicional basada en el peso extra. Siempre le informaremos el monto exacto antes de la recolección. La tierra limpia y el concreto tienen límites de peso específicos debido a su densidad.',
  },
  {
    question: 'Can I keep the dumpster longer than 7 days?',
    questionEs: '¿Puedo quedarmé el contenedor más de 7 días?',
    answer: 'Yes! The standard rental is 7 days, but you can extend as needed. Extra days are $50 per day. Just let us know before your rental period ends.',
    answerEs: '¡Sí! El alquiler estándar es de 7 días, pero puede extenderlo según sea necesario. Los días adicionales cuestan $50 por día. Solo avísenos antes de que termine su período de alquiler.',
  },
  {
    question: 'Can I overfill the dumpster?',
    questionEs: '¿Puedo llenar el contenedor por encima del borde?',
    answer: 'No, overfilling is not allowed for safety and legal reasons. Materials must not extend above the top of the dumpster walls. If overfilled, we\'ll need to remove excess materials before pickup, which may result in additional charges.',
    answerEs: 'No, no se permite llenar en exceso por razones de seguridad y legales. Los materiales no deben extenderse por encima de las paredes del contenedor. Si está sobrecargado, necesitaremos remover el exceso de materiales antes de la recolección, lo cual puede resultar en cargos adicionales.',
  },
  {
    question: 'How do I schedule a pickup?',
    questionEs: '¿Cómo programo una recolección?',
    answer: 'You can call, text, or use our online form to schedule pickup. We typically pick up within 1-3 business days of your request. For urgent pickups, call us directly.',
    answerEs: 'Puede llamar, enviar un mensaje de texto o usar nuestro formulario en línea para programar la recolección. Normalmente recogemos dentro de 1-3 días hábiles de su solicitud. Para recolecciones urgentes, llámenos directamente.',
  },
  {
    question: 'Do I need a permit for the dumpster?',
    questionEs: '¿Necesito un permiso para el contenedor?',
    answer: 'If the dumpster will be placed on your private property (driveway, yard), no permit is needed. If it must go on the street or public right-of-way, you\'ll need a permit from your city. We can advise you on the process.',
    answerEs: 'Si el contenedor se colocará en su propiedad privada (entrada, jardín), no se necesita permiso. Si debe ir en la calle o vía pública, necesitará un permiso de su ciudad. Podemos asesorarle sobre el proceso.',
  },
  {
    question: 'What materials are NOT allowed in the dumpster?',
    questionEs: '¿Qué materiales NO se permiten en el contenedor?',
    answer: 'Prohibited items include: hazardous waste, paint, chemicals, batteries, tires, appliances with freon, medical waste, and electronics. See our Materials page for a complete list.',
    answerEs: 'Los artículos prohibidos incluyen: desechos peligrosos, pintura, químicos, baterías, llantas, electrodomésticos con freón, desechos médicos y electrónicos. Vea nuestra página de Materiales para una lista completa.',
  },
  {
    question: 'Do you offer dumpsters for clean dirt or concrete?',
    questionEs: '¿Ofrecen contenedores para tierra limpia o concreto?',
    answer: 'Yes! We have specific dumpsters for clean dirt and concrete. These have different weight limits and pricing. Clean soil means no debris, roots, or contamination. Concrete cannot be mixed with other materials.',
    answerEs: '¡Sí! Tenemos contenedores específicos para tierra limpia y concreto. Estos tienen diferentes límites de peso y precios. Tierra limpia significa sin escombros, raíces o contaminación. El concreto no puede mezclarse con otros materiales.',
  },
];

export function FAQSection() {
  const { t, language } = useLanguage();

  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-foreground mb-4">{t('faq.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline py-5">
                {language === 'es' ? faq.questionEs : faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5">
                {language === 'es' ? faq.answerEs : faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">{t('faq.moreQuestions')}</p>
          <a
            href="tel:+15106802150"
            className="text-lg font-semibold text-primary hover:underline"
          >
            {t('faq.callUs')} (510) 680-2150
          </a>
        </div>
      </div>
    </section>
  );
}
