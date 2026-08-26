import { motion } from "framer-motion";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";

const FOUNDERS = [
  {
    hi: "डॉ. श्यामा प्रसाद मुखर्जी", en: "Dr. Syama Prasad Mookherjee",
    role_hi: "संस्थापक, भारतीय जनसंघ (1951)", role_en: "Founder, Bharatiya Jana Sangh (1951)",
  },
  {
    hi: "पंडित दीनदयाल उपाध्याय", en: "Pandit Deendayal Upadhyaya",
    role_hi: "प्रणेता, एकात्म मानववाद व अंत्योदय", role_en: "Ideologue of Integral Humanism & Antyodaya",
  },
];

export const Foundation = () => {
  const { lang } = useLang();
  return (
    <section id="foundation" className="py-16 md:py-24 bg-white" data-testid="foundation-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden card-shadow-lg border border-saffron/20" data-testid="foundation-image-card">
            <img src="/assets/foundation.jpg" alt="Dr. Syama Prasad Mookherjee and Pandit Deendayal Upadhyaya" loading="lazy"
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <SectionHeading hi="हमारी नींव" en="Our Foundation" center={false} />
            <p className="text-slate-600 leading-relaxed -mt-6">
              {lang === "hi"
                ? "1951 में डॉ. श्यामा प्रसाद मुखर्जी द्वारा स्थापित भारतीय जनसंघ से लेकर 1980 में भारतीय जनता पार्टी के गठन तक — पंडित दीनदयाल उपाध्याय के 'एकात्म मानववाद' और 'अंत्योदय' के विचार हमारी विचारधारा की आधारशिला हैं।"
                : "From the Bharatiya Jana Sangh founded by Dr. Syama Prasad Mookherjee in 1951 to the formation of the Bharatiya Janta Party in 1980 — Pandit Deendayal Upadhyaya's philosophy of Integral Humanism and Antyodaya remains the cornerstone of our ideology."}
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed">
              {lang === "hi"
                ? "हम अंतिम पंक्ति में खड़े व्यक्ति के उत्थान को ही विकास की असली कसौटी मानते हैं।"
                : "We measure true development by the upliftment of the person standing in the last row."}
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {FOUNDERS.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-saffron-50 border border-saffron/20" data-testid={`founder-card-${i}`}>
                  <p className="font-heading font-bold text-navy leading-snug">{lang === "hi" ? f.hi : f.en}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{lang === "hi" ? f.en : f.hi}</p>
                  <p className="mt-2 text-xs font-semibold text-saffron-dark">{lang === "hi" ? f.role_hi : f.role_en}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
