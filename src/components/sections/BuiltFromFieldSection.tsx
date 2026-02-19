import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function BuiltFromFieldSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-foreground leading-tight"
            >
              Built From the Field. Not Just a Website.
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                We started in debris removal and hauling in 2009.
                In 2015, we specialized in dumpster rental and material delivery for contractors.
              </p>
              <p>
                We operate real trucks.
                We run real local yards.
                We manage real schedules.
              </p>
              <p>
                Today, we combine field experience with structured systems and automation to deliver a more precise and professional service.
              </p>
            </motion.div>
          </motion.div>

          {/* Right - Image placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="bg-secondary rounded-lg aspect-[4/3] flex items-center justify-center"
          >
            <span className="text-muted-foreground text-sm">Field operations image</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
