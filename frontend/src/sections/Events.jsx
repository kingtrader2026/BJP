import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import api from "../api";

export const Events = () => {
  const { lang, t } = useLang();
  const [events, setEvents] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get("/events").then(({ data }) => setEvents(data)).catch(() => {});
  }, []);

  return (
    <section id="events" className="py-16 md:py-24 bg-white" data-testid="events-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="आगामी कार्यक्रम" en="Upcoming Events" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((ev, i) => (
            <motion.article key={ev.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/70 card-shadow hover:-translate-y-1 hover:card-shadow-lg transition-[transform,box-shadow] duration-300"
              data-testid={`event-card-${ev.id}`}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={ev.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy/90 text-white text-[11px] font-bold backdrop-blur-sm">
                  {lang === "hi" ? ev.category_hi : ev.category_en}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-navy leading-snug">{lang === "hi" ? ev.title_hi : ev.title_en}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{lang === "hi" ? ev.title_en : ev.title_hi}</p>
                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-saffron" />{ev.date}</p>
                  <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-saffron" />{ev.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-saffron" />{lang === "hi" ? ev.location_hi : ev.location_en}</p>
                </div>
                <button data-testid={`event-details-btn-${ev.id}`} onClick={() => setActive(ev)}
                  className="mt-4 w-full h-10 rounded-full border border-navy/20 text-navy text-sm font-semibold hover:bg-navy hover:text-white active:scale-95 transition-[background-color,color,transform] duration-200">
                  {t("details")}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-lg bg-white" data-testid="event-dialog">
          {active && (
            <div>
              <DialogTitle className="sr-only">{active.title_en}</DialogTitle>
              <div className="aspect-[16/9] -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-lg">
                <img src={active.image} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-navy text-white text-[11px] font-bold mb-3">
                {lang === "hi" ? active.category_hi : active.category_en}
              </span>
              <h3 className="font-heading text-2xl font-bold text-navy">{lang === "hi" ? active.title_hi : active.title_en}</h3>
              <p className="text-sm text-slate-500 mt-1">{lang === "hi" ? active.title_en : active.title_hi}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-saffron" />{active.date}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-saffron" />{active.time}</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-saffron" />{lang === "hi" ? active.location_hi : active.location_en} / {lang === "hi" ? active.location_en : active.location_hi}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
