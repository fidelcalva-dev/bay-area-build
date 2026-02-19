import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function LocalYardAdvantageSection() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container-wide max-w-3xl mx-auto text-center">
        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
          >
            Strategically Positioned Near Disposal Facilities
          </motion.h2>

          <motion.div variants={fadeUp} className="space-y-4 text-muted-foreground text-lg leading-relaxed">
            <p>
              We position our yards near transfer stations and disposal sites.
              This reduces travel time, improves delivery windows, and keeps operations efficient.
            </p>
            <p>
              Efficiency is how we maintain professional service.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
