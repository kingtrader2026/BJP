import { useState } from "react";
import { useLang } from "../i18n";
import { LotusIcon } from "./Lotus";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import api from "../api";

const NAV = [
  { id: "home", key: "nav_home" },
  { id: "leaders", key: "nav_leaders" },
  { id: "about", key: "nav_about" },
  { id: "footprints", key: "nav_footprints" },
  { id: "news", key: "nav_news" },
  { id: "events", key: "nav_events" },
  { id: "media", key: "nav_media" },
  { id: "contact", key: "nav_contact" },
];

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export const Header = () => {
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [leaders, setLeaders] = useState([]);

  const openSearch = async () => {
    setSearchOpen((v) => !v);
    if (!searchOpen && leaders.length === 0) {
      try {
        const { data } = await api.get("/leaders");
        setLeaders(data);
      } catch {}
    }
  };

  const q = query.trim().toLowerCase();
  const matchedSections = q ? NAV.filter((n) => t(n.key).toLowerCase().includes(q)) : [];
  const matchedLeaders = q ? leaders.filter((l) => l.name_hi.includes(query.trim()) || l.name_en.toLowerCase().includes(q)) : [];

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-16 md:h-20">
          <a href="#home" data-testid="header-logo" className="flex items-center gap-3 shrink-0" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>
            <span className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-saffron flex items-center justify-center ring-2 ring-saffron/30">
              <LotusIcon className="w-6 h-6 md:w-7 md:h-7" color="#fff" />
            </span>
            <span className="leading-tight">
              <span className="block font-heading font-800 font-bold text-navy text-base md:text-lg tracking-tight">{t("brand")}</span>
              <span className="block text-[11px] md:text-xs text-slate-500">{t("brand_sub")}</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1 mx-auto" data-testid="desktop-nav">
            {NAV.map((n) => (
              <button key={n.id} data-testid={`nav-link-${n.id}`} onClick={() => scrollTo(n.id)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-saffron-dark rounded-md hover:bg-saffron-50 transition-colors duration-200">
                {t(n.key)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <button data-testid="search-toggle-btn" onClick={openSearch} aria-label={t("search_title")}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-saffron-dark hover:bg-saffron-50 transition-colors duration-200">
              <Search className="w-5 h-5" />
            </button>
            <button data-testid="lang-toggle-btn" onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              className="h-9 px-3 rounded-full border border-slate-200 text-xs font-semibold text-navy hover:border-saffron hover:text-saffron-dark transition-colors duration-200">
              {lang === "hi" ? "EN" : "हिंदी"}
            </button>
            <button data-testid="header-donate-btn" onClick={() => scrollTo("donate")}
              className="hidden sm:inline-flex h-10 px-5 items-center rounded-full bg-saffron text-white text-sm font-semibold shadow-[0_6px_20px_rgb(255_153_51/0.35)] hover:bg-saffron-hover hover:-translate-y-0.5 active:scale-95 transition-[background-color,transform] duration-200">
              {t("donate")}
            </button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button data-testid="mobile-menu-btn" aria-label="Menu"
                  className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-navy hover:bg-saffron-50 transition-colors duration-200">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <SheetTitle className="sr-only">{t("brand")}</SheetTitle>
                <div className="flex items-center gap-3 mb-6 mt-2">
                  <span className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center">
                    <LotusIcon className="w-6 h-6" color="#fff" />
                  </span>
                  <div>
                    <p className="font-heading font-bold text-navy">{t("brand")}</p>
                    <p className="text-xs text-slate-500">{t("brand_sub")}</p>
                  </div>
                </div>
                <nav className="flex flex-col gap-1" data-testid="mobile-nav">
                  {NAV.map((n) => (
                    <button key={n.id} data-testid={`mobile-nav-link-${n.id}`}
                      onClick={() => { setMenuOpen(false); setTimeout(() => scrollTo(n.id), 150); }}
                      className="text-left px-4 py-3 rounded-lg text-slate-700 font-medium hover:bg-saffron-50 hover:text-saffron-dark transition-colors duration-200">
                      {t(n.key)}
                    </button>
                  ))}
                  <button data-testid="mobile-donate-btn" onClick={() => { setMenuOpen(false); setTimeout(() => scrollTo("donate"), 150); }}
                    className="mt-3 h-12 rounded-full bg-saffron text-white font-semibold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform] duration-200">
                    {t("donate")}
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-slate-200/60 bg-white/95 backdrop-blur-xl" data-testid="search-panel">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <input data-testid="search-input" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search")} autoFocus
                className="w-full h-12 px-5 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-saffron text-sm" />
              {q && (
                <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                  {matchedSections.map((n) => (
                    <button key={n.id} data-testid={`search-result-section-${n.id}`} onClick={() => { setSearchOpen(false); scrollTo(n.id); }}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-saffron-50 transition-colors duration-150">
                      {t(n.key)}
                    </button>
                  ))}
                  {matchedLeaders.map((l) => (
                    <button key={l.id} data-testid={`search-result-leader-${l.id}`} onClick={() => { setSearchOpen(false); scrollTo("leaders"); }}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-saffron-50 transition-colors duration-150">
                      {lang === "hi" ? l.name_hi : l.name_en} <span className="text-xs text-slate-400">— {lang === "hi" ? l.designation_hi : l.designation_en}</span>
                    </button>
                  ))}
                  {matchedSections.length === 0 && matchedLeaders.length === 0 && (
                    <p className="px-4 py-3 text-sm text-slate-400" data-testid="search-no-results">{t("no_results")}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="h-[3px] bg-gradient-to-r from-saffron via-saffron/70 to-lotusgreen/60" />
    </header>
  );
};
