import { motion } from "framer-motion";
import { Target, Eye, HeartHandshake, Landmark } from "lucide-react";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";

const BLOCKS = [
  {
    icon: Landmark,
    hi: "पार्टी परिचय", en: "Party Introduction",
    text_hi: "भारतीय जनता पार्टी राष्ट्र सेवा के संकल्प के साथ स्थापित एक राष्ट्रवादी राजनीतिक दल है, जो करोड़ों कार्यकर्ताओं के साथ देश के हर कोने में सक्रिय है।",
    text_en: "Bharatiya Janta Party is a nationalist political organisation founded on the pledge of national service, active in every corner of the country with crores of dedicated workers.",
    img: "https://images.unsplash.com/photo-1760872646642-5c4cde741cfe?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
  },
  {
    icon: Target,
    hi: "हमारा मिशन", en: "Our Mission",
    text_hi: "हर नागरिक तक विकास पहुँचाना, गरीब और किसान का सशक्तिकरण, और एक आत्मनिर्भर भारत का निर्माण।",
    text_en: "To take development to every citizen, empower the poor and farmers, and build a self-reliant India.",
    img: "https://images.pexels.com/photos/39013505/pexels-photo-39013505.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    icon: Eye,
    hi: "हमारी दृष्टि", en: "Our Vision",
    text_hi: "एक ऐसा भारत जो सांस्कृतिक गौरव और आधुनिक प्रगति का संगम हो — विश्व का अग्रणी राष्ट्र।",
    text_en: "An India that blends cultural pride with modern progress — a leading nation of the world.",
    img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
  },
  {
    icon: HeartHandshake,
    hi: "हमारे मूल्य", en: "Our Values",
    text_hi: "राष्ट्र प्रथम, संस्कार और संस्कृति, पारदर्शिता, अंतर्योदय — अंतिम व्यक्ति का उत्थान।",
    text_en: "Nation first, culture and character, transparency, and Antyodaya — the rise of the last person in the queue.",
    img: "https://images.unsplash.com/photo-1594882471743-2758d2ce5f00?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
  },
];

const MILESTONES = [
  { year: "1980", hi: "पार्टी की स्थापना", en: "Party founded" },
  { year: "1996", hi: "पहली राष्ट्रीय सरकार", en: "First national government" },
  { year: "2014", hi: "ऐतिहासिक जनादेश", en: "Historic people's mandate" },
  { year: "2019", hi: "पुनः पूर्ण बहुमत", en: "Full majority again" },
  { year: "2026", hi: "30+ करोड़ सदस्यता अभियान", en: "30+ crore membership drive" },
];

export const About = () => {
  const { lang } = useLang();
  return (
    <section id="about" className="py-16 md:py-24 bg-background" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="हमारे बारे में" en="About Us" />
        <div className="space-y-12 md:space-y-16">
          {BLOCKS.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className={`grid md:grid-cols-2 gap-6 md:gap-10 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              data-testid={`about-block-${i}`}>
              <div className="rounded-2xl overflow-hidden card-shadow aspect-[16/10]">
                <img src={b.img} alt={b.en} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div>
                <span className="inline-flex w-12 h-12 rounded-xl bg-saffron-50 items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-saffron-dark" />
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy">{lang === "hi" ? b.hi : b.en}</h3>
                <p className="text-sm font-medium text-saffron-dark mt-1">{lang === "hi" ? b.en : b.hi}</p>
                <p className="mt-4 text-slate-600 leading-relaxed">{lang === "hi" ? b.text_hi : b.text_en}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 bg-navy rounded-3xl p-8 md:p-12" data-testid="milestones-block">
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            {lang === "hi" ? "हमारा इतिहास — प्रमुख मील के पत्थर" : "Our History — Key Milestones"}
          </h3>
          <p className="text-white/60 text-sm mb-8">{lang === "hi" ? "Key Milestones" : "प्रमुख मील के पत्थर"}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {MILESTONES.map((m, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-saffron/60" data-testid={`milestone-${i}`}>
                <p className="font-heading text-2xl font-bold text-saffron">{m.year}</p>
                <p className="mt-1 text-sm text-white/85">{lang === "hi" ? m.hi : m.en}</p>
                <p className="text-xs text-white/50">{lang === "hi" ? m.en : m.hi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
