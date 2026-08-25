import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import api from "../api";

export const Leaders = () => {
  const { lang, t } = useLang();
  const [leaders, setLeaders] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/leaders").then(({ data }) => setLeaders(data)).catch(() => {});
  }, []);

  return (
    <section id="leaders" className="py-16 md:py-24 bg-white" data-testid="leaders-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="हमारे नेता" en="Our Leaders" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {leaders.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group bg-white rounded-2xl border border-slate-200/70 card-shadow overflow-hidden hover:-translate-y-1 hover:card-shadow-lg transition-[transform,box-shadow] duration-300"
              data-testid={`leader-card-${l.id}`}>
              <div className="aspect-[4/5] overflow-hidden bg-saffron-50">
                <img src={l.photo} alt={l.name_en} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-navy text-lg leading-snug">{l.name_hi}</h3>
                <p className="text-sm text-slate-500">{l.name_en}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-saffron-50 text-saffron-dark text-xs font-semibold" data-testid={`leader-designation-${l.id}`}>
                  {lang === "hi" ? l.designation_hi : l.designation_en}
                </span>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">{lang === "hi" ? l.profile_hi : l.profile_en}</p>
                <button data-testid={`leader-profile-btn-${l.id}`} onClick={() => setActive(l)}
                  className="mt-4 w-full h-10 rounded-full border border-saffron text-saffron-dark text-sm font-semibold hover:bg-saffron hover:text-white active:scale-95 transition-[background-color,color,transform] duration-200">
                  {t("view_profile")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-md bg-white" data-testid="leader-profile-dialog">
          {active && (
            <div>
              <DialogTitle className="sr-only">{active.name_en}</DialogTitle>
              <div className="aspect-[4/3] -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-lg bg-saffron-50">
                <img src={active.photo} alt={active.name_en} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-navy">{active.name_hi}</h3>
              <p className="text-slate-500">{active.name_en}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-saffron-50 text-saffron-dark text-xs font-semibold">
                {lang === "hi" ? active.designation_hi : active.designation_en}
              </span>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">{lang === "hi" ? active.profile_hi : active.profile_en}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
