import { LotusIcon } from "./Lotus";

export const SectionHeading = ({ hi, en, light = false, center = true }) => (
  <div className={`mb-10 md:mb-14 ${center ? "text-center" : ""}`} data-testid="section-heading">
    <div className={`flex items-center gap-3 mb-3 ${center ? "justify-center" : ""}`}>
      <span className={`h-px w-10 ${light ? "bg-white/50" : "bg-saffron/50"}`} />
      <LotusIcon className={`w-6 h-6 ${light ? "" : ""}`} color={light ? "#fff" : "#FF9933"} />
      <span className={`h-px w-10 ${light ? "bg-white/50" : "bg-saffron/50"}`} />
    </div>
    <h2 className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance ${light ? "text-white" : "text-navy"}`}>
      {hi}
    </h2>
    <p className={`mt-2 text-base md:text-lg font-medium ${light ? "text-white/80" : "text-slate-500"}`}>{en}</p>
  </div>
);
