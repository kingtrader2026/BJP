import { useEffect, useState } from "react";
import { Play, Radio } from "lucide-react";
import { useLang } from "../i18n";
import { SectionHeading } from "../components/SectionHeading";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import api from "../api";

export const Media = () => {
  const { lang, t } = useLang();
  const [media, setMedia] = useState([]);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    api.get("/media").then(({ data }) => setMedia(data)).catch(() => {});
  }, []);

  const byType = (type) => media.filter((m) => m.type === type);
  const live = byType("live")[0];
  const videos = byType("video");
  const photos = byType("photo");

  const VideoCard = ({ m, live: isLive }) => (
    <button onClick={() => setViewer(m)} data-testid={`media-item-${m.id}`}
      className="group relative rounded-2xl overflow-hidden card-shadow border border-slate-200/70 aspect-video text-left w-full hover:-translate-y-1 hover:card-shadow-lg transition-[transform,box-shadow] duration-300">
      <img src={m.thumbnail || m.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-navy/40 group-hover:bg-navy/50 transition-colors duration-300" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="w-14 h-14 rounded-full bg-saffron flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play className="w-6 h-6 text-white ml-1" fill="white" />
        </span>
      </span>
      {isLive && (
        <span className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold" data-testid="live-badge">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />{t("live_now")}
        </span>
      )}
      <span className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-navy/90 to-transparent">
        <span className="block font-heading font-bold text-white text-sm leading-snug">{lang === "hi" ? m.title_hi : m.title_en}</span>
      </span>
    </button>
  );

  return (
    <section id="media" className="py-16 md:py-24 bg-navy" data-testid="media-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading hi="मीडिया गैलरी" en="Media & Live" light />
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="mx-auto flex w-fit bg-white/10 rounded-full p-1 mb-8" data-testid="media-tabs">
            <TabsTrigger value="live" data-testid="media-tab-live" className="rounded-full px-6 text-white data-[state=active]:bg-saffron data-[state=active]:text-white">
              <Radio className="w-4 h-4 mr-2" />{t("live")}
            </TabsTrigger>
            <TabsTrigger value="videos" data-testid="media-tab-videos" className="rounded-full px-6 text-white data-[state=active]:bg-saffron data-[state=active]:text-white">{t("videos")}</TabsTrigger>
            <TabsTrigger value="photos" data-testid="media-tab-photos" className="rounded-full px-6 text-white data-[state=active]:bg-saffron data-[state=active]:text-white">{t("photos")}</TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {live ? (
              <div className="max-w-4xl mx-auto"><VideoCard m={live} live /></div>
            ) : (
              <p className="text-center text-white/60 text-sm py-10">{lang === "hi" ? "अभी कोई लाइव प्रसारण नहीं" : "No live broadcast right now"}</p>
            )}
            {videos.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8 max-w-5xl mx-auto">
                {videos.slice(0, 3).map((m) => <VideoCard key={m.id} m={m} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((m) => <VideoCard key={m.id} m={m} />)}
            </div>
          </TabsContent>

          <TabsContent value="photos">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" data-testid="photo-gallery">
              {photos.map((m) => (
                <button key={m.id} onClick={() => setViewer(m)} data-testid={`media-item-${m.id}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 hover:-translate-y-1 transition-transform duration-300">
                  <img src={m.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-navy/90 to-transparent">
                    <span className="block text-white text-xs font-semibold">{lang === "hi" ? m.title_hi : m.title_en}</span>
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!viewer} onOpenChange={() => setViewer(null)}>
        <DialogContent className="max-w-4xl bg-navy-deep border-white/10 p-2" data-testid="media-viewer">
          {viewer && (
            <div>
              <DialogTitle className="sr-only">{lang === "hi" ? viewer.title_hi : viewer.title_en}</DialogTitle>
              {viewer.type === "photo" ? (
                <img src={viewer.url} alt="" className="w-full max-h-[75vh] object-contain rounded-lg" />
              ) : (
                <video src={viewer.url} controls autoPlay className="w-full max-h-[75vh] rounded-lg" data-testid="media-video-player" />
              )}
              <p className="text-white font-heading font-semibold text-sm px-3 py-2.5">{lang === "hi" ? viewer.title_hi : viewer.title_en}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
