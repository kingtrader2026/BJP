import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import { LotusWatermark } from "../components/Lotus";
import api from "../api";

export const LeaderDonation = ({ onDonateForLeader }) => {
  const { lang, t } = useLang();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    api.get("/leaders?special=true").then(({ data }) => setLeaders(data)).catch(() => {});
  }, []);

  if (leaders.length === 0) return null;

  return (
    <section id="leader-donation" className="relative py-16 md:py-24 bg-saffron overflow-hidden" data-testid="leader-donation-section">
      <LotusWatermark className="-top-16 -left-16 w-72 h-72 md:w-96 md:h-96" />
      <LotusWatermark className="-bottom-20 -right-16 w-80 h-80 md:w-[28rem] md:h-[28rem]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="पार्टी नेताओं के लिए दान" en="Donation for Party Leaders" light />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {leaders.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden card-shadow-lg hover:-translate-y-1 transition-transform duration-300"
              data-testid={`special-leader-card-${l.id}`}>
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-40 shrink-0 aspect-[4/3] sm:aspect-auto overflow-hidden bg-saffron-50">
                  <img src={l.photo} alt={l.name_en} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-lotuspink/10 text-lotuspink text-[11px] font-bold uppercase tracking-wider mb-2" data-testid={`special-badge-${l.id}`}>
                    {t("special_badge")}
                  </span>
                  <h3 className="font-heading font-bold text-navy leading-snug">{l.name_hi}</h3>
                  <p className="text-sm text-slate-500">{l.name_en}</p>
                  <p className="mt-1 text-xs font-semibold text-saffron-dark">{lang === "hi" ? l.designation_hi : l.designation_en}</p>
                  <button data-testid={`special-donate-btn-${l.id}`}
                    onClick={() => { onDonateForLeader(l); document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform] duration-200">
                    <HeartHandshake className="w-4 h-4" />
                    {t("donate")}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
