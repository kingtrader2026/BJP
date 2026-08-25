import { useEffect, useState } from "react";
import { Search, Users, Building2, Map, User } from "lucide-react";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import api from "../api";

const INDIA_PATH = "M170 18 C160 30 145 38 132 52 C120 66 112 84 106 104 C98 128 92 152 84 178 C76 202 66 218 58 232 C52 244 56 256 70 262 C82 268 92 276 96 292 C100 312 104 336 112 360 C120 384 130 408 140 428 C146 436 154 434 160 424 C172 402 184 380 196 356 C208 332 224 312 244 296 C262 282 276 268 284 252 C292 236 292 222 284 210 C296 204 312 196 330 188 C346 181 358 172 362 162 C352 154 338 150 322 152 C308 154 296 158 288 162 C278 148 268 128 258 106 C248 84 236 62 222 44 C208 28 190 20 170 18 Z";

export const Footprints = () => {
  const { lang, t } = useLang();
  const [states, setStates] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/states").then(({ data }) => {
      setStates(data);
      if (data.length) setSelected(data[0]);
    }).catch(() => {});
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q ? states.filter((s) => s.name_hi.includes(query.trim()) || s.name_en.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) : states;

  return (
    <section id="footprints" className="py-16 md:py-24 bg-white" data-testid="footprints-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="हमारी पहुंच" en="Our Footprints" />
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="relative mx-auto w-full max-w-md" data-testid="india-map">
            <svg viewBox="0 0 400 440" className="w-full h-auto" role="img" aria-label="India map">
              <path d={INDIA_PATH} fill="#FFF1E2" stroke="#FF9933" strokeWidth="2.5" strokeLinejoin="round" />
              {states.map((s) => (
                <g key={s.code} onClick={() => setSelected(s)} className="cursor-pointer" data-testid={`map-dot-${s.code}`}>
                  <circle cx={s.x} cy={s.y} r={selected?.code === s.code ? 10 : 7} fill={selected?.code === s.code ? "#FF9933" : "#0B1B3D"} opacity="0.9" />
                  {selected?.code === s.code && <circle cx={s.x} cy={s.y} r="16" fill="none" stroke="#FF9933" strokeWidth="2" className="animate-pulse-dot" />}
                </g>
              ))}
            </svg>
            <p className="text-center text-xs text-slate-400 mt-2">{t("select_state")}</p>
          </div>

          <div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input data-testid="state-search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search_state")}
                className="w-full h-12 pl-11 pr-4 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-saffron" />
            </div>
            <div className="flex flex-wrap gap-2 mb-6 max-h-36 overflow-y-auto pr-1" data-testid="state-selector">
              {filtered.map((s) => (
                <button key={s.code} data-testid={`state-chip-${s.code}`} onClick={() => setSelected(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-[background-color,color,border-color] duration-200 border active:scale-95 ${selected?.code === s.code ? "bg-saffron text-white border-saffron" : "bg-white text-slate-600 border-slate-200 hover:border-saffron hover:text-saffron-dark"}`}>
                  {lang === "hi" ? s.name_hi : s.name_en}
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-slate-400 py-2">{t("no_results")}</p>}
            </div>

            {selected && (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/70 card-shadow p-6 md:p-8" data-testid="state-detail-panel">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-navy">{lang === "hi" ? selected.name_hi : selected.name_en}</h3>
                    <p className="text-sm text-slate-500">{lang === "hi" ? selected.name_en : selected.name_hi} • {selected.capital}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-navy text-white text-sm font-bold font-heading">{selected.code}</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">{t("key_stats")}</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Users, label: t("members"), value: selected.members, tid: "members" },
                    { icon: Building2, label: t("offices"), value: selected.offices, tid: "offices" },
                    { icon: Map, label: t("districts"), value: selected.districts, tid: "districts" },
                  ].map((s2) => (
                    <div key={s2.tid} className="bg-white rounded-xl border border-slate-200/70 p-4 text-center" data-testid={`state-stat-${s2.tid}`}>
                      <s2.icon className="w-5 h-5 text-saffron mx-auto mb-2" />
                      <p className="font-heading text-lg font-bold text-navy leading-none">{s2.value}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{s2.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-saffron" />
                    <span className="text-slate-500">{t("regional_leader")}:</span>
                    <span className="font-semibold text-navy" data-testid="state-regional-leader">{lang === "hi" ? selected.regional_leader_hi : selected.regional_leader_en}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-saffron" />
                    <span className="text-slate-500">{t("presence_since")}:</span>
                    <span className="font-semibold text-navy">{selected.since}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
