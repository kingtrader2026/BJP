import { useEffect, useState } from "react";
import { ShieldCheck, QrCode, BadgeCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import api, { formatApiError } from "../api";

const MIN = 10001;
const PRESETS = [10001, 25001, 51001, 101001];
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

export const Donation = ({ donationLeader, clearDonationLeader }) => {
  const { lang, t } = useLang();
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ name: "", mobile: "", email: "", city: "", state: "" });
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (donationLeader) setStep("form");
  }, [donationLeader]);

  const amt = Number(amount) || 0;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const proceed = (e) => {
    e.preventDefault();
    if (amt < MIN) {
      toast.error(t("min_error"));
      return;
    }
    setStep("pay");
  };

  const confirmPaid = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/donations", {
        ...form, amount: amt,
        leader_name: donationLeader ? (lang === "hi" ? donationLeader.name_hi : donationLeader.name_en) : null,
      });
      setReceipt(data);
      setStep("done");
      clearDonationLeader();
      toast.success(t("donation_success"));
    } catch (err) {
      toast.error(formatApiError(err, t("min_error")));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = () => {
    const lines = [
      "=========================================",
      "  Bharatiya Janta Party / भारतीय जनता पार्टी",
      "  Donation Receipt / दान रसीद",
      "=========================================",
      `Receipt No: ${receipt.receipt_no}`,
      `Date: ${new Date(receipt.created_at).toLocaleString("en-IN")}`,
      `Name: ${receipt.name}`,
      `Mobile: ${receipt.mobile}`,
      `Email: ${receipt.email}`,
      `City/State: ${receipt.city}, ${receipt.state}`,
      receipt.leader_name ? `For Leader: ${receipt.leader_name}` : null,
      `Amount: ${fmt(receipt.amount)}`,
      `Status: ${receipt.status} (UPI payment verification pending)`,
      "=========================================",
      "  Thank you for your contribution!",
      "  आपके योगदान के लिए धन्यवाद!",
    ].filter(Boolean).join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `BJP-Receipt-${receipt.receipt_no}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const reset = () => {
    setStep("form");
    setReceipt(null);
    setAmount("");
    setForm({ name: "", mobile: "", email: "", city: "", state: "" });
  };

  const inputCls = "w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-saffron focus:border-saffron transition-shadow duration-200";

  return (
    <section id="donate" className="py-16 md:py-24 bg-saffron-50/60" data-testid="donation-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="₹10,001 से योगदान करें" en="Contribute from ₹10,001" />
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-navy leading-snug">
              {lang === "hi" ? "राष्ट्र निर्माण में आपका योगदान" : "Your contribution to nation building"}
            </h3>
            <p className="mt-3 text-slate-600 leading-relaxed">
              {lang === "hi"
                ? "आपका हर योगदान पार्टी के जन-कल्याण कार्यों, संगठन विस्तार और जनसेवा अभियानों को मजबूत करता है।"
                : "Every contribution strengthens the party's public welfare work, organisational reach and service campaigns."}
            </p>
            <ul className="mt-6 space-y-3">
              {[t("secure_note"), lang === "hi" ? "न्यूनतम राशि ₹10,001 — शुभ संकल्प के साथ" : "Minimum ₹10,001 — an auspicious beginning",
                lang === "hi" ? "तुरंत डाउनलोड योग्य रसीद" : "Instant downloadable receipt"].map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-lotusgreen shrink-0 mt-0.5" />{point}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/70 card-shadow-lg p-6 md:p-8" data-testid="donation-card">
            {donationLeader && step === "form" && (
              <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-lotuspink/5 border border-lotuspink/20" data-testid="donation-leader-context">
                <img src={donationLeader.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-lotuspink">{t("special_badge")}</span> — {t("donate_for")} {lang === "hi" ? donationLeader.name_hi : donationLeader.name_en}
                </p>
              </div>
            )}

            {step === "form" && (
              <form onSubmit={proceed} className="space-y-4" data-testid="donation-form">
                <div className="grid grid-cols-2 gap-3">
                  {PRESETS.map((p) => (
                    <button type="button" key={p} data-testid={`amount-preset-${p}`} onClick={() => setAmount(String(p))}
                      className={`h-12 rounded-xl border text-sm font-bold transition-[background-color,color,border-color] duration-200 active:scale-95 ${amt === p ? "bg-saffron text-white border-saffron" : "border-slate-200 text-navy hover:border-saffron hover:text-saffron-dark"}`}>
                      {fmt(p)}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t("custom_amount")} ({lang === "hi" ? "न्यूनतम" : "min"} {fmt(MIN)})</label>
                  <input data-testid="donation-amount-input" type="number" min={MIN} value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder={fmt(MIN)} className={inputCls} />
                  {amount && amt < MIN && <p className="mt-1.5 text-xs font-medium text-red-500" data-testid="amount-min-error">{t("min_error")}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input data-testid="donor-name-input" required value={form.name} onChange={set("name")} placeholder={t("full_name")} className={inputCls} />
                  <input data-testid="donor-mobile-input" required pattern="[0-9]{10}" value={form.mobile} onChange={set("mobile")} placeholder={t("mobile")} className={inputCls} />
                  <input data-testid="donor-email-input" required type="email" value={form.email} onChange={set("email")} placeholder={t("email")} className={inputCls} />
                  <input data-testid="donor-city-input" required value={form.city} onChange={set("city")} placeholder={t("city")} className={inputCls} />
                  <input data-testid="donor-state-input" required value={form.state} onChange={set("state")} placeholder={t("state")} className={`${inputCls} sm:col-span-2`} />
                </div>
                <button data-testid="donation-submit-btn" disabled={amt < MIN}
                  className="w-full h-13 py-3.5 rounded-full bg-saffron text-white font-bold shadow-[0_10px_30px_rgb(255_153_51/0.35)] hover:bg-saffron-hover hover:-translate-y-0.5 active:scale-95 transition-[background-color,transform] duration-200 disabled:opacity-50 disabled:hover:translate-y-0">
                  {t("submit_donation")} {amt >= MIN ? `• ${fmt(amt)}` : ""}
                </button>
                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />{t("secure_note")}
                </p>
              </form>
            )}

            {step === "pay" && (
              <div className="text-center" data-testid="payment-qr-step">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-50 text-saffron-dark text-sm font-bold mb-4">
                  <QrCode className="w-4 h-4" />{fmt(amt)}
                </div>
                <h3 className="font-heading text-xl font-bold text-navy">
                  {lang === "hi" ? "UPI से स्कैन कर भुगतान करें" : "Scan & Pay with any UPI app"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">GPay • PhonePe • Paytm • BHIM</p>
                <div className="mt-5 inline-block p-4 bg-white rounded-2xl border-2 border-saffron/30 card-shadow">
                  <img src="/payment-qr.jpg" alt="UPI Payment QR" className="w-56 h-56 md:w-64 md:h-64 object-contain" data-testid="payment-qr-image" />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {lang === "hi" ? `कृपया ${fmt(amt)} का भुगतान करें, फिर नीचे पुष्टि करें` : `Please pay ${fmt(amt)}, then confirm below`}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button data-testid="payment-confirm-btn" onClick={confirmPaid} disabled={submitting}
                    className="h-12 px-8 rounded-full bg-lotusgreen text-white font-bold hover:bg-lotusgreen/90 active:scale-95 transition-[background-color,transform] duration-200 disabled:opacity-60">
                    {submitting ? t("sending") : lang === "hi" ? "मैंने भुगतान कर दिया" : "I Have Completed Payment"}
                  </button>
                  <button data-testid="payment-back-btn" onClick={() => setStep("form")}
                    className="h-12 px-8 rounded-full border border-slate-300 text-slate-600 font-semibold hover:border-saffron hover:text-saffron-dark transition-colors duration-200">
                    {lang === "hi" ? "वापस" : "Back"}
                  </button>
                </div>
              </div>
            )}

            {step === "done" && receipt && (
              <div className="text-center py-4" data-testid="donation-success">
                <span className="inline-flex w-16 h-16 rounded-full bg-lotusgreen/10 items-center justify-center mb-4">
                  <BadgeCheck className="w-9 h-9 text-lotusgreen" />
                </span>
                <h3 className="font-heading text-2xl font-bold text-navy">{t("donation_success")}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {lang === "hi" ? "आपका UPI भुगतान सत्यापन के लिए भेज दिया गया है।" : "Your UPI payment has been submitted for verification."}
                </p>
                <div className="mt-5 inline-block px-6 py-4 rounded-2xl bg-saffron-50 border border-saffron/20">
                  <p className="text-xs text-slate-500">{t("receipt_no")}</p>
                  <p className="font-heading text-xl font-bold text-saffron-dark" data-testid="receipt-number">{receipt.receipt_no}</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-navy">{fmt(receipt.amount)}</p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button data-testid="download-receipt-btn" onClick={downloadReceipt}
                    className="h-12 px-8 rounded-full bg-navy text-white font-semibold hover:bg-navy-light active:scale-95 transition-[background-color,transform] duration-200">
                    {t("download_receipt")}
                  </button>
                  <button data-testid="donate-again-btn" onClick={reset}
                    className="h-12 px-8 rounded-full border border-slate-300 text-slate-600 font-semibold hover:border-saffron hover:text-saffron-dark transition-colors duration-200 inline-flex items-center gap-2 justify-center">
                    <RotateCcw className="w-4 h-4" />{t("donate_again")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
