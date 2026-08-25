import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "../i18n";

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1713001075225-8c490e800e29?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    badge_hi: "राष्ट्र प्रथम", badge_en: "Nation First",
    hi: "सबका साथ, सबका विकास, सबका विश्वास",
    en: "Together, let us build a strong, self-reliant and prosperous India.",
  },
  {
    img: "https://images.unsplash.com/photo-1760872646642-5c4cde741cfe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    badge_hi: "एकजुट भारत", badge_en: "United India",
    hi: "एकजुट भारत, श्रेष्ठ भारत",
    en: "A united India is a strong India — join the nation's largest people's movement.",
  },
  {
    img: "https://images.pexels.com/photos/39013505/pexels-photo-39013505.jpeg?auto=compress&cs=tinysrgb&w=1600",
    badge_hi: "जन सेवा", badge_en: "Public Service",
    hi: "जन सेवा ही हमारा संकल्प",
    en: "Service to the people is our pledge. Contribute to the mission.",
  },
];

export const Hero = () => {
  const { lang, t } = useLang();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    const timer = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => { emblaApi.off("select", onSelect); clearInterval(timer); };
  }, [emblaApi, onSelect]);

  return (
    <section id="home" className="relative" data-testid="hero-section">
      <div className="embla" ref={emblaRef} data-testid="hero-carousel">
        <div className="embla__container">
          {SLIDES.map((s, i) => (
            <div className="embla__slide" key={i} data-testid={`hero-slide-${i}`}>
              <div className="relative h-[70vh] md:h-[85vh] max-h-[80vh]">
                <img src={s.img} alt="" className="hero-slide-img absolute inset-0 w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                <div className="absolute inset-0 bg-navy/60" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                    <div className="max-w-2xl animate-fade-up">
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/90 text-white text-xs font-semibold uppercase tracking-widest mb-5" data-testid={`hero-badge-${i}`}>
                        {lang === "hi" ? s.badge_hi : s.badge_en}
                      </span>
                      <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight text-balance" data-testid={`hero-headline-${i}`}>
                        {s.hi}
                      </h1>
                      <p className="mt-4 text-base md:text-lg text-white/85 leading-relaxed max-w-xl">{s.en}</p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <button data-testid={`hero-donate-btn-${i}`} onClick={() => document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" })}
                          className="h-12 px-8 rounded-full bg-saffron text-white font-semibold shadow-[0_10px_30px_rgb(255_153_51/0.4)] hover:bg-saffron-hover hover:-translate-y-0.5 active:scale-95 transition-[background-color,transform] duration-200">
                          {t("donate")}
                        </button>
                        <button data-testid={`hero-about-btn-${i}`} onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                          className="h-12 px-8 rounded-full border-2 border-white/70 text-white font-semibold hover:bg-white hover:text-navy active:scale-95 transition-[background-color,color,transform] duration-200">
                          {t("nav_about")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button data-testid="hero-prev-btn" onClick={() => emblaApi?.scrollPrev()} aria-label="Previous"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center hover:bg-saffron transition-colors duration-200">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button data-testid="hero-next-btn" onClick={() => emblaApi?.scrollNext()} aria-label="Next"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center justify-center hover:bg-saffron transition-colors duration-200">
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2" data-testid="hero-indicators">
        {SLIDES.map((_, i) => (
          <button key={i} data-testid={`hero-indicator-${i}`} onClick={() => emblaApi?.scrollTo(i)} aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-[width,background-color] duration-300 ${selected === i ? "w-8 bg-saffron" : "w-2 bg-white/60"}`} />
        ))}
      </div>
    </section>
  );
};
