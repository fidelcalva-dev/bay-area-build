import { motion } from 'framer-motion';
import { Crosshair, Clock, DollarSign, Radio, ClipboardCheck } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CAPABILITIES = [
  { icon: Crosshair, text: 'Match you with the closest yard' },
  { icon: Clock, text: 'Calculate realistic service timing' },
  { icon: DollarSign, text: 'Provide transparent pricing' },
  { icon: Radio, text: 'Coordinate dispatch clearly' },
  { icon: ClipboardCheck, text: 'Maintain service accountability' },
];

export function SmartSystemsSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-wide max-w-3xl mx-auto">
        <motion.div
          className="space-y-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Technology Supporting Real Operations
            </h2>
            <p className="text-lg text-muted-foreground">
              We use structured systems to:
            </p>
          </motion.div>

          <motion.ul variants={fadeUp} className="space-y-0 divide-y divide-border">
            {CAPABILITIES.map(({ icon: Icon, text }) => (
              <motion.li
                key={text}
                variants={fadeUp}
                className="flex items-center gap-4 py-4"
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-lg">{text}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p variants={fadeUp} className="text-center text-muted-foreground text-lg pt-2">
            Technology doesn't replace experience. It enhances it.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
