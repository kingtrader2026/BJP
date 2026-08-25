import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Hero } from "../sections/Hero";
import { Leaders } from "../sections/Leaders";
import { LeaderDonation } from "../sections/LeaderDonation";
import { Donation } from "../sections/Donation";
import { About } from "../sections/About";
import { Footprints } from "../sections/Footprints";
import { News } from "../sections/News";
import { Events } from "../sections/Events";
import { Media } from "../sections/Media";

export default function Home() {
  const [donationLeader, setDonationLeader] = useState(null);
  return (
    <div className="min-h-screen" data-testid="home-page">
      <Header />
      <main>
        <Hero />
        <Leaders />
        <LeaderDonation onDonateForLeader={setDonationLeader} />
        <Donation donationLeader={donationLeader} clearDonationLeader={() => setDonationLeader(null)} />
        <About />
        <Footprints />
        <News />
        <Events />
        <Media />
      </main>
      <Footer />
    </div>
  );
}
