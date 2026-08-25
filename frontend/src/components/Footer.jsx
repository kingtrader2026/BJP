import { useState } from "react";
import { useLang } from "../i18n";
import { LotusIcon } from "./Lotus";
import { Facebook, Twitter, Youtube, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "../api";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export const Footer = () => {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submitContact = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success(lang === "hi" ? "आपका संदेश मिल गया। धन्यवाद!" : "Message received. Thank you!");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error(lang === "hi" ? "संदेश नहीं भेजा जा सका" : "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const links = [
    { id: "leaders", key: "nav_leaders" },
    { id: "about", key: "nav_about" },
    { id: "news", key: "nav_news" },
    { id: "events", key: "nav_events" },
    { id: "media", key: "nav_media" },
    { id: "donate", key: "donate" },
  ];

  return (
    <footer id="contact" className="bg-navy text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-full bg-saffron flex items-center justify-center">
              <LotusIcon className="w-7 h-7" color="#fff" />
            </span>
            <div>
              <p className="font-heading font-bold text-lg leading-tight">{t("brand")}</p>
              <p className="text-xs text-white/60">{t("brand_sub")}</p>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-5">{t("tagline")}</p>
          <p className="text-xs uppercase tracking-widest text-white/50 mb-3">{t("follow_us")}</p>
          <div className="flex gap-2">
            {[
              { icon: Facebook, id: "facebook" },
              { icon: Twitter, id: "twitter" },
              { icon: Youtube, id: "youtube" },
              { icon: Instagram, id: "instagram" },
            ].map(({ icon: Icon, id }) => (
              <a key={id} href="#" data-testid={`social-${id}`} aria-label={id} onClick={(e) => e.preventDefault()}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-saffron hover:-translate-y-0.5 transition-[background-color,transform] duration-200">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-saffron mb-4 text-sm uppercase tracking-widest">{t("quick_links")}</h4>
          <ul className="space-y-2.5">
            {links.map((l) => (
              <li key={l.id}>
                <button data-testid={`footer-link-${l.id}`} onClick={() => scrollTo(l.id)}
                  className="text-sm text-white/75 hover:text-saffron transition-colors duration-150">
                  {t(l.key)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-saffron mb-4 text-sm uppercase tracking-widest">{t("contact_us")}</h4>
          <ul className="space-y-3 text-sm text-white/75">
            <li className="flex gap-3"><MapPin className="w-4 h-4 mt-0.5 text-saffron shrink-0" />{t("address")}</li>
            <li className="flex gap-3"><Phone className="w-4 h-4 mt-0.5 text-saffron shrink-0" />+91 11 2300 0000</li>
            <li className="flex gap-3"><Mail className="w-4 h-4 mt-0.5 text-saffron shrink-0" />connect@bharatiyajantaparty.in</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-saffron mb-4 text-sm uppercase tracking-widest">{t("contact_us")}</h4>
          <form onSubmit={submitContact} className="space-y-2.5" data-testid="footer-contact-form">
            <input data-testid="contact-name-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("full_name")} className="w-full h-10 px-4 rounded-lg bg-white/10 border border-white/15 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-saffron" />
            <input data-testid="contact-email-input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("email")} className="w-full h-10 px-4 rounded-lg bg-white/10 border border-white/15 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-saffron" />
            <textarea data-testid="contact-message-input" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={lang === "hi" ? "आपका संदेश" : "Your message"} rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-saffron resize-none" />
            <button data-testid="contact-submit-btn" disabled={sending}
              className="h-10 px-6 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron-hover active:scale-95 transition-[background-color,transform] duration-200 disabled:opacity-60">
              {sending ? t("sending") : lang === "hi" ? "संदेश भेजें" : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p data-testid="footer-copyright">© 2026 {t("brand")} • {t("rights")}</p>
          <div className="flex gap-5">
            <a href="#" data-testid="footer-privacy-link" onClick={(e) => e.preventDefault()} className="hover:text-saffron transition-colors duration-150">{t("privacy")}</a>
            <a href="#" data-testid="footer-terms-link" onClick={(e) => e.preventDefault()} className="hover:text-saffron transition-colors duration-150">{t("terms")}</a>
          </div>
        </div>
      </div>
      <div className="flex h-2" data-testid="footer-tricolor-strip">
        <div className="flex-1 bg-saffron" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-lotusgreen" />
      </div>
    </footer>
  );
};
