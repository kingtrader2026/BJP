import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import api from "../api";

const PAGE = 6;

export const News = () => {
  const { lang, t } = useLang();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (skip = 0) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/news?skip=${skip}&limit=${PAGE + 1}`);
      setTotal(data.total);
      setItems((prev) => (skip === 0 ? data.items : [...prev, ...data.items]));
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const featured = items.find((n) => n.featured) || items[0];
  const rest = items.filter((n) => n !== featured);

  const badge = (n) => (
    <span className="inline-block px-3 py-1 rounded-full bg-saffron text-white text-[11px] font-bold">
      {lang === "hi" ? n.category_hi : n.category_en}
    </span>
  );

  return (
    <section id="news" className="py-16 md:py-24 bg-background" data-testid="news-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="ताज़ा खबरें" en="Latest News" />
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {featured && (
            <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="group lg:row-span-2 bg-white rounded-2xl overflow-hidden border border-slate-200/70 card-shadow hover:card-shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => setActive(featured)} data-testid="featured-news-card">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={featured.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">{badge(featured)}
                  <span className="flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="w-3.5 h-3.5" />{featured.date}</span>
                </div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-navy leading-snug">{lang === "hi" ? featured.title_hi : featured.title_en}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">{lang === "hi" ? featured.desc_hi : featured.desc_en}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-saffron-dark">
                  {t("read_more")}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </motion.article>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {rest.slice(0, 2).map((n, i) => (
              <motion.article key={n.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex gap-4 bg-white rounded-2xl border border-slate-200/70 card-shadow p-4 hover:-translate-y-0.5 hover:card-shadow-lg transition-[transform,box-shadow] duration-300 cursor-pointer"
                onClick={() => setActive(n)} data-testid={`news-card-${n.id}`}>
                <div className="w-28 h-24 shrink-0 rounded-xl overflow-hidden">
                  <img src={n.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">{badge(n)}<span className="text-[11px] text-slate-400">{n.date}</span></div>
                  <h4 className="font-heading font-bold text-navy text-sm leading-snug line-clamp-2">{lang === "hi" ? n.title_hi : n.title_en}</h4>
                  <span className="mt-1.5 inline-block text-xs font-semibold text-saffron-dark">{t("read_more")}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rest.slice(2).map((n, i) => (
            <motion.article key={n.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/70 card-shadow hover:-translate-y-1 hover:card-shadow-lg transition-[transform,box-shadow] duration-300 cursor-pointer"
              onClick={() => setActive(n)} data-testid={`news-card-${n.id}`}>
              <div className="aspect-[16/10] overflow-hidden">
                <img src={n.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">{badge(n)}<span className="text-[11px] text-slate-400">{n.date}</span></div>
                <h4 className="font-heading font-bold text-navy text-sm leading-snug line-clamp-2">{lang === "hi" ? n.title_hi : n.title_en}</h4>
                <span className="mt-2 inline-block text-xs font-semibold text-saffron-dark">{t("read_more")}</span>
              </div>
            </motion.article>
          ))}
        </div>

        {items.length < total && (
          <div className="text-center mt-10">
            <button data-testid="news-load-more-btn" onClick={() => load(items.length)} disabled={loading}
              className="h-12 px-10 rounded-full border-2 border-saffron text-saffron-dark font-semibold hover:bg-saffron hover:text-white active:scale-95 transition-[background-color,color,transform] duration-200 disabled:opacity-60">
              {loading ? t("sending") : t("load_more")}
            </button>
          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-2xl bg-white max-h-[85vh] overflow-y-auto" data-testid="news-dialog">
          {active && (
            <div>
              <DialogTitle className="sr-only">{active.title_en}</DialogTitle>
              <div className="aspect-[16/9] -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-lg">
                <img src={active.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-3 mb-3">{badge(active)}
                <span className="flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="w-3.5 h-3.5" />{active.date}</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-navy leading-snug">{lang === "hi" ? active.title_hi : active.title_en}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{lang === "hi" ? active.title_en : active.title_hi}</p>
              <p className="mt-4 text-slate-600 leading-relaxed">{lang === "hi" ? active.desc_hi : active.desc_en}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
