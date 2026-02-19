import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AIChatTeaserSection() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container-wide max-w-2xl mx-auto text-center">
        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground">
            Need Help Choosing?
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
            Our intelligent assistant can guide you step-by-step.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Button asChild variant="cta" size="lg" className="text-lg font-bold">
              <a href="/quote">Start Guided Quote</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
