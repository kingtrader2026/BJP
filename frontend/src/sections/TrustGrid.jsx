import { motion } from "framer-motion";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";

const TILES = Array.from({ length: 31 }, (_, i) => `/assets/trust/t${i}.jpg`);

export const TrustGrid = () => {
  const { lang } = useLang();
  return (
    <section id="trust" className="py-16 md:py-24 bg-navy relative overflow-hidden" data-testid="trust-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="विश्वसनीय नेतृत्व" en="Leadership You Can Trust" light />
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4" data-testid="trust-grid">
          {TILES.map((src, i) => (
            <motion.div key={src} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              className="rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-2 hover:ring-saffron hover:-translate-y-1 transition-[transform,box-shadow] duration-300 bg-navy-light"
              data-testid={`trust-tile-${i}`}>
              <img src={src} alt={lang === "hi" ? "पार्टी नेता" : "Party leader"} loading="lazy" className="w-full aspect-[3/4] object-cover" />
            </motion.div>
          ))}
        </div>
        <p className="text-center text-white/60 text-sm mt-8 max-w-2xl mx-auto">
          {lang === "hi"
            ? "देशभर के अनुभवी और जन-समर्पित नेताओं का परिवार — गाँव से लेकर राष्ट्रीय स्तर तक।"
            : "A family of experienced, people-first leaders — from the village level to the national stage."}
        </p>
      </div>
    </section>
  );
};
